const db = require("../database/connection");

const addParty = (data) => {
    return db
        .prepare(`
            INSERT INTO party (
              company_name, email, mobile, owner,
              address_1, address_2, city, state, district,
              pincode, country, gst, pan, trade_licence,
              bank, ifse, branch, account_no
            ) VALUES (
              ?, ?, ?, ?,
              ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?,
              ?, ?, ?, ?
            )
        `)
        .run(
            data.company_name,
            data.email,
            data.mobile,
            data.owner,
            data.address_1,
            data.address_2,
            data.city,
            data.state,
            data.district,
            data.pincode,
            data.country,
            data.gst,
            data.pan,
            data.trade_licence,
            data.bank,
            data.ifse,
            data.branch,
            data.account_no
        );
};

const listParty = ({
    id = "",
    skip = 0,
    limit = 0
}) => {
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

    return db.prepare(query).all(...params);
};


const removeParty = ({
    ids = ""
}) => {
    if (!ids.length) throw new Error("ID is required");
    const placeholders = ids.map(() => "?").join(",");

    return db
        .prepare(`DELETE FROM party WHERE id IN (${placeholders})`)
        .run(...ids);
};

module.exports = { addParty, listParty, removeParty };
