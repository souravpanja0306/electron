// Reports: debtors, customer ledger, dashboard statistics, sales register.
const { db } = require("../database/connection");

// What the customer owes for an invoice: taxable value + GST. Must match
// invoiceGrandTotal() in frontend/src/utils/invoiceTotals.js.
const GRAND_TOTAL = "(COALESCE(total_amount, 0) + COALESCE(total_cgst, 0) + COALESCE(total_sgst, 0) + COALESCE(total_igst, 0))";

// Credit / debit notes (invoice_note) adjust a party's balance: a debit note adds to what
// the party owes like an invoice, a credit note reduces it like a payment.

module.exports.getDebtors = async ({
    created_by = "",
    company_id = ""
}) => {
    try {
        const userFilter = created_by ? " AND created_by = ?" : "";
        const companyFilter = company_id ? " AND company_id = ?" : "";
        const invoiceParams = [...(created_by ? [created_by] : []), ...(company_id ? [company_id] : [])];
        const receiptParams = [...(created_by ? [created_by] : []), ...(company_id ? [company_id] : [])];
        const partyParams = created_by ? [created_by] : [];
        const rows = db.prepare(`
            WITH invoice_totals AS (
                SELECT party_id, SUM(${GRAND_TOTAL}) AS total_invoice
                FROM invoice
                WHERE is_deleted = 0${userFilter}${companyFilter}
                GROUP BY party_id
            ), receipt_totals AS (
                SELECT party_id, SUM(total_value) AS total_payment
                FROM money_receipts
                WHERE is_deleted = 0${userFilter}${companyFilter}
                GROUP BY party_id
            ), note_totals AS (
                SELECT party_id,
                       SUM(CASE WHEN note_type = 'debit' THEN ${GRAND_TOTAL} ELSE 0 END) AS total_debit_note,
                       SUM(CASE WHEN note_type = 'credit' THEN ${GRAND_TOTAL} ELSE 0 END) AS total_credit_note
                FROM invoice_note
                WHERE is_deleted = 0${userFilter}${companyFilter}
                GROUP BY party_id
            )
            SELECT
                p.id AS party_id,
                p.company_name,
                COALESCE(i.total_invoice, 0) + COALESCE(n.total_debit_note, 0) AS total_invoice,
                COALESCE(r.total_payment, 0) + COALESCE(n.total_credit_note, 0) AS total_payment,
                COALESCE(n.total_debit_note, 0) AS total_debit_note,
                COALESCE(n.total_credit_note, 0) AS total_credit_note,
                COALESCE(i.total_invoice, 0) + COALESCE(n.total_debit_note, 0)
                    - COALESCE(r.total_payment, 0) - COALESCE(n.total_credit_note, 0) AS total_due
            FROM party p
            LEFT JOIN invoice_totals i ON i.party_id = p.id
            LEFT JOIN receipt_totals r ON r.party_id = p.id
            LEFT JOIN note_totals n ON n.party_id = p.id
            WHERE p.is_deleted = 0${userFilter}
              AND (COALESCE(i.total_invoice, 0) <> 0 OR COALESCE(r.total_payment, 0) <> 0
                   OR COALESCE(n.total_debit_note, 0) <> 0 OR COALESCE(n.total_credit_note, 0) <> 0)
            ORDER BY total_due DESC, p.company_name COLLATE NOCASE
        `).all(...invoiceParams, ...receiptParams, ...receiptParams, ...partyParams);

        const totals = rows.reduce((summary, row) => ({
            total_invoice: summary.total_invoice + Number(row.total_invoice || 0),
            total_payment: summary.total_payment + Number(row.total_payment || 0),
            total_due: summary.total_due + Number(row.total_due || 0)
        }), { total_invoice: 0, total_payment: 0, total_due: 0 });

        return {
            ledger: rows,
            totals
        };
    } catch (error) {
        console.log("Something went wrong: Service: getDebtors", error);
        throw error;
    };
};

module.exports.getDebtorsDetails = async ({
    party_id = "",
    created_by = "",
    company_id = ""
}) => {
    try {
        const party = db.prepare(`SELECT * FROM party WHERE id = ? AND is_deleted = 0${created_by ? " AND created_by = ?" : ""}`).get(...(created_by ? [party_id, created_by] : [party_id]));
        const userFilter = created_by ? " AND created_by = ?" : "";
        const companyFilter = company_id ? " AND company_id = ?" : "";
        const stmt = db.prepare(`
            SELECT id, invoice_date AS date, 'Invoice #' || invoice_no AS description, ${GRAND_TOTAL} AS dr, 0 AS cr, 'invoice' AS entry_type FROM invoice WHERE party_id = ? AND is_deleted = 0${userFilter}${companyFilter}
            UNION ALL
            SELECT id, receipt_date AS date, 'Payment #' || receipt_no AS description, 0 AS dr, total_value AS cr, 'receipt' AS entry_type FROM money_receipts WHERE party_id = ? AND is_deleted = 0${userFilter}${companyFilter}
            UNION ALL
            SELECT id, note_date AS date,
                   CASE WHEN note_type = 'debit' THEN 'Debit Note #' ELSE 'Credit Note #' END || note_no AS description,
                   CASE WHEN note_type = 'debit' THEN ${GRAND_TOTAL} ELSE 0 END AS dr,
                   CASE WHEN note_type = 'credit' THEN ${GRAND_TOTAL} ELSE 0 END AS cr,
                   note_type || '_note' AS entry_type
            FROM invoice_note WHERE party_id = ? AND is_deleted = 0${userFilter}${companyFilter}
            ORDER BY date ASC, entry_type ASC, id ASC
        `);

        const totalStmt = db.prepare(`
            SELECT 
                IFNULL((SELECT SUM(${GRAND_TOTAL}) FROM invoice WHERE party_id = ? AND is_deleted = 0${userFilter}${companyFilter}), 0)
                  + IFNULL((SELECT SUM(${GRAND_TOTAL}) FROM invoice_note WHERE note_type = 'debit' AND party_id = ? AND is_deleted = 0${userFilter}${companyFilter}), 0) AS total_dr,
                IFNULL((SELECT SUM(total_value) FROM money_receipts WHERE party_id = ? AND is_deleted = 0${userFilter}${companyFilter}), 0)
                  + IFNULL((SELECT SUM(${GRAND_TOTAL}) FROM invoice_note WHERE note_type = 'credit' AND party_id = ? AND is_deleted = 0${userFilter}${companyFilter}), 0) AS total_cr
        `);

        const queryParams = (includePartyId) => [
            ...(includePartyId ? [party_id] : []),
            ...(created_by ? [created_by] : []),
            ...(company_id ? [company_id] : [])
        ];
        const totals = totalStmt.get(...queryParams(true), ...queryParams(true), ...queryParams(true), ...queryParams(true));
        const rows = stmt.all(...queryParams(true), ...queryParams(true), ...queryParams(true));

        return {
            party: party,
            ledger: rows,
            totals: {
                total_dr: totals.total_dr ? totals.total_dr : 0,
                total_cr: totals.total_cr ? totals.total_cr : 0,
                balance: totals.total_dr - totals.total_cr
            },
        };
    } catch (error) {
        console.log("Something went wrong: Service: getDebtorsDetails", error);
        throw error;
    };
};


/* ------------------------------------------------------------------------ */
/* Shared helpers                                                            */
/* ------------------------------------------------------------------------ */

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseYmd = (s) => {
    const [y, m, d] = String(s).split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
};
const isYmd = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));

/** Default period: the current Indian financial year to today. */
const resolvePeriod = (from, to) => {
    const today = new Date();
    const fyStart = new Date(today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1, 3, 1);
    const start = isYmd(from) ? from : ymd(fyStart);
    const end = isYmd(to) ? to : ymd(today);
    // The previous period has the same length and ends the day before `start`.
    const days = Math.max(1, Math.round((parseYmd(end) - parseYmd(start)) / 86400000) + 1);
    const prevEnd = new Date(parseYmd(start)); prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - (days - 1));
    return { from: start, to: end, prevFrom: ymd(prevStart), prevTo: ymd(prevEnd), days };
};

/** " AND x.created_by = ? AND x.company_id = ?" + params, for the given table alias. */
const scope = (alias, { created_by, company_id }) => {
    let sql = "";
    const params = [];
    if (created_by) { sql += ` AND ${alias}.created_by = ?`; params.push(created_by); }
    if (company_id) { sql += ` AND ${alias}.company_id = ?`; params.push(company_id); }
    return { sql, params };
};

const grandOf = (alias) => GRAND_TOTAL.replace(/(total_\w+)/g, `${alias}.$1`);
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/* ------------------------------------------------------------------------ */
/* Dashboard                                                                 */
/* ------------------------------------------------------------------------ */

const AGING_BUCKETS = [
    { key: "0_30", label: "0–30 days", min: 0, max: 30 },
    { key: "31_60", label: "31–60 days", min: 31, max: 60 },
    { key: "61_90", label: "61–90 days", min: 61, max: 90 },
    { key: "90_plus", label: "Over 90 days", min: 91, max: Infinity },
];

/**
 * Receivables aging with each party's payments applied to its oldest invoices first (FIFO),
 * so a paid invoice never shows as overdue.
 */
const receivablesAging = (filters) => {
    const inv = scope("i", filters);
    const rec = scope("r", filters);
    const note = scope("n", filters);
    const invoices = db.prepare(`
        SELECT party_id, date, amount FROM (
            SELECT i.party_id, i.invoice_date AS date, ${grandOf("i")} AS amount, 0 AS kind, i.id
            FROM invoice i WHERE i.is_deleted = 0${inv.sql}
            UNION ALL
            SELECT n.party_id, n.note_date, (COALESCE(n.total_amount, 0) + COALESCE(n.total_cgst, 0) + COALESCE(n.total_sgst, 0) + COALESCE(n.total_igst, 0)), 1, n.id
            FROM invoice_note n WHERE n.is_deleted = 0 AND n.note_type = 'debit'${note.sql}
        ) ORDER BY party_id, date, kind, id
    `).all(...inv.params, ...note.params);
    const paidByParty = new Map(db.prepare(`
        SELECT party_id, SUM(paid) AS paid FROM (
            SELECT r.party_id, r.total_value AS paid
            FROM money_receipts r WHERE r.is_deleted = 0${rec.sql}
            UNION ALL
            SELECT n.party_id, (COALESCE(n.total_amount, 0) + COALESCE(n.total_cgst, 0) + COALESCE(n.total_sgst, 0) + COALESCE(n.total_igst, 0))
            FROM invoice_note n WHERE n.is_deleted = 0 AND n.note_type = 'credit'${note.sql}
        ) GROUP BY party_id
    `).all(...rec.params, ...note.params).map((row) => [row.party_id, Number(row.paid) || 0]));

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const buckets = AGING_BUCKETS.map((b) => ({ ...b, amount: 0, invoices: 0 }));
    const partiesWithDues = new Set();
    let advances = 0;

    const byParty = new Map();
    for (const row of invoices) {
        if (!byParty.has(row.party_id)) byParty.set(row.party_id, []);
        byParty.get(row.party_id).push(row);
    }
    for (const [partyId, rows] of byParty) {
        let credit = paidByParty.get(partyId) || 0;
        for (const row of rows) {
            const amount = Number(row.amount) || 0;
            const applied = Math.min(credit, amount);
            credit -= applied;
            const open = round2(amount - applied);
            if (open <= 0) continue;
            partiesWithDues.add(partyId);
            const age = isYmd(row.date) ? Math.max(0, Math.floor((today - parseYmd(row.date)) / 86400000)) : 0;
            const bucket = buckets.find((b) => age >= b.min && age <= b.max) || buckets[0];
            bucket.amount += open;
            bucket.invoices += 1;
        }
        advances += credit; // paid more than invoiced
    }
    // Receipts from parties with no invoices at all are advances too.
    for (const [partyId, paid] of paidByParty) if (!byParty.has(partyId)) advances += paid;

    return {
        buckets: buckets.map(({ key, label, amount, invoices: count }) => ({ key, label, amount: round2(amount), invoices: count })),
        outstanding: round2(buckets.reduce((sum, b) => sum + b.amount, 0)),
        partiesWithDues: partiesWithDues.size,
        advances: round2(advances),
    };
};

module.exports.getDashboardStats = async ({ created_by = "", company_id = "", from = "", to = "" } = {}) => {
    try {
        const filters = { created_by, company_id };
        const period = resolvePeriod(from, to);
        const inv = scope("i", filters);
        const rec = scope("r", filters);
        const chl = scope("c", filters);

        const salesIn = (a, b) => db.prepare(`
            SELECT COUNT(*) AS count, IFNULL(SUM(${grandOf("i")}), 0) AS total,
                   IFNULL(SUM(COALESCE(i.total_amount, 0)), 0) AS taxable
            FROM invoice i WHERE i.is_deleted = 0 AND i.invoice_date BETWEEN ? AND ?${inv.sql}
        `).get(a, b, ...inv.params);
        const receiptsIn = (a, b) => db.prepare(`
            SELECT COUNT(*) AS count, IFNULL(SUM(r.total_value), 0) AS total
            FROM money_receipts r WHERE r.is_deleted = 0 AND r.receipt_date BETWEEN ? AND ?${rec.sql}
        `).get(a, b, ...rec.params);
        const challansIn = (a, b) => db.prepare(`
            SELECT COUNT(*) AS count, IFNULL(SUM(COALESCE(c.total_amount, 0)), 0) AS total
            FROM challan c WHERE c.is_deleted = 0 AND c.date BETWEEN ? AND ?${chl.sql}
        `).get(a, b, ...chl.params);

        const sales = salesIn(period.from, period.to);
        const prevSales = salesIn(period.prevFrom, period.prevTo);
        const receipts = receiptsIn(period.from, period.to);
        const prevReceipts = receiptsIn(period.prevFrom, period.prevTo);
        const challans = challansIn(period.from, period.to);

        // Challans not yet billed (all time): work done but not invoiced.
        const unbilled = db.prepare(`
            SELECT COUNT(*) AS count, IFNULL(SUM(COALESCE(c.total_amount, 0)), 0) AS total
            FROM challan c WHERE c.is_deleted = 0 AND COALESCE(c.invoiced, 0) = 0${chl.sql}
        `).get(...chl.params);

        // Twelve months up to the end of the period, with empty months filled in.
        const end = parseYmd(period.to);
        const months = [];
        for (let k = 11; k >= 0; k--) {
            const d = new Date(end.getFullYear(), end.getMonth() - k, 1);
            months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
        }
        const firstDay = `${months[0]}-01`;
        const lastDay = ymd(new Date(end.getFullYear(), end.getMonth() + 1, 0));
        const salesByMonth = new Map(db.prepare(`
            SELECT substr(i.invoice_date, 1, 7) AS ym, SUM(${grandOf("i")}) AS total
            FROM invoice i WHERE i.is_deleted = 0 AND i.invoice_date BETWEEN ? AND ?${inv.sql}
            GROUP BY ym
        `).all(firstDay, lastDay, ...inv.params).map((r) => [r.ym, Number(r.total) || 0]));
        const receiptsByMonth = new Map(db.prepare(`
            SELECT substr(r.receipt_date, 1, 7) AS ym, SUM(r.total_value) AS total
            FROM money_receipts r WHERE r.is_deleted = 0 AND r.receipt_date BETWEEN ? AND ?${rec.sql}
            GROUP BY ym
        `).all(firstDay, lastDay, ...rec.params).map((r) => [r.ym, Number(r.total) || 0]));
        const monthly = months.map((ym) => ({ month: ym, sales: round2(salesByMonth.get(ym)), collections: round2(receiptsByMonth.get(ym)) }));

        const topCustomers = db.prepare(`
            SELECT i.party_id, COALESCE(p.company_name, 'Unknown party') AS name,
                   COUNT(*) AS invoices, SUM(${grandOf("i")}) AS total
            FROM invoice i LEFT JOIN party p ON p.id = i.party_id
            WHERE i.is_deleted = 0 AND i.invoice_date BETWEEN ? AND ?${inv.sql}
            GROUP BY i.party_id ORDER BY total DESC LIMIT 5
        `).all(period.from, period.to, ...inv.params);

        const recent = db.prepare(`
            SELECT * FROM (
                SELECT 'invoice' AS type, i.id, i.invoice_no AS number, i.invoice_date AS date,
                       p.company_name AS party, ${grandOf("i")} AS amount, i.created_at
                FROM invoice i LEFT JOIN party p ON p.id = i.party_id WHERE i.is_deleted = 0${inv.sql}
                UNION ALL
                SELECT 'receipt', r.id, r.receipt_no, r.receipt_date, p.company_name, r.total_value, r.created_at
                FROM money_receipts r LEFT JOIN party p ON p.id = r.party_id WHERE r.is_deleted = 0${rec.sql}
                UNION ALL
                SELECT 'challan', c.id, c.cn_no, c.date, p.company_name, c.total_amount, c.created_at
                FROM challan c LEFT JOIN party p ON p.id = c.consignee_id WHERE c.is_deleted = 0${chl.sql}
            ) ORDER BY date DESC, created_at DESC LIMIT 8
        `).all(...inv.params, ...rec.params, ...chl.params);

        const aging = receivablesAging(filters);

        return {
            period,
            kpi: {
                sales: { total: round2(sales.total), count: sales.count, taxable: round2(sales.taxable), tax: round2(sales.total - sales.taxable), previous: round2(prevSales.total) },
                collections: { total: round2(receipts.total), count: receipts.count, previous: round2(prevReceipts.total) },
                outstanding: { total: aging.outstanding, parties: aging.partiesWithDues, overdue90: aging.buckets[3].amount, advances: aging.advances },
                unbilled: { total: round2(unbilled.total), count: unbilled.count },
            },
            documentCounts: { challans: challans.count, invoices: sales.count, moneyReceipts: receipts.count },
            monthly,
            aging: aging.buckets,
            topCustomers: topCustomers.map((c) => ({ ...c, total: round2(c.total) })),
            recent,
        };
    } catch (error) {
        console.log("Something went wrong: Service: getDashboardStats", error);
        throw error;
    };
};

/* ------------------------------------------------------------------------ */
/* Sales register                                                            */
/* ------------------------------------------------------------------------ */

module.exports.getSalesRegister = async ({ created_by = "", company_id = "", party_id = "", from = "", to = "" } = {}) => {
    try {
        const period = resolvePeriod(from, to);
        const inv = scope("i", { created_by, company_id });
        const partySql = party_id ? " AND i.party_id = ?" : "";
        const params = [period.from, period.to, ...inv.params, ...(party_id ? [party_id] : [])];

        const rows = db.prepare(`
            SELECT i.id, i.invoice_no, i.invoice_date, i.company_id, c.company_name AS company,
                   i.party_id, p.company_name AS party, p.gst AS party_gst, p.state AS party_state,
                   COALESCE(i.total_amount, 0) AS taxable, COALESCE(i.total_cgst, 0) AS cgst,
                   COALESCE(i.total_sgst, 0) AS sgst, COALESCE(i.total_igst, 0) AS igst,
                   ${grandOf("i")} AS total
            FROM invoice i
            LEFT JOIN party p ON p.id = i.party_id
            LEFT JOIN company c ON c.id = i.company_id
            WHERE i.is_deleted = 0 AND i.invoice_date BETWEEN ? AND ?${inv.sql}${partySql}
            ORDER BY i.invoice_date, i.id
        `).all(...params);

        return { period: { from: period.from, to: period.to }, rows };
    } catch (error) {
        console.log("Something went wrong: Service: getSalesRegister", error);
        throw error;
    };
};

// Purchases (supplier bills) are not recorded in MyERP yet, so there are no creditors.
module.exports.getCreditors = async () => ({
    ledger: [],
    totals: {
        total_bill: 0,
        total_payment: 0,
        total_due: 0
    }
});
