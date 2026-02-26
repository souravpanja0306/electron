const {db} = require("../database/connection");

exports.resetTableData = async ({
    tableNames = "",
}) => {
    try {
        let result = await db.exec(`DROP TABLE IF EXISTS ${tableNames}`);
        return result;
    } catch (error) {
        console.log(error)
    };
};

exports.createHSNSAC = async (data) => {
    try {
        db.exec(require("../database/schema/hsn.schema"));
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO hsn_sac (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(error)
    };
};

exports.findHSNSAC = async ({
    id = "",
    created_by = "",
    code = "",
    type = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        db.exec(require("../database/schema/hsn.schema"));
        let query = "SELECT * FROM hsn_sac WHERE 1=1";
        let params = [];

        if (id) {
            query += " AND id = ?";
            params.push(id);
        };

        if (created_by) {
            query += " AND created_by = ?";
            params.push(created_by);
        };

        if (type) {
            query += " AND type = ?";
            params.push(type);
        };

        if (code) {
            query += " AND code = ?";
            params.push(code);
        };

        if (limit && skip) {
            query += " LIMIT ? OFFSET ?";
            params.push(Number(limit), Number(skip));
        };
        if (count) {
            let query = `SELECT COUNT(*) AS total FROM hsn_sac;`
            let result = db.prepare(query).all(...params);
            return result[0].total;
        };
        let result = db.prepare(query).all(...params);
        return result;
    } catch (error) {
        console.log(error)
    };
};


exports.createGST = async (data) => {
    try {
        db.exec(require("../database/schema/gst.schema"));
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO gst (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(error)
    };
};

exports.findGST = async ({
    id = "",
    created_by = "",
    total_rate = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        db.exec(require("../database/schema/gst.schema"));
        let query = "SELECT * FROM gst WHERE 1=1";
        let params = [];

        if (id) {
            query += " AND id = ?";
            params.push(id);
        };

        if (created_by) {
            query += " AND created_by = ?";
            params.push(created_by);
        };

        if (total_rate) {
            query += " AND total_rate = ?";
            params.push(total_rate);
        };

        if (limit && skip) {
            query += " LIMIT ? OFFSET ?";
            params.push(Number(limit), Number(skip));
        };
        if (count) {
            let query = `SELECT COUNT(*) AS total FROM gst;`
            let result = db.prepare(query).all(...params);
            return result[0].total;
        };
        let result = db.prepare(query).all(...params);
        return result;
    } catch (error) {
        console.log(error)
    };
};

