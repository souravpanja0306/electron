/*
 * Lookups shared by the document controllers (challan, invoice, money receipt):
 * - checkLinks(): the company / parties / CHA on a document must exist and belong to the user.
 * - loadById(): fetch many rows in one query, keyed by id (instead of one query per row).
 */
const { db } = require("../database/connection");
const { toId } = require("./http");

// Fixed table names only; never user input.
const OWNED_TABLES = new Set(["company", "party", "cha"]);

const ownedRow = (table, id, userId) => {
    if (!OWNED_TABLES.has(table)) throw new Error(`Unknown table ${table}`);
    return db.prepare(`SELECT id FROM "${table}" WHERE id = ? AND created_by = ? AND COALESCE(is_deleted, 0) = 0`).get(id, userId);
};

/**
 * Returns a user-facing message for the first missing/foreign link, or "".
 * `parties`: [{ id, label }] e.g. [{ id: consignor_id, label: "Consignor" }].
 */
const checkLinks = ({ userId, company_id, parties = [], cha }) => {
    if (company_id !== undefined) {
        const id = toId(company_id);
        if (!id || !ownedRow("company", id, userId)) return "The selected company was not found.";
    };
    for (const party of parties) {
        const id = toId(party.id);
        if (!id || !ownedRow("party", id, userId)) return `The selected ${party.label.toLowerCase()} was not found.`;
    };
    if (cha) {
        const id = toId(cha);
        if (!id || !ownedRow("cha", id, userId)) return "The selected CHA was not found.";
    };
    return "";
};

const LOADABLE = new Set(["company", "party", "cha", "invoice"]);

/** Map of id -> row for the given ids (duplicates and empties ignored). */
const loadById = (table, ids) => {
    if (!LOADABLE.has(table)) throw new Error(`Unknown table ${table}`);
    const unique = [...new Set(ids.map(toId).filter(Boolean))];
    if (!unique.length) return new Map();
    const rows = db.prepare(`SELECT * FROM "${table}" WHERE id IN (${unique.map(() => "?").join(",")})`).all(...unique);
    return new Map(rows.map((row) => [row.id, row]));
};

/** Row from a loadById() map, or null. */
const pick = (map, id) => map.get(toId(id)) || null;

module.exports = { checkLinks, loadById, pick };
