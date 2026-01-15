module.exports = `
    CREATE TABLE IF NOT EXISTS invoice (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      invoice_no TEXT UNIQUE,
      eway_bill TEXT,
      party_id INTEGER,
      transporter TEXT,
      placeOfSupply TEXT,
      data TEXT,
      invoice_date TEXT,
      total_amount REAL,
      created_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1,
      is_deleted INTEGER DEFAULT 0
    );
`