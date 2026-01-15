const db = require("../database/connection");
db.exec(require("../database/schema/user.schema"));

exports.insertUsers = async (data) => {
    try {
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO users (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(error)
    };
};

exports.getUsers = ({
    id = "",
    mobile = "",
    username = "",
    password = "",
    email = "",
    limit = "",
    skip = "",
}) => {
    try {
        let query = "SELECT * FROM users";
        let search_key = [];
        let params = [];

        if (id) {
            params.push(id);
            search_key.push(`id = ?`);
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