const db = require("../database/connection");

const addUser = async ({ name, email }) => {
    try {
        db.prepare("INSERT INTO users (name, email) VALUES (?, ?)")
            .run(name, email);
    } catch (error) {
        console.log(error);
    };
    return
};

const listUsers = async ({
    id = "",
    skip = 0,
    limit = 0
}) => {
    try {
        let query = "SELECT * FROM users";
        let params = [];

        if (id) {
            query += " WHERE id = ?";
            params.push(id);
        };

        if (limit) {
            query += " LIMIT ? OFFSET ?";
            params.push(Number(limit), Number(skip));
        };
        let result = await db.prepare(query).all(...params);
        return result
    } catch (error) {
        console.log(error);
    };
};

const removeUsers = async ({
    id = ""
}) => {
    try {
        if (!id) throw new Error("ID is required");
        let result = db.prepare("DELETE FROM users WHERE id = ?").run(id);
        return result
    } catch (error) {
        console.log(error)
    };
    return;
};

module.exports = { addUser, listUsers, removeUsers };
