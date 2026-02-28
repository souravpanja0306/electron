module.exports = `
    CREATE TABLE IF NOT EXISTS invoice (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      company_id INTEGER,
      party_id INTEGER,

      ship_to TEXT,
      type TEXT,
      invoice_no TEXT UNIQUE,
      invoice_date TEXT,
      eway_bill TEXT,
      transporter TEXT,
      lorry_no TEXT,
      lr_no TEXT
      placeOfSupply TEXT,
      data TEXT,
      total_amount INTEGER DEFAULT 0,
      total_quantity INTEGER DEFAULT 0,
      total_cgst INTEGER DEFAULT 0,
      total_sgst INTEGER DEFAULT 0,
      total_igst INTEGER DEFAULT 0,
      total_roundoff INTEGER DEFAULT 0,
      total_discount INTEGER DEFAULT 0,
      total_advance INTEGER DEFAULT 0,

      created_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      
      is_active INTEGER DEFAULT 1,
      is_deleted INTEGER DEFAULT 0
    );
`