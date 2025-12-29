const db = require("../database/connection");

const addParty = (data) => {
    try {
        const fields = [
            "company_name", "email", "mobile", "owner",
            "address_1", "address_2", "city", "state", "district",
            "pincode", "country", "gst", "pan", "trade_licence",
            "bank", "ifse", "branch", "account_no"
        ];
        const values = fields.map(item => data[item]);
        const result = db
            .prepare(`INSERT INTO party (${fields.join(",")}) VALUES (${fields.map(() => "?").join(",")})`)
            .run(values);

        return {
            status: 200,
            message: "Data created successfully.",
            body: result,
        };
    } catch (error) {
        console.log(error)
    };
};

const listParty = ({
    id = "",
    skip = 0,
    limit = 0
}) => {
    try {
        let query = "SELECT * FROM party";
        let params = [];

        if (id) {
            query += " WHERE id = ?";
            params.push(id);
        };

        if (limit) {
            query += " LIMIT ? OFFSET ?";
            params.push(Number(limit), Number(skip));
        };
        console.log("🚀 ~ listParty ~ query:", query)
        let result = db.prepare(query).all(...params);
        return {
            status: 200,
            message: "Data fetched succesfully.",
            body: result,
        };
    } catch (error) {
        console.log(error);
    };
};

const removeParty = async ({
    ids = ""
}) => {
    try {
        if (!ids.length) throw new Error("ID is required");
        const placeholders = ids.map(() => "?").join(",");

        let result = await db.prepare(`DELETE FROM party WHERE id IN (${placeholders})`).run(...ids);
        return result;
    } catch (error) {
        console.log(error);
    };
};

module.exports = { addParty, listParty, removeParty };
