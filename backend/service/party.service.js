const { db } = require("../database/connection");

module.exports.createParty = async (data) => {
    try {
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO party (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log("Something went wrong: Service: createParty", error);
        throw error;
    }
};

module.exports.getParty = async ({
    id = "",
    created_by = "",
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
        if (created_by) {
            search_key.push("created_by = ?");
            params.push(created_by);
        };

        if (search_key.length) query = `${query} WHERE ${search_key.join(" AND ")}`;
        query += " ORDER BY company_name COLLATE NOCASE";
        
        if (limit) {
            query += " LIMIT ? OFFSET ?";
            params.push(Number(limit), Number(skip) || 0);
        };
        let result = db.prepare(query).all(...params);
        return result;
    } catch (error) {
        console.log("Something went wrong: Service: getParty", error);
        throw error;
    };
};

module.exports.deleteParty = async ({
    ids = [],
}) => {
    try {
        const placeholders = ids.map(() => "?").join(",");

        let result = db.prepare(`DELETE FROM party WHERE id IN (${placeholders})`).run(...ids);
        return result;
    } catch (error) {
        console.log("Something went wrong: Service: deleteParty", error);
        throw error;
    };
};

module.exports.updateParty = async (id, data) => {
    try {
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = @${k}`).join(", ");
        const result = db
            .prepare(`UPDATE party SET ${setClause} WHERE id = @id`)
            .run({ ...data, id });
        return result;
    } catch (error) {
        console.log("Something went wrong: Service: updateParty", error);
        throw error;
    };
};