/*
 * Field normalisers and validators for Indian business data.
 * Validators return "" when the value is valid (or empty — use `required` for presence),
 * otherwise a short message suitable for showing under the field.
 */

const GSTIN_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* ------------------------------ Normalisers ------------------------------ */

export const onlyDigits = (value, max) => String(value || "").replace(/\D/g, "").slice(0, max);
export const upperAlnum = (value, max) => String(value || "").toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, max);
export const trimAll = (obj) =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));

/* ------------------------------- Validators ------------------------------ */

export const required = (value, label = "This field") => (String(value ?? "").trim() ? "" : `${label} is required.`);

export const mobile = (value) =>
    !value || /^[6-9]\d{9}$/.test(value) ? "" : "Enter a valid 10-digit mobile number.";

export const email = (value) =>
    !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? "" : "Enter a valid email address.";

export const pincode = (value) =>
    !value || /^[1-9]\d{5}$/.test(value) ? "" : "Pincode must be 6 digits.";

export const pan = (value) =>
    !value || /^[A-Z]{5}\d{4}[A-Z]$/.test(value) ? "" : "PAN format is AAAAA9999A.";

export const ifsc = (value) =>
    !value || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value) ? "" : "IFSC format is ABCD0123456.";

export const accountNo = (value) =>
    !value || /^\d{9,18}$/.test(value) ? "" : "Account number must be 9–18 digits.";

/** GSTIN check character (15th) computed from the first 14 characters. */
export const gstinCheckChar = (first14) => {
    let sum = 0;
    for (let i = 0; i < 14; i++) {
        const value = GSTIN_CHARS.indexOf(first14[i]);
        if (value < 0) return null;
        const product = value * (i % 2 === 0 ? 1 : 2);
        sum += Math.floor(product / 36) + (product % 36);
    }
    return GSTIN_CHARS[(36 - (sum % 36)) % 36];
};

export const gstin = (value) => {
    if (!value) return "";
    if (!/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value)) return "GSTIN must be 15 characters, e.g. 27AAPFU0939F1ZV.";
    if (gstinCheckChar(value.slice(0, 14)) !== value[14]) return "GSTIN check digit doesn't match — please re-check it.";
    return "";
};

/** PAN embedded in a well-formed GSTIN (characters 3–12), or "". */
export const panFromGstin = (value) => (/^\d{2}[A-Z]{5}\d{4}[A-Z]/.test(value || "") ? value.slice(2, 12) : "");

/** Percentage between 0 and `max`. */
export const percent = (value, max = 100) => {
    if (value === "" || value == null) return "";
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= max ? "" : `Enter a rate between 0 and ${max}.`;
};

/**
 * Runs `rules` ({ field: [validator, ...] }) over `data` and returns { field: message }
 * for every field that fails (first failing rule wins).
 */
export const validate = (data, rules) => {
    const errors = {};
    for (const [field, checks] of Object.entries(rules)) {
        for (const check of checks) {
            const message = check(data[field], data);
            if (message) {
                errors[field] = message;
                break;
            }
        }
    }
    return errors;
};
