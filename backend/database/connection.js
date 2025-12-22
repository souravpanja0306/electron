const Database = require("better-sqlite3");
const path = require("path");

const userSchema = require("./schema/user.schema");
const partySchema = require("./schema/party.schema");

const db = new Database(path.join(__dirname, "app.db"));
db.exec(userSchema);
db.exec(partySchema);

module.exports = db;
