// Credit / debit notes (table invoice_note).
const { db } = require("../database/connection");

module.exports.insertNote = async (data) => {
    const keys = Object.keys(data);
    return db
        .prepare(`INSERT INTO invoice_note (${keys.join(",")}) VALUES (${keys.map((k) => "@" + k).join(",")})`)
        .run(data);
};

module.exports.findNotes = async ({
    id = "",
    created_by = "",
    note_type = "",
    note_no = "",
    company_id = "",
    party_id = "",
    invoice_id = "",
    startDate = "",
    endDate = "",
    search = "",
    count = false,
} = {}) => {
    let query = "SELECT * FROM invoice_note WHERE is_deleted = 0";
    const params = [];

    if (id) { query += " AND id = ?"; params.push(id); };
    if (created_by) { query += " AND created_by = ?"; params.push(created_by); };
    if (note_type) { query += " AND note_type = ?"; params.push(note_type); };
    if (note_no) { query += " AND note_no = ?"; params.push(note_no); };
    if (company_id) { query += " AND company_id = ?"; params.push(company_id); };
    if (party_id) { query += " AND party_id = ?"; params.push(party_id); };
    if (invoice_id) { query += " AND invoice_id = ?"; params.push(invoice_id); };

    if (startDate && endDate) {
        query += " AND note_date BETWEEN ? AND ?";
        params.push(startDate, endDate);
    } else if (startDate) {
        query += " AND note_date >= ?";
        params.push(startDate);
    } else if (endDate) {
        query += " AND note_date <= ?";
        params.push(endDate);
    };

    if (search) {
        // Note no, reason, the party's name or the original invoice number.
        query += ` AND (note_no LIKE ? OR reason LIKE ?
            OR party_id IN (SELECT id FROM party WHERE company_name LIKE ?)
            OR invoice_id IN (SELECT id FROM invoice WHERE invoice_no LIKE ?))`;
        const like = `%${search}%`;
        params.push(like, like, like, like);
    };

    if (count) return db.prepare(`SELECT COUNT(*) AS total FROM (${query})`).get(...params).total;

    query += " ORDER BY note_date DESC, id DESC";
    return db.prepare(query).all(...params);
};

module.exports.updateNote = async (id, data) => {
    const keys = Object.keys(data);
    const setClause = keys.map((k) => `${k} = @${k}`).join(", ");
    return db
        .prepare(`UPDATE invoice_note SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`)
        .run({ ...data, id });
};

module.exports.deleteNote = async ({ id }) => {
    const result = db.prepare("UPDATE invoice_note SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
    return { deleted: result.changes };
};
