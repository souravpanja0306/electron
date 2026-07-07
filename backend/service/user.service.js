// SQL Database...
const { db } = require("../database/connection");

// MongoDB Models...
const UserModel = require("../database/model/user.model");

module.exports.insertUsers = async (data) => {
    try {

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
        console.log(`Something went wrong: service: insertUsers: ${error}`)
    };
};

module.exports.getUsers = async ({
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
        console.log(`Something went wrong: service: getUsers: ${error}`);
    };
};

module.exports.updateUsers = async (data, id) => {
    try {
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = @${k}`).join(", ");
        const result = db
            .prepare(`UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`)
            .run({ ...data, id });

        return result.changes > 0;
    } catch (error) {
        console.log(`Something went wrong: service: updateUsers: ${error}`);
        throw error;
    };
};

// MongoDB Working Here...
module.exports.insertUsersInMongodb = async (data) => {
    try {
        let newData = new UserModel(data);
        let result = await newData.save();
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: insertUsersInMongodb: ${error}`);
        throw error;
    };
};

module.exports.findUsersInMongodb = async ({
    machine_id = "",
    username = "",
    email = "",
    mobile = "",
}) => {
    try {
        let search_key = {};
        if (machine_id) search_key["machine_id"] = machine_id;
        if (username) search_key["username"] = username;
        if (email) search_key["email"] = email;
        if (mobile) search_key["mobile"] = mobile;

        let result = await UserModel.find(search_key);
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: findUsersInMongodb: ${error}`);
        throw error;
    };
};

module.exports.updateUsersInMongodb = async ({
    search_key = {},
    update_info = {}
}) => {
    try {
        let result = await UserModel.findOneAndUpdate(
            search_key,
            update_info,
            { upsert: true, new: true }
        );
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: updateUsersInMongodb: ${error}`);
        throw error;
    };
};