const { db } = require("../database/connection");

exports.insertUsers = async (data) => {
    try {
        db.exec(require("../database/schema/user.schema"));
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO users (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        if (result.lastInsertRowid) {
            const insertedUser = db
                .prepare("SELECT * FROM users WHERE id = ?")
                .get(result.lastInsertRowid);

            return insertedUser;
        };
    } catch (error) {
        console.log(error)
    };
};

exports.getUsers = async ({
    id = "",
    mobile = "",
    machine_id = "",
    username = "",
    password = "",
    email = "",
    limit = "",
    skip = "",
}) => {
    try {
        db.exec(require("../database/schema/user.schema"));
        let query = "SELECT * FROM users";
        let search_key = [];
        let params = [];

        if (id) {
            params.push(id);
            search_key.push(`id = ?`);
        };
        if (machine_id) {
            params.push(machine_id);
            search_key.push(`machine_id = ?`);
        };
        if (mobile) {
            params.push(mobile);
            search_key.push(`mobile = ?`);
        };
        if (email) {
            params.push(email);
            search_key.push(`email = ?`);
        };
        if (username) {
            params.push(username);
            search_key.push(`username = ?`)
        };
        if (password) {
            params.push(password);
            search_key.push(`password = ?`)
        };
        if (search_key.length) query = `${query} WHERE ${search_key.join(" AND ")}`;
        else query = `${query}`;

        if (limit) {
            query += ` LIMIT ?`;
            params.push(Number(limit));
        };
        if (skip) {
            query += ` OFFSET ?`;
            params.push(Number(skip));
        };
        let result = db.prepare(query).all(...params);
        return result;
    } catch (error) {
        console.log(error);
    };
};