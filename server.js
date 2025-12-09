const express = require("express");
const cors = require("cors");
const fs = require("fs");
const initSqlJs = require("sql.js");

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = "api/database/database.sqlite";
let db = null;


const initializeDatabase = async () => {
    try {
        const SQL = await initSqlJs();
        console.log("sql.js engine initialized.");

        if (fs.existsSync(DB_PATH)) {
            const filebuffer = fs.readFileSync(DB_PATH);
            db = new SQL.Database(filebuffer);
            console.log(`Database loaded from ${DB_PATH}`);
        };
        // process.on('SIGINT', saveAndClose);
        // process.on('SIGTERM', saveAndClose);

    } catch (error) {
        console.error("Database initialization failed:", error);
        // process.exit(1);
    };
};

// const saveAndClose = () => {
//     if (db) {
//         console.log("Saving database state...");
//         try {
//             const data = db.export();
//             const buffer = Buffer.from(data);

//             fs.writeFileSync(DB_PATH, buffer);
//             db.close();
//             console.log("Database saved and closed successfully.");
//         } catch (e) {
//             console.error("Error saving database:", e);
//         };
//     };
//     process.exit(0);
// };

initializeDatabase().then(() => {
    app.listen(3001, () => console.log("Local API running on port 3001"));
});