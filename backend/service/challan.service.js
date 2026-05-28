const { db } = require("../database/connection");

exports.insertChallanData = async (data) => {
    try {
        db.exec(require("../database/schema/challan.schema"));
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO challan (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(error);
        throw error;
    };
};

exports.findChallans = async ({
    id = "",
    created_by = "",
    cn_no = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        db.exec(require("../database/schema/challan.schema"));
        let query = "SELECT * FROM challan WHERE 1=1";
        let params = [];

        if (id) {
            query += " AND id = ?";
            params.push(id);
        };

        if (created_by) {
            query += " AND created_by = ?";
            params.push(created_by);
        };

        if (cn_no) {
            query += " AND cn_no = ?";
            params.push(cn_no);
        };

        if (limit && skip) {
            query += " LIMIT ? OFFSET ?";
            params.push(Number(limit), Number(skip));
        };
        
        if (count) {
            let countQuery = `SELECT COUNT(*) AS total FROM challan WHERE 1=1;`
            let result = db.prepare(countQuery).all();
            return result[0].total;
        };

        let result = db.prepare(query).all(...params);
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    };
};

exports.deleteChallan = async ({
    id = "",
}) => {
    try {
        db.exec(require("../database/schema/challan.schema"));
        if (id) {
            const result = db
                .prepare("DELETE FROM challan WHERE id = ?")
                .run(id);
            return { deleted: result.changes };
        };
    } catch (error) {
        console.log(error);
        throw error;
    };
};