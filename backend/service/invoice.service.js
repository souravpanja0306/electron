const db = require("../database/connection");

exports.insertInvoiceData = async (data) => {
    try {
        db.exec(require("../database/schema/invoice.schema"));
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO invoice (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(error);
    };
};

exports.findInvoices = async ({
    id = "",
    created_by = "",
    invoice_no = "",
    mobile = "",
    email = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        db.exec(require("../database/schema/invoice.schema"));
        let query = "SELECT * FROM invoice WHERE 1=1";
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

        if (mobile) {
            query += " AND mobile = ?";
            params.push(mobile);
        };

        if (email) {
            query += " AND email = ?";
            params.push(email);
        };

        if (limit && skip) {
            query += " LIMIT ? OFFSET ?";
            params.push(Number(limit), Number(skip));
        };
        if (count) {
            let query = `SELECT COUNT(*) AS total FROM invoice;`
            let result = db.prepare(query).all(...params);
            return result[0].total;
        };
        let result = db.prepare(query).all(...params);
        return result;
    } catch (error) {
        console.log(error);
    };
};

module.exports.deleteInvoices = async ({

}) => {
    try {
        db.exec(require("../database/schema/invoice.schema"));

    } catch (error) {
        console.log(error);
    };
};