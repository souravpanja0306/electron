// Last subscription / lock status received from the licence server (MongoDB), so the app
// can keep enforcing it while offline. `signature` is an HMAC of the row with this install's
// secret: a hand-edited row is ignored and the app asks the server again.
module.exports = `
  CREATE TABLE IF NOT EXISTS access_status (
    user_id INTEGER PRIMARY KEY,
    data TEXT NOT NULL,
    checked_at TEXT NOT NULL,
    signature TEXT NOT NULL
  )
`;
