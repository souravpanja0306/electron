const { db } = require("../database/connection");

module.exports.createCompany = async (data) => {
    try {
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO company (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(error);
        throw error;
    };
};

module.exports.getCompany = async ({
    id = "",
    mobile = "",
    created_by = "",
    email = "",
    limit = "",
    skip = "",
}) => {
    try {
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
        throw error;
    };
};

module.exports.deleteCompany = async ({
    ids = "",
}) => {
    try {
        const placeholders = ids.map(() => "?").join(",");

        let result = await db.prepare(`DELETE FROM company WHERE id IN (${placeholders})`).run(...ids);
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    };
};

module.exports.updateCompany = async (id, data) => {
    try {
        const keys = Object.keys(data).filter(key => key !== 'id'); // Exclude id from update fields
        const setClause = keys.map(key => `${key} = @${key}`).join(", ");

        if (!keys.length) {
            return { changes: 0 }; // No fields to update
        }

        const result = db
            .prepare(`UPDATE company SET ${setClause} WHERE id = @id`)
            .run({ ...data, id });

        return result;
    } catch (error) {
        console.log(error);
        throw error;
    };
};