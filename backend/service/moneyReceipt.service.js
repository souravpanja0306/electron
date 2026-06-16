const { db } = require("../database/connection");

exports.insertMoneyReceipts = async (data) => {
    try {
        db.exec(require("../database/schema/moneyReceipts.schema"));
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO money_receipts (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(error);
    };
};


exports.findMoneyReceipts = async ({
    id = "",
    created_by = "",
    receipt_no = "",
    startDate = "",
    endDate = "",
    search = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        db.exec(require("../database/schema/moneyReceipts.schema"));
        let query = "SELECT * FROM money_receipts WHERE is_deleted = 0";
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

        if (startDate && endDate) {
            query += " AND receipt_date BETWEEN ? AND ?";
            params.push(startDate, endDate);
        } else if (startDate) {
            query += " AND receipt_date >= ?";
            params.push(startDate);
        } else if (endDate) {
            query += " AND receipt_date <= ?";
            params.push(endDate);
        };

        if (search) {
            query += " AND (receipt_no LIKE ? OR remarks LIKE ? OR payment_mode LIKE ? OR reference LIKE ?)";
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        };

        query += " ORDER BY id DESC";

        if (limit && skip) {
            query += " LIMIT ? OFFSET ?";
            params.push(Number(limit), Number(skip));
        } else if (limit) {
            query += " LIMIT ?";
            params.push(Number(limit));
        };

        if (count) {
            const countQuery = `SELECT COUNT(*) AS total FROM (${query})`;
            let result = db.prepare(countQuery).all(...params);
            return result[0].total;
        };
        let result = db.prepare(query).all(...params);
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    };
};

module.exports.deleteMoneyReceipt = async ({
    id = "",
}) => {
    try {
        db.exec(require("../database/schema/moneyReceipts.schema"));
        if (!id) throw new Error("ID is required");

        let query = "UPDATE money_receipts SET is_deleted = 1 WHERE id = ?";
        let result = db.prepare(query).run(id);

        return { success: true, deleted: result.changes };
    } catch (error) {
        console.log(error);
        return { success: false, deleted: "" }
    };
};


exports.updateMoneyReceiptData = async (id, data) => {
    try {
        db.exec(require("../database/schema/moneyReceipts.schema"));
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = @${k}`).join(", ");
        const result = db
            .prepare(`UPDATE money_receipts SET ${setClause} WHERE id = @id`)
            .run({ ...data, id });
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    };
};