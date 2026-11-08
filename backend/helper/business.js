/*
 * Parties and companies share one set of fields. This file normalises and validates them
 * once, so both controllers store the same clean data.
 */
const { db } = require("../database/connection");
const { str } = require("./http");

const BUSINESS_FIELDS = [
    "company_name", "email", "mobile", "owner",
    "address_1", "address_2", "city", "state", "district", "pincode", "country",
    "gst", "pan", "trade_licence",
    "bank", "ifse", "branch", "account_no",
];

const UPPER = new Set(["gst", "pan", "ifse"]);

const RULES = {
    company_name: (v) => (v ? "" : "Name is required."),
    mobile: (v) => (!v || /^[6-9]\d{9}$/.test(v) ? "" : "Enter a valid 10-digit mobile number."),
    email: (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter a valid email address."),
    pincode: (v) => (!v || /^[1-9]\d{5}$/.test(v) ? "" : "Pincode must be 6 digits."),
    gst: (v) => (!v || /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v) ? "" : "GSTIN must be 15 characters (e.g. 19ABCDE1234F1Z5)."),
    pan: (v) => (!v || /^[A-Z]{5}\d{4}[A-Z]$/.test(v) ? "" : "PAN format is AAAAA9999A."),
    ifse: (v) => (!v || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v) ? "" : "IFSC format is ABCD0123456."),
    account_no: (v) => (!v || /^\d{9,18}$/.test(v) ? "" : "Account number must be 9 to 18 digits."),
};

/**
 * The business fields from a request body, trimmed (GSTIN / PAN / IFSC upper-cased).
 * With `partial`, fields the client did not send are left out (so an update keeps them).
 */
const pickBusiness = (body = {}, { partial = false } = {}) => {
    const data = {};
    for (const field of BUSINESS_FIELDS) {
        if (partial && body[field] === undefined) continue;
        let value = str(body[field]);
        if (UPPER.has(field)) value = value.toUpperCase();
        data[field] = value;
    };
    if ("country" in data && !data.country) data.country = "INDIA";
    return data;
};

/** First validation message for the given data, or "". Only fields present are checked. */
const validateBusiness = (data, nameLabel = "Name") => {
    for (const [field, rule] of Object.entries(RULES)) {
        if (!(field in data)) continue;
        const message = rule(data[field]);
        if (message) return field === "company_name" ? `${nameLabel} is required.` : message;
    };
    return "";
};

/**
 * How many live documents point at a party or company. Used to refuse a delete that would
 * leave invoices, challans or receipts without their party/company.
 */
const countReferences = (kind, id) => {
    if (kind === "party") {
        return {
            invoices: db.prepare("SELECT COUNT(*) AS n FROM invoice WHERE is_deleted = 0 AND (party_id = ? OR ship_to = CAST(? AS TEXT))").get(id, id).n,
            challans: db.prepare("SELECT COUNT(*) AS n FROM challan WHERE is_deleted = 0 AND (consignor_id = ? OR consignee_id = ?)").get(id, id).n,
            receipts: db.prepare("SELECT COUNT(*) AS n FROM money_receipts WHERE is_deleted = 0 AND party_id = ?").get(id).n,
        };
    };
    return {
        invoices: db.prepare("SELECT COUNT(*) AS n FROM invoice WHERE is_deleted = 0 AND company_id = ?").get(id).n,
        challans: db.prepare("SELECT COUNT(*) AS n FROM challan WHERE is_deleted = 0 AND company_id = ?").get(id).n,
        receipts: db.prepare("SELECT COUNT(*) AS n FROM money_receipts WHERE is_deleted = 0 AND company_id = ?").get(id).n,
    };
};

/** "3 invoices and 1 challan" for a refusal message, or "" when nothing refers to it. */
const describeReferences = ({ invoices = 0, challans = 0, receipts = 0 }) => {
    const parts = [];
    const add = (n, one, many) => n && parts.push(`${n} ${n === 1 ? one : many}`);
    add(invoices, "invoice", "invoices");
    add(challans, "challan", "challans");
    add(receipts, "money receipt", "money receipts");
    if (!parts.length) return "";
    return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
};

module.exports = { BUSINESS_FIELDS, pickBusiness, validateBusiness, countReferences, describeReferences };
