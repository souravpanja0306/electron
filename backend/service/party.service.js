const db = require("../database/connection");


exports.createParty = async (data) => {
    try {
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO party (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(error)
    };
};

exports.getParty = async ({
    id = "",
    mobile = "",
    email = "",
    limit = "",
    skip = "",
}) => {
    try {
        let query = "SELECT * FROM party";
        let params = [];

        if (id) {
            query += " WHERE id = ?";
            params.push(id);
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

        let result = db.prepare(query).all(...params);

        return result;
    } catch (error) {
        console.log(error)
    };
};

exports.deleteParty = async ({
    ids = "",
}) => {
    try {
        const placeholders = ids.map(() => "?").join(",");

        let result = await db.prepare(`DELETE FROM party WHERE id IN (${placeholders})`).run(...ids);
        return result;
    } catch (error) {
        console.log(error)
    };
};