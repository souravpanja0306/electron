/*
 * Small request/response helpers shared by every controller.
 */

/** Error reply in the app's standard shape: { status, message, body: [] }. */
const errorHandler = (res, status, message) => res.status(status).json({ status, message, body: [] });

/** Success reply in the app's standard shape. */
const ok = (res, message, body = []) => res.status(200).json({ status: 200, message, body });

/**
 * A request value as a trimmed string. Objects/arrays become "" so a crafted body such as
 * { "username": { "$ne": "" } } can never reach a database query as an operator.
 */
const str = (value) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "object") return "";
    return String(value).trim();
};

/** A positive integer id, or null. */
const toId = (value) => {
    const n = Number(str(value));
    return Number.isInteger(n) && n > 0 ? n : null;
};

const toNumber = (value) => Number(value) || 0;

/** Money rounding to paise. */
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/** "YYYY-MM-DD" and a real calendar date. */
const isYmd = (value) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str(value));
    if (!m) return false;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]);
};

/** Parses a JSON array (or passes an array through). Anything else is []. */
const parseJsonArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    return [];
};

/** Logs an unexpected failure and replies 500 without leaking internals. */
const serverError = (res, where, error, message = "Something went wrong. Please try again.") => {
    console.log(`Something went wrong: ${where}: ${error?.stack || error}`);
    return errorHandler(res, 500, message);
};

module.exports = { errorHandler, ok, str, toId, toNumber, round2, isYmd, parseJsonArray, serverError };
