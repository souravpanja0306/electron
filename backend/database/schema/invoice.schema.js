module.exports = `
    CREATE TABLE IF NOT EXISTS invoice (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      party_id INTEGER,
      invoice_no TEXT UNIQUE,
      invoice_date TEXT,
      total_amount REAL,
      created_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1,
      is_deleted INTEGER DEFAULT 0,
      FOREIGN KEY (party_id) REFERENCES party(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
`