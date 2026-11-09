/*
 * Sign-in tokens.
 *
 * The signing secret comes from JWT_SECRET in .env, or else a random secret generated once
 * per installation and kept next to the database (never in the source code).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { dbPath } = require("../database/connection");

const TOKEN_LIFETIME = "30d";
const SECRET_FILE = path.join(path.dirname(dbPath), ".jwt-secret");

const loadSecret = () => {
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) return process.env.JWT_SECRET;
    try {
        const saved = fs.readFileSync(SECRET_FILE, "utf8").trim();
        if (saved.length >= 32) return saved;
    } catch (e) { /* first run */ }
    const secret = crypto.randomBytes(48).toString("hex");
    fs.writeFileSync(SECRET_FILE, secret, { mode: 0o600 });
    return secret;
};

const SECRET = loadSecret();

/** Token for a SQLite `users` row. Claim names are kept for compatibility with older code. */
const signUserToken = (user) => jwt.sign({
    TOKEN_UID: user.id,
    TOKEN_MOBILE: user.mobile,
    TONEN_USERNAME: user.username,
    TONEN_NAME: user.name,
}, SECRET, { expiresIn: TOKEN_LIFETIME });

const verifyUserToken = (token) => jwt.verify(token, SECRET);

/** HMAC of a string with this installation's secret (used to detect hand-edited local records). */
const signValue = (value) => crypto.createHmac("sha256", SECRET).update(String(value)).digest("hex");

module.exports = { signUserToken, verifyUserToken, signValue };
