const Database = require("better-sqlite3");
const path = require("path");

const userSchema = require("./schema/user.schema");

const db = new Database(path.join(__dirname, "app.db"));
db.exec(userSchema);

module.exports = db;
