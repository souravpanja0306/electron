// services/debtor.service.js
const { db } = require("../database/connection");

exports.getDebtors = async ({
    party_id = ""
}) => {
    try {
        db.exec(require("../database/schema/invoice.schema"));
        db.exec(require("../database/schema/moneyReceipts.schema"));

        const stmt = db.prepare(`
            SELECT invoice_date AS date, 'Invoice #' || invoice_no AS description, total_amount AS dr, 0 AS cr FROM invoice WHERE party_id = ?
            UNION ALL
            SELECT receipt_date AS date, 'Payment #' || receipt_no AS description, 0 AS dr, total_value AS cr FROM money_receipts WHERE party_id = ?
            ORDER BY date ASC
        `);

        // Totals
        const totalStmt = db.prepare(`
            SELECT 
                IFNULL((SELECT SUM(total_amount) FROM invoice WHERE party_id = ?), 0) AS total_dr,
                IFNULL((SELECT SUM(total_value) FROM money_receipts WHERE party_id = ?), 0) AS total_cr
        `);

        const totals = totalStmt.get(party_id, party_id);
        const rows = stmt.all(party_id, party_id);

        return {
            ledger: rows,
            totals: {
                total_dr: totals.total_dr ? totals.total_dr : 0,
                total_cr: totals.total_cr ? totals.total_cr : 0,
                balance: totals.total_dr - totals.total_cr
            },
        };
    } catch (error) {
        console.log("Something went wrong: Service: getDebtors", error);
    };
};