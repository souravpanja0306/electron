const {db} = require("../database/connection");

exports.createCompany = async (data) => {
    try {
        db.exec(require("../database/schema/company.schema"));
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO company (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(error)
    };
};

exports.getCompany = async ({
    id = "",
    mobile = "",
    created_by = "",
    email = "",
    limit = "",
    skip = "",
}) => {
    try {
        db.exec(require("../database/schema/company.schema"));
        let query = "SELECT * FROM company";
        let search_key = [];
        let params = [];

        if (id) {
            search_key.push("id = ?");
            params.push(id);
        };
        if (created_by) {
            search_key.push("created_by = ?");
            params.push(created_by);
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