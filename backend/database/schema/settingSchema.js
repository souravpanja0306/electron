module.exports = `
  CREATE TABLE IF NOT EXISTS user_setting (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,

    theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;
