module.exports = `
  CREATE TABLE IF NOT EXISTS challan_setting (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
  
    company_id INTEGER,

    prefix TEXT,
    suffix TEXT,
    starting INT,
    terms TEXT,
    remarks TEXT,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

    is_active INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0
  );
`;