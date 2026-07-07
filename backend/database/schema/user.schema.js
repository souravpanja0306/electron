module.exports = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    name TEXT,
    mobile TEXT,
    email TEXT,
    username TEXT UNIQUE,
    password TEXT,
    machine_id TEXT,
    license_key TEXT,

    address_1 TEXT,
    address_2 TEXT,
    city TEXT,
    state TEXT,
    district TEXT,
    pincode TEXT,
    country TEXT,

    gst TEXT,
    pan TEXT,
    trade_licence TEXT,
    bank TEXT,
    ifse TEXT,
    branch TEXT,
    account_no TEXT,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

    is_active INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0
  )
`;
