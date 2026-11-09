/*
 * Subscription / account lock.
 *
 * The licence server (MongoDB) is the source of truth:
 *   users.is_locked = true            -> "Account locked"         (users.lock_reason is shown)
 *   license.is_active = false         -> "Subscription suspended" (license.suspend_reason is shown)
 *   license.expiry_date + grace_days  -> "Subscription expired"   (warning during the grace days)
 *
 * The answer is cached in memory (re-checked every few minutes) and in SQLite, signed with
 * this installation's secret, so a lock keeps working while the computer is offline. Offline
 * use is allowed for OFFLINE_GRACE_DAYS after the last successful check.
 */
const mongoose = require("mongoose");
const UserModel = require("../database/model/user.model");
const LicenseModel = require("../database/model/license.model");
const { db } = require("../database/connection");
const { signValue } = require("../helper/authToken");

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

const REFRESH_MS = 5 * MINUTE;        // ask the server again after this long
const OFFLINE_RETRY_MS = 1 * MINUTE;  // retry sooner while the server can't be reached
const FORCE_MIN_MS = 10 * 1000;       // "Check again" hits the server at most this often
const OFFLINE_GRACE_DAYS = 7;         // offline use allowed after the last successful check
const WARN_DAYS = 7;                  // warn this many days before the subscription ends

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDay = (ms) => {
    const d = new Date(ms);
    return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/* ------------------------------ server facts ------------------------------ */

// Only the raw facts are stored; evaluate() decides for "now", so an expiry that passes
// while the computer is offline still locks the app.
const factsFrom = (mongoUser, license) => ({
    found_user: Boolean(mongoUser),
    is_locked: Boolean(mongoUser?.is_locked),
    lock_reason: String(mongoUser?.lock_reason || ""),
    has_license: Boolean(license),
    license_active: license ? license.is_active !== false : false,
    suspend_reason: String(license?.suspend_reason || ""),
    plan: String(license?.plan || ""),
    expiry_date: license?.expiry_date ? new Date(license.expiry_date).toISOString() : "",
    grace_days: Number.isFinite(Number(license?.grace_days)) ? Math.max(0, Number(license.grace_days)) : 3,
});

const offlineError = () => Object.assign(new Error("Licence server not connected."), { offline: true });

/** Reads the account and its licence from MongoDB. `checkedAt` is the server's clock. */
const fetchOnline = async (username) => {
    if (mongoose.connection.readyState !== 1) throw offlineError();
    const [mongoUser, hello] = await Promise.all([
        UserModel.findOne({ username: String(username) }).lean().maxTimeMS(5000),
        mongoose.connection.db.command({ hello: 1 }).catch(() => null),
    ]);
    const license = mongoUser?.license_key
        ? await LicenseModel.findOne({ license_key: mongoUser.license_key }).lean().maxTimeMS(5000)
        : null;
    const serverNow = hello?.localTime ? new Date(hello.localTime).getTime() : Date.now();
    return { facts: factsFrom(mongoUser, license), checkedAt: serverNow };
};

/* ------------------------------- local cache ------------------------------ */

const rowSignature = (userId, data, checkedAt) => signValue(`${userId}|${data}|${checkedAt}`);

const saveLocal = (userId, facts, checkedAt) => {
    const data = JSON.stringify(facts);
    const checked = new Date(checkedAt).toISOString();
    db.prepare(`
        INSERT INTO access_status (user_id, data, checked_at, signature) VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, checked_at = excluded.checked_at, signature = excluded.signature
    `).run(userId, data, checked, rowSignature(userId, data, checked));
};

/**
 * The last signed answer for this user: null when there is none, `{ tampered: true }` when
 * the row was edited by hand (or came from another computer's backup).
 */
const loadLocal = (userId) => {
    const row = db.prepare("SELECT data, checked_at, signature FROM access_status WHERE user_id = ?").get(userId);
    if (!row) return null;
    if (row.signature !== rowSignature(userId, row.data, row.checked_at)) return { tampered: true };
    try {
        return { facts: JSON.parse(row.data), checkedAt: Date.parse(row.checked_at) };
    } catch {
        return { tampered: true };
    }
};

/* -------------------------------- decision -------------------------------- */

const LOCKS = {
    ACCOUNT_LOCKED: { title: "Account locked", message: "Your MyERP account has been locked by the administrator." },
    SUBSCRIPTION_SUSPENDED: { title: "Subscription suspended", message: "Your MyERP subscription is on hold." },
    SUBSCRIPTION_EXPIRED: { title: "Subscription expired", message: "Your MyERP subscription has expired. Renew it to continue." },
    NO_SUBSCRIPTION: { title: "No subscription", message: "No subscription was found for this account." },
    ACCOUNT_NOT_FOUND: { title: "Account not found", message: "This account is not registered on the MyERP licence server." },
    VERIFY_ONLINE: {
        title: "Connect to the internet",
        message: "MyERP needs to verify your subscription online. Connect to the internet and press Check again.",
    },
    OFFLINE_TOO_LONG: {
        title: "Connect to the internet",
        message: `MyERP needs to verify your subscription at least once every ${OFFLINE_GRACE_DAYS} days. Connect to the internet and press Check again.`,
    },
};

/**
 * Turns facts into what the app shows:
 *   { locked, state: "active" | "expiring" | "grace" | "locked", code, title, message, reason,
 *     plan, expiry_date, days_left, lock_date, checked_at, offline, offline_days_left }
 */
const evaluate = (entry) => {
    const { facts, checkedAt, offline } = entry;
    // Offline, never trust a clock that runs earlier than the last time the server answered.
    const now = offline ? Math.max(Date.now(), checkedAt || 0) : (checkedAt || Date.now());
    const offlineDeadline = (checkedAt || 0) + OFFLINE_GRACE_DAYS * DAY;
    const result = {
        locked: false,
        state: "active",
        code: "OK",
        title: "",
        message: "",
        reason: "",
        plan: facts?.plan || "",
        expiry_date: facts?.expiry_date || "",
        days_left: null,
        lock_date: "",
        checked_at: checkedAt ? new Date(checkedAt).toISOString() : "",
        offline: Boolean(offline),
        offline_days_left: offline ? Math.max(0, Math.ceil((offlineDeadline - now) / DAY)) : null,
    };
    const lock = (code, extra = {}) => ({ ...result, ...LOCKS[code], ...extra, locked: true, state: "locked", code });

    if (facts?.must_verify) return lock("VERIFY_ONLINE");
    if (facts && !facts.unverified) {
        if (!facts.found_user) return lock("ACCOUNT_NOT_FOUND");
        if (facts.is_locked) return lock("ACCOUNT_LOCKED", { reason: facts.lock_reason });
        if (!facts.has_license) return lock("NO_SUBSCRIPTION");
        if (!facts.license_active) return lock("SUBSCRIPTION_SUSPENDED", { reason: facts.suspend_reason });
    }
    if (offline && now > offlineDeadline) return lock("OFFLINE_TOO_LONG");
    if (!facts || facts.unverified || !facts.expiry_date) return result;

    const expiry = Date.parse(facts.expiry_date);
    const graceUntil = expiry + facts.grace_days * DAY;
    result.days_left = Math.ceil((expiry - now) / DAY);
    result.lock_date = new Date(graceUntil).toISOString();

    if (now > graceUntil) {
        return lock("SUBSCRIPTION_EXPIRED", {
            message: `Your ${facts.plan || "MyERP"} subscription expired on ${formatDay(expiry)}. Renew it to continue using MyERP.`,
        });
    }
    if (now > expiry) {
        return {
            ...result,
            state: "grace",
            title: "Subscription expired",
            message: `Your subscription expired on ${formatDay(expiry)}. MyERP will lock on ${formatDay(graceUntil)} unless it is renewed.`,
        };
    }
    if (result.days_left <= WARN_DAYS) {
        return {
            ...result,
            state: "expiring",
            title: "Subscription ending soon",
            message: `Your subscription ends on ${formatDay(expiry)} (${result.days_left} day${result.days_left === 1 ? "" : "s"} left). Renew to avoid interruption.`,
        };
    }
    return result;
};

/* --------------------------------- caching -------------------------------- */

const memory = new Map();   // user id -> { facts, checkedAt, offline, nextCheckAt, lastAttemptAt }
const inflight = new Map(); // user id -> Promise<entry>

/** Asks the server now. Falls back to the cached answer when it can't be reached. */
const refresh = (user) => {
    if (inflight.has(user.id)) return inflight.get(user.id);
    const startedAt = Date.now();
    const job = fetchOnline(user.username)
        .then(({ facts, checkedAt }) => {
            saveLocal(user.id, facts, checkedAt);
            return { facts, checkedAt, offline: false, nextCheckAt: Date.now() + REFRESH_MS, lastAttemptAt: startedAt };
        })
        .catch((error) => {
            if (!error.offline) console.log(`access: licence check failed: ${error.message || error}`);
            let previous = memory.get(user.id) || loadLocal(user.id);
            if (previous?.tampered) {
                // An edited record never grants offline time: the server has to answer first.
                previous = { facts: { must_verify: true }, checkedAt: 0 };
            } else if (!previous) {
                // Never verified on this computer (e.g. first start after an update, offline):
                // allowed, but the offline allowance starts counting from now.
                previous = { facts: { unverified: true }, checkedAt: Date.now() };
                saveLocal(user.id, previous.facts, previous.checkedAt);
            }
            return { facts: previous.facts, checkedAt: previous.checkedAt, offline: true, nextCheckAt: Date.now() + OFFLINE_RETRY_MS, lastAttemptAt: startedAt };
        })
        .then((entry) => {
            memory.set(user.id, entry);
            return entry;
        })
        .finally(() => inflight.delete(user.id));
    inflight.set(user.id, job);
    return job;
};

/**
 * Access decision for a signed-in SQLite user ({ id, username }). Answers from cache and
 * refreshes in the background when stale; waits for the server only when there is no
 * answer yet, when locked (so an unlock applies at once), or when `force` is set.
 */
const getAccess = async (user, { force = false } = {}) => {
    let entry = memory.get(user.id);
    if (!entry) {
        const local = loadLocal(user.id);
        if (local && !local.tampered) {
            entry = { ...local, offline: false, nextCheckAt: 0, lastAttemptAt: 0 };
            memory.set(user.id, entry);
        }
    }
    if (!entry) {
        entry = await refresh(user);
    } else if (force) {
        if (Date.now() - (entry.lastAttemptAt || 0) >= FORCE_MIN_MS) entry = await refresh(user);
    } else if (Date.now() >= entry.nextCheckAt) {
        if (evaluate(entry).locked) entry = await refresh(user);
        else refresh(user).catch(() => { });
    }
    return evaluate(entry);
};

/** Fresh answer straight from the server (sign-in). Throws when the server can't be reached. */
const checkNow = async (user) => {
    const { facts, checkedAt } = await fetchOnline(user.username);
    saveLocal(user.id, facts, checkedAt);
    const entry = { facts, checkedAt, offline: false, nextCheckAt: Date.now() + REFRESH_MS, lastAttemptAt: Date.now() };
    memory.set(user.id, entry);
    return evaluate(entry);
};

module.exports = { getAccess, checkNow, evaluate, factsFrom, OFFLINE_GRACE_DAYS };
