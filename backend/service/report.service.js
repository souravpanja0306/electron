// services/debtor.service.js
const { db } = require("../database/connection");

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
                SELECT party_id, SUM(total_amount) AS total_invoice
                FROM invoice
                WHERE is_deleted = 0${userFilter}${companyFilter}
                GROUP BY party_id
            ), receipt_totals AS (
                SELECT party_id, SUM(total_value) AS total_payment
                FROM money_receipts
                WHERE is_deleted = 0${userFilter}${companyFilter}
                GROUP BY party_id
            )
            SELECT
                p.id AS party_id,
                p.company_name,
                COALESCE(i.total_invoice, 0) AS total_invoice,
                COALESCE(r.total_payment, 0) AS total_payment,
                COALESCE(i.total_invoice, 0) - COALESCE(r.total_payment, 0) AS total_due
            FROM party p
            LEFT JOIN invoice_totals i ON i.party_id = p.id
            LEFT JOIN receipt_totals r ON r.party_id = p.id
            WHERE p.is_deleted = 0${userFilter}
              AND (COALESCE(i.total_invoice, 0) <> 0 OR COALESCE(r.total_payment, 0) <> 0)
            ORDER BY total_due DESC, p.company_name COLLATE NOCASE
        `).all(...invoiceParams, ...receiptParams, ...partyParams);

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
            SELECT id, invoice_date AS date, 'Invoice #' || invoice_no AS description, total_amount AS dr, 0 AS cr, 'invoice' AS entry_type FROM invoice WHERE party_id = ? AND is_deleted = 0${userFilter}${companyFilter}
            UNION ALL
            SELECT id, receipt_date AS date, 'Payment #' || receipt_no AS description, 0 AS dr, total_value AS cr, 'receipt' AS entry_type FROM money_receipts WHERE party_id = ? AND is_deleted = 0${userFilter}${companyFilter}
            ORDER BY date ASC
        `);

        const totalStmt = db.prepare(`
            SELECT 
                IFNULL((SELECT SUM(total_amount) FROM invoice WHERE party_id = ? AND is_deleted = 0${userFilter}${companyFilter}), 0) AS total_dr,
                IFNULL((SELECT SUM(total_value) FROM money_receipts WHERE party_id = ? AND is_deleted = 0${userFilter}${companyFilter}), 0) AS total_cr
        `);

        const queryParams = (includePartyId) => [
            ...(includePartyId ? [party_id] : []),
            ...(created_by ? [created_by] : []),
            ...(company_id ? [company_id] : [])
        ];
        const totals = totalStmt.get(...queryParams(true), ...queryParams(true));
        const rows = stmt.all(...queryParams(true), ...queryParams(true));

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

module.exports.getDashboardStats = async ({ created_by = "" } = {}) => {
    try {
        const countDocuments = (table) => {
            let query = `SELECT COUNT(*) AS total FROM ${table} WHERE is_deleted = 0`;
            const params = [];
            if (created_by) {
                query += " AND created_by = ?";
                params.push(created_by);
            }
            return db.prepare(query).get(...params).total;
        };

        // 1. Total Debtors
        const debtorTotals = db.prepare(`
            SELECT 
                IFNULL(SUM(total_amount), 0) AS total_invoice,
                IFNULL((SELECT SUM(total_value) FROM money_receipts), 0) AS total_payment
            FROM invoice
        `).get();

        const totalDebtors = debtorTotals.total_invoice - debtorTotals.total_payment;

        // 2. Debtor Aging
        const today = new Date().toISOString().split('T')[0];
        const agingQuery = (daysMin, daysMax = null) => {
            let dateCondition = "";
            if (daysMax) {
                dateCondition = `invoice_date BETWEEN date('now', '-${daysMax} days') AND date('now', '-${daysMin} days')`;
            } else {
                dateCondition = `invoice_date <= date('now', '-${daysMin} days')`;
            }

            return db.prepare(`
                SELECT IFNULL(SUM(total_amount), 0) as amount 
                FROM invoice 
                WHERE ${dateCondition}
            `).get().amount;
        };

        // Simplified aging for now (just based on invoice date, not considering partial payments per invoice)
        // In a real scenario, you'd track balance per invoice
        const debtorAging = [
            { label: "0–30 Days", value: agingQuery(0, 30) },
            { label: "31–60 Days", value: agingQuery(31, 60) },
            { label: "61–90 Days", value: agingQuery(61, 90) },
            { label: "90+ Days", value: agingQuery(91) },
        ];

        // 3. Creditors (Placeholders since vendor invoices aren't implemented)
        const totalCreditors = 0;
        const creditorAging = [
            { label: "0–30 Days", value: 0 },
            { label: "31–60 Days", value: 0 },
            { label: "61–90 Days", value: 0 },
            { label: "90+ Days", value: 0 },
        ];

        return {
            documentCounts: {
                challans: countDocuments("challan"),
                invoices: countDocuments("invoice"),
                moneyReceipts: countDocuments("money_receipts")
            },
            kpi: {
                totalDebtors,
                overdueDebtors: debtorAging[3].value, // 90+ days as overdue for now
                totalCreditors,
                overdueCreditors: 0
            },
            aging: {
                debtors: debtorAging,
                creditors: creditorAging
            },
        };
    } catch (error) {
        console.log("Something went wrong: Service: getDashboardStats", error);
        throw error;
    };
};

module.exports.getCreditors = async () => ({
    ledger: [],
    totals: {
        total_bill: 0,
        total_payment: 0,
        total_due: 0
    }
});
