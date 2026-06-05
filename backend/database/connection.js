const Database = require("better-sqlite3");
const path = require("path");
const mongoose = require("mongoose");
const { app } = require("electron");

const connectMongo = async () => {
    try {
        if (process.env.MONGODB_URI) {
            try {
                await mongoose.connect(process.env.MONGODB_URI);
                console.log("MongoDB Connected Successfully...");
            } catch (error) {
                console.error(error);
            };
        } else {
            console.log("MONGODB_URI not found in environment variables. MongoDB connection skipped.");
        };
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
    };
};

const dbPath = app.isPackaged
    ? path.join(app.getPath("userData"), "app.db")
    : path.join(__dirname, "app.db");

const db = new Database(dbPath);

module.exports = { connectMongo, db };