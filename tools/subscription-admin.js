#!/usr/bin/env node
/*
 * MyERP subscription admin (runs on YOUR computer, not shipped inside the app).
 *
 *   npm run subs -- <command> <username> [value]
 *
 *   status   <username>                 Show account + subscription and what the app will do
 *   list     [locked|expired|expiring]  List accounts (all when no filter)
 *   lock     <username> [reason...]     Lock the account on every device
 *   unlock   <username>                 Remove the lock
 *   suspend  <username> [reason...]     Put the subscription on hold (e.g. payment pending)
 *   resume   <username>                 Re-activate the subscription
 *   extend   <username> <days>          Add days (from today if already expired)
 *   expiry   <username> <YYYY-MM-DD>    Set the exact end date
 *   plan     <username> <FREE|PRO|ENTERPRISE>
 *   grace    <username> <days>          Days the app keeps working after expiry (default 3)
 *
 * Changes reach a running app within about 5 minutes, or at once with "Check again" on the
 * lock screen. Reads MONGODB_URI from the project's .env.
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const mongoose = require("mongoose");
const UserModel = require("../backend/database/model/user.model");
const LicenseModel = require("../backend/database/model/license.model");

mongoose.set("sanitizeFilter", true);

const DAY = 86400000;
const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "-");
const fail = (message) => { console.error(`\n  ${message}\n`); process.exitCode = 1; };

/** Same rules as the app (backend/service/access.service.js), for display. */
const verdict = (user, license) => {
    if (user.is_locked) return `LOCKED (account)${user.lock_reason ? `: ${user.lock_reason}` : ""}`;
    if (!license) return "LOCKED (no subscription)";
    if (license.is_active === false) return `LOCKED (suspended)${license.suspend_reason ? `: ${license.suspend_reason}` : ""}`;
    const expiry = new Date(license.expiry_date).getTime();
    const graceUntil = expiry + (license.grace_days ?? 3) * DAY;
    const now = Date.now();
    if (now > graceUntil) return `LOCKED (expired ${fmt(expiry)})`;
    if (now > expiry) return `GRACE until ${fmt(graceUntil)}, then locked`;
    const left = Math.ceil((expiry - now) / DAY);
    return left <= 7 ? `ACTIVE, ${left} day(s) left` : `ACTIVE (${left} days left)`;
};

const load = async (username) => {
    if (!username) throw new Error("Username is required.");
    const user = await UserModel.findOne({ username: String(username) });
    if (!user) throw new Error(`No account with username "${username}".`);
    const license = await LicenseModel.findOne({ license_key: user.license_key });
    return { user, license };
};

const show = (user, license) => {
    console.log(`
  ${user.username}  (${user.name}, ${user.email}, ${user.mobile})
  Plan      : ${license?.plan || "-"}
  Valid     : ${fmt(license?.start_date)} to ${fmt(license?.expiry_date)}  (grace ${license?.grace_days ?? "-"} days)
  Account   : ${user.is_locked ? `locked ${fmt(user.locked_at)}` : "open"}
  App status: ${verdict(user, license)}
`);
};

const needLicense = (license) => { if (!license) throw new Error("This account has no subscription record."); return license; };

const COMMANDS = {
    status: async ([username]) => { const { user, license } = await load(username); show(user, license); },

    list: async ([filter = ""]) => {
        const users = await UserModel.find({}).sort({ username: 1 }).lean();
        const licenses = new Map((await LicenseModel.find({}).lean()).map((l) => [l.license_key, l]));
        const rows = users.map((u) => ({ u, l: licenses.get(u.license_key), v: verdict(u, licenses.get(u.license_key)) }))
            .filter(({ v }) => !filter
                || (filter === "locked" && v.startsWith("LOCKED"))
                || (filter === "expired" && (v.startsWith("LOCKED (expired") || v.startsWith("GRACE")))
                || (filter === "expiring" && /day\(s\) left|GRACE/.test(v)));
        if (!rows.length) return console.log("\n  No matching accounts.\n");
        console.log("");
        for (const { u, l, v } of rows) console.log(`  ${u.username.padEnd(20)} ${(l?.plan || "-").padEnd(10)} ends ${fmt(l?.expiry_date)}   ${v}`);
        console.log(`\n  ${rows.length} account(s)\n`);
    },

    lock: async ([username, ...reason]) => {
        const { user, license } = await load(username);
        Object.assign(user, { is_locked: true, lock_reason: reason.join(" "), locked_at: new Date() });
        await user.save();
        show(user, license);
    },

    unlock: async ([username]) => {
        const { user, license } = await load(username);
        Object.assign(user, { is_locked: false, lock_reason: "", locked_at: null });
        await user.save();
        show(user, license);
    },

    suspend: async ([username, ...reason]) => {
        const { user, license } = await load(username);
        Object.assign(needLicense(license), { is_active: false, suspend_reason: reason.join(" ") });
        await license.save();
        show(user, license);
    },

    resume: async ([username]) => {
        const { user, license } = await load(username);
        Object.assign(needLicense(license), { is_active: true, suspend_reason: "" });
        await license.save();
        show(user, license);
    },

    extend: async ([username, days]) => {
        const n = Number(days);
        if (!Number.isInteger(n) || n < 1 || n > 3650) throw new Error("Days must be a whole number from 1 to 3650.");
        const { user, license } = await load(username);
        needLicense(license);
        const from = Math.max(Date.now(), new Date(license.expiry_date).getTime());
        license.expiry_date = new Date(from + n * DAY);
        await license.save();
        show(user, license);
    },

    expiry: async ([username, date]) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || "")) || Number.isNaN(Date.parse(date))) throw new Error("Date must be YYYY-MM-DD.");
        const { user, license } = await load(username);
        needLicense(license).expiry_date = new Date(`${date}T23:59:59`);
        await license.save();
        show(user, license);
    },

    plan: async ([username, plan]) => {
        const value = String(plan || "").toUpperCase();
        if (!["FREE", "PRO", "ENTERPRISE"].includes(value)) throw new Error("Plan must be FREE, PRO or ENTERPRISE.");
        const { user, license } = await load(username);
        needLicense(license).plan = value;
        await license.save();
        show(user, license);
    },

    grace: async ([username, days]) => {
        const n = Number(days);
        if (!Number.isInteger(n) || n < 0 || n > 90) throw new Error("Grace days must be a whole number from 0 to 90.");
        const { user, license } = await load(username);
        needLicense(license).grace_days = n;
        await license.save();
        show(user, license);
    },
};

(async () => {
    const [command, ...args] = process.argv.slice(2);
    if (!COMMANDS[command]) {
        console.log(require("fs").readFileSync(__filename, "utf8").split("*/")[0].replace(/^#!.*\n\/\*/, "").replace(/^ \* ?/gm, ""));
        return;
    }
    if (!process.env.MONGODB_URI) return fail("MONGODB_URI is missing from .env.");
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
        await COMMANDS[command](args);
    } catch (error) {
        fail(error.message || String(error));
    } finally {
        await mongoose.disconnect().catch(() => { });
    }
})();
