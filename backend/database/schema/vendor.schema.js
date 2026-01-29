module.exports = `
  CREATE TABLE IF NOT EXISTS vendor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT,
    email TEXT,
    mobile TEXT,
    owner TEXT,
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
    is_active INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0
  );
`;