const { db } = require("../database/connection");

module.exports.insertInvoiceData = async (data) => {
    try {
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO invoice (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(error);
        throw error;
    };
};

module.exports.findInvoices = async ({
    id = "",
    created_by = "",
    invoice_no = "",
    startDate = "",
    endDate = "",
    search = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        let query = "SELECT * FROM invoice WHERE is_deleted = 0";
        let params = [];

        if (id) {
            query += " AND id = ?";
            params.push(id);
        };

        if (created_by) {
            query += " AND created_by = ?";
            params.push(created_by);
        };

        if (invoice_no) {
            query += " AND invoice_no = ?";
            params.push(invoice_no);
        };

        if (startDate && endDate) {
            query += " AND invoice_date BETWEEN ? AND ?";
            params.push(startDate, endDate);
        } else if (startDate) {
            query += " AND invoice_date >= ?";
            params.push(startDate);
        } else if (endDate) {
            query += " AND invoice_date <= ?";
            params.push(endDate);
        };

        if (search) {
            query += " AND (invoice_no LIKE ? OR transporter LIKE ? OR lorry_no LIKE ? OR lr_no LIKE ?)";
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

module.exports.deleteInvoices = async ({
    id = "",
}) => {
    try {
        if (id) {
            const result = db
                .prepare("UPDATE invoice SET is_deleted = 1 WHERE id = ?")
                .run(id);
            return { deleted: result.changes };
        };
    } catch (error) {
        console.log(error);
        throw error;
    };
};


module.exports.updateInvoiceData = async (id, data) => {
    try {
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = @${k}`).join(", ");
        const result = db
            .prepare(`UPDATE invoice SET ${setClause} WHERE id = @id`)
            .run({ ...data, id });
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    };
};