module.exports = `
  CREATE TABLE IF NOT EXISTS cha (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    name TEXT,
    mobile TEXT,
    address TEXT,

    created_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    is_active INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0
  );
`;
