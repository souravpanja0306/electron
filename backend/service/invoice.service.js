const db = require("../database/connection");
db.exec(require("../database/schema/invoice.schema"));

exports.insertInvoiceData = async (data) => {
    try {
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
    invoice_no = "",
    mobile = "",
    email = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        let query = "SELECT * FROM invoice";
        let params = [];

        if (id) {
            query += " WHERE id = ?";
            params.push(id);
        };

        if (invoice_no) {
            query += " WHERE invoice_no = ?";
            params.push(invoice_no);
        };

        if (mobile) {
            query += " WHERE mobile = ?";
            params.push(mobile);
        };

        if (email) {
            query += " WHERE email = ?";
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