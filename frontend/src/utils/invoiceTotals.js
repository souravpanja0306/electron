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

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// Rounded to paise exactly like the backend: CGST and SGST are each half the tax.
export const computeInvoiceTotals = (items, sameState) => {
    let quantity = 0;
    let taxable = 0;
    let tax = 0;
    for (const item of items) {
        const line = lineAmounts(item);
        quantity += line.quantity;
        taxable += line.taxable;
        tax += line.tax;
    }
    const half = round2(tax / 2);
    const totals = {
        quantity: round2(quantity),
        taxable: round2(taxable),
        cgst: sameState ? half : 0,
        sgst: sameState ? half : 0,
        igst: sameState ? 0 : round2(tax),
    };
    totals.grand = round2(totals.taxable + totals.cgst + totals.sgst + totals.igst);
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
