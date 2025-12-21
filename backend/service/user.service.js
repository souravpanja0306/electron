const db = require("../database/connection");

const addUser = ({ name, email }) => {
    return db
        .prepare("INSERT INTO users (name, email) VALUES (?, ?)")
        .run(name, email);
};

const listUsers = ({
    id = "",
    skip = 0,
    limit = 0
}) => {
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

    return db.prepare(query).all(...params);
};


const removeUsers = ({
    id = ""
}) => {
    if (!id) throw new Error("ID is required");

    return db
        .prepare("DELETE FROM users WHERE id = ?")
        .run(id);
};

module.exports = { addUser, listUsers, removeUsers };
