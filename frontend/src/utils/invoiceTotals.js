// Invoice tax maths, shared by Create and Edit.
// Mirrors calculateInvoiceTotals() in backend/controller/invoice.controller.js so the
// numbers on screen match what gets saved; keep the two in sync.

const norm = (value) => (value || "").toString().toLowerCase().trim();

/**
 * CGST + SGST when the company and the billed party are in the same state, IGST otherwise.
 * Before both are chosen we assume intra-state, which is the common case.
 */
export const isSameState = (company, party) => {
    if (!company || !party) return true;
    return norm(company.state) === norm(party.state);
};

export const lineAmounts = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const gstRate = parseFloat(item.gst) || 0;
    const taxable = quantity * rate;
    const tax = taxable * (gstRate / 100);
    return { quantity, rate, gstRate, taxable, tax, total: taxable + tax };
};

export const computeInvoiceTotals = (items, sameState) => {
    const totals = { quantity: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, grand: 0 };
    for (const item of items) {
        const { quantity, taxable, tax } = lineAmounts(item);
        totals.quantity += quantity;
        totals.taxable += taxable;
        if (sameState) {
            totals.cgst += tax / 2;
            totals.sgst += tax / 2;
        } else {
            totals.igst += tax;
        }
    }
    totals.grand = totals.taxable + totals.cgst + totals.sgst + totals.igst;
    return totals;
};

export const newInvoiceRow = () => ({
    id: Math.floor(Math.random() * 10000000000),
    description: "",
    hsn: "",
    quantity: "",
    rate: "",
    gst: 0,
});

// Item rows as the backend expects them (it recomputes the totals itself).
export const toInvoicePayloadItems = (items) =>
    items.map((item, index) => {
        const { quantity, rate, gstRate, total } = lineAmounts(item);
        return {
            id: item.id,
            sl_no: index + 1,
            description: item.description || "",
            hsn: item.hsn || "",
            quantity,
            rate,
            gst: gstRate,
            total: Math.round(total * 100) / 100,
        };
    });

// Grand total of a saved invoice row from the list API (total_amount is the taxable value).
export const invoiceGrandTotal = (invoice) =>
    (Number(invoice.total_amount) || 0) +
    (Number(invoice.total_cgst) || 0) +
    (Number(invoice.total_sgst) || 0) +
    (Number(invoice.total_igst) || 0);
