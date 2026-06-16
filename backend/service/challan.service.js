const { db } = require("../database/connection");

exports.insertChallanData = async (data) => {
    try {
        db.exec(require("../database/schema/challan.schema"));
        const columns = db.prepare("PRAGMA table_info(challan)").all();
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
    startDate = "",
    endDate = "",
    search = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        db.exec(require("../database/schema/challan.schema"));
        let query = "SELECT * FROM challan WHERE is_deleted = 0";
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

        if (startDate && endDate) {
            query += " AND date BETWEEN ? AND ?";
            params.push(startDate, endDate);
        } else if (startDate) {
            query += " AND date >= ?";
            params.push(startDate);
        } else if (endDate) {
            query += " AND date <= ?";
            params.push(endDate);
        };

        if (search) {
            query += " AND (cn_no LIKE ? OR truck_no LIKE ? OR from_loc LIKE ? OR to_loc LIKE ?)";
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

exports.deleteChallan = async ({
    id = "",
}) => {
    try {
        db.exec(require("../database/schema/challan.schema"));
        if (id) {
            const result = db
                .prepare("UPDATE challan SET is_deleted = 1 WHERE id = ?")
                .run(id);
            return { deleted: result.changes };
        };
    } catch (error) {
        console.log(error);
        throw error;
    };
};


exports.updateChallanData = async (id, data) => {
    try {
        db.exec(require("../database/schema/challan.schema"));
        const keys = Object.keys(data);
        const setClause = keys.map(key => `${key} = @${key}`).join(", ");
        const result = db
            .prepare(`UPDATE challan SET ${setClause} WHERE id = @id`)
            .run({ ...data, id });

        return result;
    } catch (error) {
        console.log(error);
        throw error;
    };
};