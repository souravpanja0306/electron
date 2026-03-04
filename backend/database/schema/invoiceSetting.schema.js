module.exports = `
  CREATE TABLE IF NOT EXISTS invoice_setting (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,

    invoice_prefix TEXT DEFAULT 'INV-',
    invoice_suffix TEXT DEFAULT '',
    invoice_start_number INTEGER DEFAULT 1,

    is_gst INTEGER DEFAULT 1,
    default_gst_type TEXT DEFAULT 'CGST_SGST',

    default_due_days INTEGER DEFAULT 30,
    show_discount INTEGER DEFAULT 1,
    show_shipping INTEGER DEFAULT 0,
    show_signature INTEGER DEFAULT 1,

    terms_and_conditions TEXT,
    signature_image TEXT,

    paper_size TEXT DEFAULT 'A4',
    orientation TEXT DEFAULT 'portrait',
    show_logo INTEGER DEFAULT 1,
    header_text TEXT,
    footer_text TEXT,
    thermal_print INTEGER DEFAULT 0,
    thermal_size TEXT DEFAULT '80mm',

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  );
`;