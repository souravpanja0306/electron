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

module.exports.getUserTheme = async ({ user_id }) => {
    const row = db.prepare("SELECT theme FROM user_setting WHERE user_id = ?").get(user_id);
    return row ? row.theme : null;
};

module.exports.saveUserTheme = async ({ user_id, theme }) => {
    return db.prepare(`
        INSERT INTO user_setting (user_id, theme) VALUES (@user_id, @theme)
        ON CONFLICT(user_id) DO UPDATE SET theme = @theme, updated_at = CURRENT_TIMESTAMP
    `).run({ user_id, theme });
};

// CHA field is shown unless the user switched it off.
module.exports.getUserShowCha = async ({ user_id }) => {
    const row = db.prepare("SELECT show_cha FROM user_setting WHERE user_id = ?").get(user_id);
    return !row || row.show_cha !== 0;
};

module.exports.saveUserShowCha = async ({ user_id, show_cha }) => {
    return db.prepare(`
        INSERT INTO user_setting (user_id, show_cha) VALUES (@user_id, @show_cha)
        ON CONFLICT(user_id) DO UPDATE SET show_cha = @show_cha, updated_at = CURRENT_TIMESTAMP
    `).run({ user_id, show_cha });
};

module.exports.createInvoiceSetting = async (data) => {
    const keys = Object.keys(data);
    return db.prepare(`INSERT INTO invoice_setting (${keys.join(",")}) VALUES (${keys.map(key => `@${key}`).join(",")})`).run(data);
};

module.exports.getInvoiceSetting = async ({ company_id = "" }) => {
    let query = "SELECT * FROM invoice_setting";
    const params = [];
    if (company_id) {
        query += " WHERE company_id = ?";
        params.push(company_id);
    };
    return db.prepare(query).all(...params);
};

module.exports.updateInvoiceSetting = async ({ id, data }) => {
    const keys = Object.keys(data);
    const setClause = keys.map(key => `${key} = @${key}`).join(", ");
    return db.prepare(`UPDATE invoice_setting SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run({ ...data, id });
};
