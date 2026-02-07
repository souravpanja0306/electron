// GST / Tax master
module.exports = `
  CREATE TABLE IF NOT EXISTS gst (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL,
    total_rate REAL NOT NULL,

    cgst REAL DEFAULT 0,
    sgst REAL DEFAULT 0,
    igst REAL DEFAULT 0,

    type TEXT CHECK(type IN ('percentage','fixed')) DEFAULT 'percentage',

    created_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    is_active INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0
  );
`;
