const Database = require("better-sqlite3");
const path = require("path");
const mongoose = require("mongoose");

const connectMongo = async () => {
    try {
        // await mongoose.connect("");
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
    };
};

const db = new Database(path.join(__dirname, "app.db"));

module.exports = { connectMongo, db };