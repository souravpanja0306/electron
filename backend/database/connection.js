const Database = require("better-sqlite3");
const path = require("path");
const mongoose = require("mongoose");
const { app } = require("electron");
const fs = require("fs");

// MonogoDB Connection...
const connectMongo = async () => {
    try {
        if (process.env.MONGODB_URI) {
            try {
                let result = await mongoose.connect(process.env.MONGODB_URI);
                console.log(`MongoDB Connected Successfully with "${result.connection.db.databaseName}" Database...`);
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
    ? "D:\\Downloads\\app.db"
    : path.join(__dirname, "dev.db");

const isNewDatabase = !fs.existsSync(dbPath);

// If Directory not exists, create it...
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(dbPath);

if (isNewDatabase) {
    db.exec(require("../database/schema/gst.schema"));
    db.exec(require("../database/schema/challan.schema"));
    db.exec(require("../database/schema/moneyReceipts.schema"));
    db.exec(require("../database/schema/company.schema"));
    db.exec(require("../database/schema/user.schema"));
    db.exec(require("../database/schema/party.schema"));
    db.exec(require("../database/schema/invoice.schema"));
    db.exec(require("../database/schema/settingChallanSchema"));
};

module.exports = { connectMongo, db, dbPath };