const db = require("../database/connection");
db.exec(require("../database/schema/party.schema"));

exports.createParty = async (data) => {
    try {
        console.log(db)
        
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
        let search_key = [];
        let params = [];

        if (id) {
            search_key.push("id = ?");
            params.push(id);
        };
        if (mobile) {
            search_key.push("mobile = ?");
            params.push(mobile);
        };
        if (email) {
            search_key.push("email = ?");
            params.push(email);
        };

        if (search_key.length) query = `${query} WHERE ${search_key.join(" AND ")}`;
        else query = `${query}`;

        if (limit) {
            query += " LIMIT ? OFFSET ?";
            params.push(Number(limit));
        };
        if (skip) {
            query += " OFFSET ?";
            params.push(Number(skip));
        };
        let result = db.prepare(query).all(...params);
        return result;
    } catch (error) {
        console.log(error);
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