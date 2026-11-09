// Credit notes and debit notes. One table; `note_type` says which.
// A note is raised against a party and may point at the invoice it corrects (invoice_id).
module.exports = `
  CREATE TABLE IF NOT EXISTS invoice_note (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    note_type TEXT NOT NULL CHECK (note_type IN ('credit', 'debit')),
    company_id INTEGER,
    party_id INTEGER,
    invoice_id INTEGER,

    note_no TEXT,
    note_date TEXT,
    reason TEXT,
    placeOfSupply TEXT,
    data TEXT,

    total_quantity REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    total_cgst REAL DEFAULT 0,
    total_sgst REAL DEFAULT 0,
    total_igst REAL DEFAULT 0,

    created_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

    is_active INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0
  );
`;
