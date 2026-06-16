const { db } = require("../database/connection");

exports.resetTableData = async ({
    tableNames = "",
}) => {
    try {
        let result = await db.exec(`DROP TABLE IF EXISTS ${tableNames}`);
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: resetTableData: ${error}`);
        throw error;
    };
};

exports.migrateTableData = async (data) => {
    try {
        const migratedFields = [];

        for (const table of data) {
            const { table_name, fields } = table;
            const columns = db.prepare(`PRAGMA table_info(${table_name})`).all();

            for (const field of fields) {
                const { field_name, field_type } = field;

                const exists = columns.some(
                    column => column.name === field_name
                );
                if (!exists) {
                    db.prepare(`ALTER TABLE ${table_name} ADD COLUMN ${field_name} ${field_type}`).run();
                    migratedFields.push({
                        table_name,
                        field_name,
                    });
                };
            };
        };
        return migratedFields;;
    } catch (error) {
        console.log(`Something went wrong: service: migrateTableData: ${error}`);
        throw error;
    };
};

exports.createHSNSAC = async (data) => {
    try {
        db.exec(require("../database/schema/hsn.schema"));
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

exports.findHSNSAC = async ({
    id = "",
    created_by = "",
    code = "",
    type = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        db.exec(require("../database/schema/hsn.schema"));
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

exports.updateHSNSAC = async (id, data) => {
    try {
        db.exec(require("../database/schema/hsn.schema"));
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = @${k}`).join(", ");
        const result = db
            .prepare(`UPDATE hsn_sac SET ${setClause} WHERE id = @id`)
            .run({ ...data, id });
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: updateHSNSAC: ${error}`);
        throw error;
    };
};

exports.deleteHSNSAC = async (id) => {
    try {
        db.exec(require("../database/schema/hsn.schema"));
        const result = db
            .prepare("UPDATE hsn_sac SET is_deleted = 1 WHERE id = ?")
            .run(id);
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: deleteHSNSAC: ${error}`);
        throw error;
    };
};

exports.createGST = async (data) => {
    try {
        db.exec(require("../database/schema/gst.schema"));
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

exports.findGST = async ({
    id = "",
    created_by = "",
    total_rate = "",
    limit = "",
    skip = "",
    count = false,
}) => {
    try {
        db.exec(require("../database/schema/gst.schema"));
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

        if (total_rate) {
            query += " AND total_rate = ?";
            params.push(total_rate);
        };

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

exports.updateGST = async (id, data) => {
    try {
        db.exec(require("../database/schema/gst.schema"));
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = @${k}`).join(", ");
        const result = db
            .prepare(`UPDATE gst SET ${setClause} WHERE id = @id`)
            .run({ ...data, id });
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: updateGST: ${error}`);
        throw error;
    };
};

exports.deleteGST = async (id) => {
    try {
        db.exec(require("../database/schema/gst.schema"));
        const result = db
            .prepare("UPDATE gst SET is_deleted = 1 WHERE id = ?")
            .run(id);
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: deleteGST: ${error}`);
        throw error;
    };
};