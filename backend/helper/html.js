/*
 * Helpers for the printable HTML (invoice, challan, money receipt).
 * Every value typed by a user must go through esc() before it is placed in the page:
 * the HTML is written into a live window, so unescaped text could break the layout or run script.
 */

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

const esc = (value) => (value === undefined || value === null ? "" : String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]));

/** Shallow copy with every string value escaped (numbers, booleans and nested objects untouched). */
const escObj = (obj) => {
    if (!obj || typeof obj !== "object") return {};
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === "string" ? esc(v) : v]));
};

/** Escapes and keeps line breaks (for terms / notes typed in a textarea). */
const multiline = (value) => esc(value).replace(/\r?\n/g, "<br />");

const money = (value) => (Number(value) || 0).toFixed(2);

/** Public URL of an uploaded logo, or "" when there is none. */
const uploadUrl = (folder, fileName) => {
    if (!fileName || fileName === "null" || fileName === "undefined") return "";
    return `http://localhost:${process.env.PORT || 3001}/uploads/${folder}/${encodeURIComponent(fileName)}`;
};

module.exports = { esc, escObj, multiline, money, uploadUrl };
