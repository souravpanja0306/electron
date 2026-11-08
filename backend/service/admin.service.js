const Database = require("better-sqlite3");
const fs = require("fs");
const { db } = require("../database/connection");

/*
 * Data reset. Only these fixed table names are ever touched (never user input), rows are
 * deleted rather than tables dropped, and the user account + preferences are always kept.
 */
const RESET_SCOPES = {
    // Documents only: masters and numbering settings stay.
    transactions: ["invoice", "challan", "money_receipts"],
    // All business data. Keeps `users` and `user_setting` (theme, field visibility).
    all: [
        "invoice", "challan", "money_receipts",
        "party", "company", "cha", "gst", "hsn_sac", "vendor",
        "invoice_setting", "challan_setting",
    ],
};

module.exports.RESET_SCOPES = RESET_SCOPES;

/** Deletes every row in the scope's tables (one transaction) and restarts their ID counters. */
module.exports.resetBusinessData = ({ scope }) => {
    const tables = RESET_SCOPES[scope];
    if (!tables) {
        const error = new Error("Unknown reset scope.");
        error.status = 400;
        throw error;
    };
    const existing = new Set(
        db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name)
    );
    const hasSequence = existing.has("sqlite_sequence");

    return db.transaction(() => {
        const deleted = {};
        for (const table of tables) {
            if (!existing.has(table)) continue;
            deleted[table] = db.prepare(`DELETE FROM "${table}"`).run().changes;
            if (hasSequence) db.prepare("DELETE FROM sqlite_sequence WHERE name = ?").run(table);
        };
        return deleted;
    })();
};

/** Row counts for the tables shown on the Database settings page. */
module.exports.getDataSummary = () => {
    const existing = new Set(
        db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name)
    );
    const summary = {};
    for (const table of RESET_SCOPES.all) {
        summary[table] = existing.has(table) ? db.prepare(`SELECT COUNT(*) AS n FROM "${table}"`).get().n : 0;
    };
    return summary;
};

/** Consistent snapshot of the live database (safe while the app is writing). */
module.exports.backupDatabase = (destination) => db.backup(destination);

const SQLITE_HEADER = "SQLite format 3\u0000";
const REQUIRED_TABLES = ["users", "company", "party", "invoice", "challan"];

/**
 * Checks that `filePath` is an intact MyERP database. Throws an error with
 * `status = 400` and a user-facing message when it isn't.
 */
module.exports.verifyBackupFile = (filePath) => {
    const fail = (message) => {
        const error = new Error(message);
        error.status = 400;
        throw error;
    };

    const handle = fs.openSync(filePath, "r");
    const header = Buffer.alloc(16);
    try {
        fs.readSync(handle, header, 0, 16, 0);
    } finally {
        fs.closeSync(handle);
    };
    if (header.toString("latin1") !== SQLITE_HEADER) fail("This file is not a MyERP database backup.");

    let probe;
    try {
        probe = new Database(filePath, { readonly: true, fileMustExist: true });
    } catch (error) {
        fail("This backup file could not be opened.");
    };
    try {
        if (probe.pragma("integrity_check", { simple: true }) !== "ok") fail("This backup file is damaged.");
        const tables = new Set(probe.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name));
        if (REQUIRED_TABLES.some((table) => !tables.has(table))) fail("This file is not a MyERP database backup.");
    } finally {
        probe.close();
    };
};

module.exports.createHSNSAC = async (data) => {
    try {
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO hsn_sac (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(`Something went wrong: service: createHSNSAC: ${error}`);
        throw error;
    };
};

module.exports.findHSNSAC = async ({
    id = "",
    created_by = "",
    code = "",
    type = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        let query = "SELECT * FROM hsn_sac WHERE is_deleted = 0";
        let params = [];

        if (id) {
            query += " AND id = ?";
            params.push(id);
        };

        if (created_by) {
            query += " AND created_by = ?";
            params.push(created_by);
        };

        if (type) {
            query += " AND type = ?";
            params.push(type);
        };

        if (code) {
            query += " AND code = ?";
            params.push(code);
        };

        query += " ORDER BY code";

        if (limit && skip) {
            query += " LIMIT ? OFFSET ?";
            params.push(Number(limit), Number(skip));
        };
        if (count) {
            let query = `SELECT COUNT(*) AS total FROM hsn_sac;`
            let result = db.prepare(query).all(...params);
            return result[0].total;
        };
        let result = db.prepare(query).all(...params);
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: findHSNSAC: ${error}`);
        throw error;
    };
};

module.exports.updateHSNSAC = async (id, data, created_by) => {
    try {
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = @${k}`).join(", ");
        const result = db
            .prepare(`UPDATE hsn_sac SET ${setClause} WHERE id = @id AND created_by = @created_by AND is_deleted = 0`)
            .run({ ...data, id, created_by });
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: updateHSNSAC: ${error}`);
        throw error;
    };
};

module.exports.deleteHSNSAC = async (id, created_by) => {
    try {
        const result = db
            .prepare("UPDATE hsn_sac SET is_deleted = 1 WHERE id = ? AND created_by = ? AND is_deleted = 0")
            .run(id, created_by);
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: deleteHSNSAC: ${error}`);
        throw error;
    };
};

module.exports.createGST = async (data) => {
    try {
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO gst (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(`Something went wrong: service: createGST: ${error}`);
        throw error;
    };
};

module.exports.findGST = async ({
    id = "",
    created_by = "",
    total_rate = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        let query = "SELECT * FROM gst WHERE is_deleted = 0";
        let params = [];

        if (id) {
            query += " AND id = ?";
            params.push(id);
        };

        if (created_by) {
            query += " AND created_by = ?";
            params.push(created_by);
        };

        if (total_rate !== "" && total_rate !== null && total_rate !== undefined) {
            query += " AND total_rate = ?";
            params.push(Number(total_rate));
        };

        query += " ORDER BY total_rate";

        if (limit && skip) {
            query += " LIMIT ? OFFSET ?";
            params.push(Number(limit), Number(skip));
        };
        if (count) {
            let query = `SELECT COUNT(*) AS total FROM gst WHERE is_deleted = 0;`
            let result = db.prepare(query).all(...params);
            return result[0].total;
        };
        let result = db.prepare(query).all(...params);
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: findGST: ${error}`);
        throw error;
    };
};

module.exports.updateGST = async (id, data, created_by) => {
    try {

        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = @${k}`).join(", ");
        const result = db
            .prepare(`UPDATE gst SET ${setClause} WHERE id = @id AND created_by = @created_by AND is_deleted = 0`)
            .run({ ...data, id, created_by });
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: updateGST: ${error}`);
        throw error;
    };
};

module.exports.deleteGST = async (id, created_by) => {
    try {

        const result = db
            .prepare("UPDATE gst SET is_deleted = 1 WHERE id = ? AND created_by = ? AND is_deleted = 0")
            .run(id, created_by);
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: deleteGST: ${error}`);
        throw error;
    };
};

module.exports.createCHA = async (data) => {
    try {
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO cha (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(`Something went wrong: service: createCHA: ${error}`);
        throw error;
    };
};

module.exports.findCHA = async ({
    id = "",
    created_by = "",
    name = "",
    exact_name = "",
    mobile = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        let query = "SELECT * FROM cha WHERE is_deleted = 0";
        let params = [];

        if (id) {
            query += " AND id = ?";
            params.push(id);
        };

        if (created_by) {
            query += " AND created_by = ?";
            params.push(created_by);
        };

        if (name) {
            query += " AND name LIKE ?";
            params.push(`%${name}%`);
        };

        if (exact_name) {
            query += " AND name = ? COLLATE NOCASE";
            params.push(exact_name);
        };

        if (mobile) {
            query += " AND mobile = ?";
            params.push(mobile);
        };

        if (limit && skip) {
            query += " LIMIT ? OFFSET ?";
            params.push(Number(limit), Number(skip));
        };
        if (count) {
            let countQuery = "SELECT COUNT(*) AS total FROM cha WHERE is_deleted = 0;";
            let result = db.prepare(countQuery).all(...params);
            return result[0].total;
        };
        let result = db.prepare(query).all(...params);
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: findCHA: ${error}`);
        throw error;
    };
};

module.exports.updateCHA = async (id, data, created_by) => {
    try {
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = @${k}`).join(", ");
        const result = db
            .prepare(`UPDATE cha SET ${setClause} WHERE id = @id AND created_by = @created_by AND is_deleted = 0`)
            .run({ ...data, id, created_by });
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: updateCHA: ${error}`);
        throw error;
    };
};

module.exports.deleteCHA = async (id, created_by) => {
    try {
        const result = db
            .prepare("UPDATE cha SET is_deleted = 1 WHERE id = ? AND created_by = ? AND is_deleted = 0")
            .run(id, created_by);
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: deleteCHA: ${error}`);
        throw error;
    };
};