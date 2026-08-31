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
    ? path.join(app.getPath("userData"), "app.db")
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
    db.exec(require("../database/schema/cha.schema"));
};

// Keep existing SQLite installations compatible with schema additions.
const invoiceColumns = db.prepare("PRAGMA table_info(invoice)").all();
if (invoiceColumns.length && !invoiceColumns.some(column => column.name === "challan_id")) {
    db.exec("ALTER TABLE invoice ADD COLUMN challan_id INTEGER");
};
db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_invoice_active_challan ON invoice(challan_id) WHERE challan_id IS NOT NULL AND is_deleted = 0");

const challanColumns = db.prepare("PRAGMA table_info(challan)").all();
if (challanColumns.length && !challanColumns.some(column => column.name === "invoiced")) {
    db.exec("ALTER TABLE challan ADD COLUMN invoiced INTEGER DEFAULT 0");
};

module.exports = { connectMongo, db, dbPath };