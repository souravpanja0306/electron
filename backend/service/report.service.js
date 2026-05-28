// services/debtor.service.js
const { db } = require("../database/connection");

exports.getDebtors = async ({
    party_id = ""
}) => {
    try {
        db.exec(require("../database/schema/invoice.schema"));
        db.exec(require("../database/schema/moneyReceipts.schema"));

        const stmt = db.prepare(`
            SELECT 
                p.id AS party_id,
                p.company_name,
                IFNULL(SUM(i.total_amount),0) AS total_invoice,
                IFNULL(SUM(r.total_value),0) AS total_payment,
                IFNULL(SUM(i.total_amount),0) - IFNULL(SUM(r.total_value),0) AS total_due
            FROM party p
            LEFT JOIN invoice i ON p.id = i.party_id
            LEFT JOIN money_receipts r ON p.id = r.party_id
            GROUP BY p.id
        `);

        const totalStmt = db.prepare(`
            SELECT 
                IFNULL((SELECT SUM(total_amount) FROM invoice),0) AS total_invoice,
                IFNULL((SELECT SUM(total_value) FROM money_receipts),0) AS total_payment,
                IFNULL((SELECT SUM(total_amount) FROM invoice),0) -
                IFNULL((SELECT SUM(total_value) FROM money_receipts),0) AS total_due
        `);
        const rows = stmt.all();
        const totals = totalStmt.get();

        return {
            ledger: rows,
            totals
        };
    } catch (error) {
        console.log("Something went wrong: Service: getDebtors", error);
    };
};

exports.getDebtorsDetails = async ({
    party_id = ""
}) => {
    try {
        db.exec(require("../database/schema/invoice.schema"));
        db.exec(require("../database/schema/moneyReceipts.schema"));
        db.exec(require("../database/schema/party.schema"));

        const party = db.prepare(`SELECT * FROM party WHERE id = ?`).get(party_id);
        const stmt = db.prepare(`
            SELECT invoice_date AS date, 'Invoice #' || invoice_no AS description, total_amount AS dr, 0 AS cr FROM invoice WHERE party_id = ?
            UNION ALL
            SELECT receipt_date AS date, 'Payment #' || receipt_no AS description, 0 AS dr, total_value AS cr FROM money_receipts WHERE party_id = ?
            ORDER BY date ASC
        `);

        const totalStmt = db.prepare(`
            SELECT 
                IFNULL((SELECT SUM(total_amount) FROM invoice WHERE party_id = ?), 0) AS total_dr,
                IFNULL((SELECT SUM(total_value) FROM money_receipts WHERE party_id = ?), 0) AS total_cr
        `);

        const totals = totalStmt.get(party_id, party_id);
        const rows = stmt.all(party_id, party_id);

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
    };
};

exports.getDashboardStats = async () => {
    try {
        db.exec(require("../database/schema/invoice.schema"));
        db.exec(require("../database/schema/moneyReceipts.schema"));

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
            kpi: {
                totalDebtors,
                overdueDebtors: debtorAging[3].value, // 90+ days as overdue for now
                totalCreditors,
                overdueCreditors: 0
            },
            aging: {
                debtors: debtorAging,
                creditors: creditorAging
            }
        };
    } catch (error) {
        console.log("Something went wrong: Service: getDashboardStats", error);
        throw error;
    }
}