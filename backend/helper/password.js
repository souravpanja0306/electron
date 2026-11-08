/*
 * Password hashing with Node's built-in scrypt (no extra dependency).
 * Stored format: "scrypt$<salt hex>$<hash hex>".
 *
 * Older accounts were saved in plain text. verifyPassword() still accepts those, and the
 * caller re-saves them hashed (see needsRehash) on the next successful sign-in.
 */
const crypto = require("crypto");

const PREFIX = "scrypt";
const KEY_LENGTH = 64;

const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(String(password), salt, KEY_LENGTH).toString("hex");
    return `${PREFIX}$${salt}$${hash}`;
};

const isHashed = (stored) => typeof stored === "string" && stored.startsWith(`${PREFIX}$`) && stored.split("$").length === 3;

const safeEqual = (a, b) => {
    const x = Buffer.from(String(a));
    const y = Buffer.from(String(b));
    return x.length === y.length && crypto.timingSafeEqual(x, y);
};

const verifyPassword = (password, stored) => {
    if (!stored || password === undefined || password === null) return false;
    if (!isHashed(stored)) return safeEqual(password, stored); // legacy plain text
    const [, salt, hash] = stored.split("$");
    const candidate = crypto.scryptSync(String(password), salt, KEY_LENGTH).toString("hex");
    return safeEqual(candidate, hash);
};

/** True when a stored password is still plain text and should be re-saved hashed. */
const needsRehash = (stored) => !isHashed(stored);

module.exports = { hashPassword, verifyPassword, needsRehash, isHashed };
