// HSN & SAC master
module.exports = `
  CREATE TABLE IF NOT EXISTS hsn_sac (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    code TEXT NOT NULL,
    type TEXT CHECK(type IN ('HSN','SAC')) NOT NULL,
    description TEXT,
    gst_rate REAL DEFAULT 0,

    created_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    is_active INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0
  );
`;
