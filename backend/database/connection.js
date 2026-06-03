const Database = require("better-sqlite3");
const path = require("path");
const mongoose = require("mongoose");
const { app } = require("electron");

const connectMongo = async () => {
    try {
        // await mongoose.connect("");
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
    };
};

const dbPath = app.isPackaged
    ? path.join(app.getPath("userData"), "app.db")
    : path.join(__dirname, "app.db");

const db = new Database(dbPath);

module.exports = { connectMongo, db };