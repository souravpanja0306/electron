module.exports = `
    CREATE TABLE IF NOT EXISTS challan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      
      consignor_id INTEGER,
      consignee_id INTEGER,
      
      cn_no TEXT UNIQUE,
      date TEXT,
      from_loc TEXT,
      to_loc TEXT,
      
      invoice_no TEXT,
      way_bill_no TEXT,
      truck_no TEXT,
      note TEXT,
      
      data TEXT,

      created_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      
      is_active INTEGER DEFAULT 1,
      is_deleted INTEGER DEFAULT 0
    );
`