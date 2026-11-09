/*
 * Invoice / credit note / debit note line items and GST totals, shared by the
 * invoice and note controllers so every document is calculated the same way.
 */
const { str, toNumber, round2, parseJsonArray } = require("./http");

// Parses the item rows and drops rows the user left completely empty.
const normaliseInvoiceItems = (data) => parseJsonArray(data)
    .filter((row) => row && (str(row.description) || toNumber(row.quantity) || toNumber(row.rate)))
    .map((row, index) => {
        const quantity = toNumber(row.quantity);
        const rate = toNumber(row.rate);
        const gst = toNumber(row.gst);
        const taxable = quantity * rate;
        return {
            id: row.id ?? Date.now() + index,
            sl_no: index + 1,
            description: str(row.description),
            hsn: str(row.hsn),
            quantity,
            rate,
            gst,
            total: round2(taxable * (1 + gst / 100)),
        };
    });

const validateItems = (items) => {
    if (!items.length) return "Add at least one item.";
    if (items.some((item) => !item.description)) return "Every item needs a description.";
    if (items.some((item) => item.quantity < 0 || item.rate < 0)) return "Quantity and rate must be zero or more.";
    if (items.some((item) => item.gst < 0 || item.gst > 100)) return "GST rate must be between 0 and 100.";
    return "";
};

const normState = (value) => String(value || "").toLowerCase().trim();

/**
 * CGST+SGST when company and party are in the same state, otherwise IGST. Amounts are
 * rounded to paise; CGST and SGST are each half the tax, rounded the same way.
 * The frontend mirrors this in utils/invoiceTotals.js; keep them in sync.
 */
const calculateInvoiceTotals = ({ items, company, party }) => {
    const sameState = normState(company?.state) === normState(party?.state);
    let quantity = 0;
    let taxable = 0;
    let tax = 0;
    for (const item of items) {
        const subtotal = item.quantity * item.rate;
        quantity += item.quantity;
        taxable += subtotal;
        tax += subtotal * (item.gst / 100);
    };
    const half = round2(tax / 2);
    return {
        total_quantity: round2(quantity),
        total_amount: round2(taxable),
        total_cgst: sameState ? half : 0,
        total_sgst: sameState ? half : 0,
        total_igst: sameState ? 0 : round2(tax),
    };
};

module.exports = { normaliseInvoiceItems, validateItems, calculateInvoiceTotals };
