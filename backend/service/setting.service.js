const { db } = require("../database/connection");

module.exports.createChallanSetting = async (data) => {
    try {
        const keys = Object.keys(data);
        const result = db
            .prepare(`INSERT INTO challan_setting (${keys.join(",")}) VALUES (${keys.map(k => "@" + k).join(",")})`)
            .run(data);

        return result;
    } catch (error) {
        console.log(`Something went wrong: service: createChallanSetting: ${error}`);
        throw error;
    }
};

module.exports.getChallanSetting = async ({
    id = "",
    created_by = "",
    company_id = "",
    limit = "",
    skip = "",
}) => {
    try {
        let query = "SELECT * FROM challan_setting";
        let search_key = [];
        let params = [];

        if (id) {
            search_key.push("id = ?");
            params.push(id);
        };
        if (company_id) {
            search_key.push("company_id = ?");
            params.push(company_id);
        };
        if (created_by) {
            search_key.push("created_by = ?");
            params.push(created_by);
        };

        if (search_key.length) query = `${query} WHERE ${search_key.join(" AND ")}`;
        else query = `${query}`;

        if (limit) {
            query += " LIMIT ?";
            params.push(Number(limit));
        };
        if (skip) {
            query += " OFFSET ?";
            params.push(Number(skip));
        };
        let result = db.prepare(query).all(...params);
        return result;
    } catch (error) {
        console.log(`Something went wrong: service: getChallanSetting: ${error}`);
        throw error;
    };
};

module.exports.updateChallanSetting = async ({
    id = "",
    data = {}
}) => {
    try {
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = @${k}`).join(", ");
        const result = db
            .prepare(`UPDATE challan_setting SET ${setClause} WHERE id = @id`)
            .run({ ...data, id });
        return result;
    } catch (error) {
        console.log("Something went wrong: Service: updateChallanSetting", error);
        throw error;
    };
};