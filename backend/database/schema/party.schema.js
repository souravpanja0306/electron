module.exports = `
  CREATE TABLE IF NOT EXISTS party (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    mobile TEXT,
    contact_person TEXT,
    address_1 TEXT,
    address_2 TEXT,
    city TEXT,
    state TEXT,
    district TEXT,
    pincode TEXT,
    country TEXT,
    gst_no TEXT,
    pan_no TEXT
  );
`;