const db = require("../database/connection");

const addParty = ({ name, email }) => {
    return db
        .prepare("INSERT INTO party (name, email) VALUES (?, ?)")
        .run(name, email);
};

const listParty = ({
    id = "",
    skip = 0,
    limit = 0
}) => {
    let query = "SELECT * FROM party";
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


const removeParty = ({
    id = ""
}) => {
    if (!id) throw new Error("ID is required");

    return db
        .prepare("DELETE FROM party WHERE id = ?")
        .run(id);
};

module.exports = { addParty, listParty, removeParty };
