const Database = require("better-sqlite3");
const path = require("path");
const mongoose = require("mongoose");
const { app } = require("electron");
const fs = require("fs");

// MongoDB (licences / account registry). Filters are sanitised so request values can never
// act as query operators, and queries fail after 5 s instead of hanging while offline.
mongoose.set("sanitizeFilter", true);
mongoose.set("bufferTimeoutMS", 5000);

const connectMongo = async () => {
    try {
        if (process.env.MONGODB_URI) {
            try {
                let result = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
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

// A restore uploaded from Database Settings is staged here and swapped in on the next start,
// before the database is opened (the live file can't be replaced while it is open).
const pendingRestorePath = `${dbPath}.restore-pending`;

// If Directory not exists, create it...
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

if (fs.existsSync(pendingRestorePath)) {
    try {
        if (fs.existsSync(dbPath)) {
            const stamp = new Date().toISOString().replace(/[:.]/g, "-");
            fs.copyFileSync(dbPath, `${dbPath}.before-restore-${stamp}.bak`);
        };
        for (const suffix of ["-wal", "-shm"]) {
            if (fs.existsSync(dbPath + suffix)) fs.unlinkSync(dbPath + suffix);
        };
        fs.renameSync(pendingRestorePath, dbPath);
        console.log("Database restored from backup.");
    } catch (error) {
        console.error("Database restore failed; keeping the current database.", error);
    };
};

const db = new Database(dbPath);

// Every schema is CREATE TABLE IF NOT EXISTS, so this is safe on every start. It also fills
// in tables missing from older databases or restored backups (e.g. hsn_sac, cha).
[
    "gst.schema",
    "hsn.schema",
    "challan.schema",
    "moneyReceipts.schema",
    "company.schema",
    "user.schema",
    "party.schema",
    "invoice.schema",
    "invoiceSetting.schema",
    "settingChallanSchema",
    "settingSchema",
    "cha.schema",
    "vendor.schema",
].forEach((schema) => db.exec(require(`../database/schema/${schema}`)));

// Keep existing SQLite installations compatible with schema additions.
const invoiceColumns = db.prepare("PRAGMA table_info(invoice)").all();
if (invoiceColumns.length && !invoiceColumns.some(column => column.name === "challan_id")) {
    db.exec("ALTER TABLE invoice ADD COLUMN challan_id INTEGER");
};
if (invoiceColumns.length && !invoiceColumns.some(column => column.name === "terms_and_conditions")) {
    db.exec("ALTER TABLE invoice ADD COLUMN terms_and_conditions TEXT");
};
if (invoiceColumns.length && !invoiceColumns.some(column => column.name === "container")) {
    db.exec("ALTER TABLE invoice ADD COLUMN container TEXT");
};
if (invoiceColumns.length && !invoiceColumns.some(column => column.name === "cha")) {
    db.exec("ALTER TABLE invoice ADD COLUMN cha INTEGER");
};
db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_invoice_active_challan ON invoice(challan_id) WHERE challan_id IS NOT NULL AND is_deleted = 0");

const challanColumns = db.prepare("PRAGMA table_info(challan)").all();
if (challanColumns.length && !challanColumns.some(column => column.name === "invoiced")) {
    db.exec("ALTER TABLE challan ADD COLUMN invoiced INTEGER DEFAULT 0");
};

// "Show CHA field" switch (Invoice / Challan settings), one value per user.
const userSettingColumns = db.prepare("PRAGMA table_info(user_setting)").all();
if (userSettingColumns.length && !userSettingColumns.some(column => column.name === "show_cha")) {
    db.exec("ALTER TABLE user_setting ADD COLUMN show_cha INTEGER DEFAULT 1");
};

// Lookup indexes for the per-user lists and reports (safe to run on every start).
[
    "CREATE INDEX IF NOT EXISTS idx_invoice_user ON invoice(created_by, is_deleted, company_id)",
    "CREATE INDEX IF NOT EXISTS idx_invoice_party ON invoice(party_id)",
    "CREATE INDEX IF NOT EXISTS idx_challan_user ON challan(created_by, is_deleted)",
    "CREATE INDEX IF NOT EXISTS idx_receipt_user ON money_receipts(created_by, is_deleted)",
    "CREATE INDEX IF NOT EXISTS idx_receipt_party ON money_receipts(party_id)",
    "CREATE INDEX IF NOT EXISTS idx_party_user ON party(created_by)",
    "CREATE INDEX IF NOT EXISTS idx_company_user ON company(created_by)",
].forEach((sql) => db.exec(sql));

module.exports = { connectMongo, db, dbPath, pendingRestorePath };
