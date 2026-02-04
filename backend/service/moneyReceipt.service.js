const db = require("../database/connection");
db.exec(require("../database/schema/moneyReceipts.schema"));


exports.findMoneyReceipts = async ({
    id = "",
    created_by = "",
    receipt_no = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        let query = "SELECT * FROM money_receipts WHERE 1=1";
        let params = [];

        if (id) {
            query += " AND id = ?";
            params.push(id);
        };

        if (created_by) {
            query += " AND created_by = ?";
            params.push(created_by);
        };

        if (receipt_no) {
            query += " AND receipt_no = ?";
            params.push(receipt_no);
        };

        if (limit && skip) {
            query += " LIMIT ? OFFSET ?";
            params.push(Number(limit), Number(skip));
        };
        if (count) {
            let query = `SELECT COUNT(*) AS total FROM money_receipts;`
            let result = db.prepare(query).all(...params);
            return result[0].total;
        };
        let result = db.prepare(query).all(...params);
        return result;
    } catch (error) {
        console.log(error);
    };
};