module.exports = `
  CREATE TABLE IF NOT EXISTS money_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    company_id INTEGER,
    party_id INTEGER,

    receipt_no TEXT UNIQUE,
    receipt_date TEXT,
    data TEXT,
    remarks TEXT,

    total_value TEXT,

    created_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    is_active INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0
  );
`;