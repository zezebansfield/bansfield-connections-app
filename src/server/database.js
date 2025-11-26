const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create database file in server directory
const dbPath = path.join(__dirname, "bansfield_connections.db");

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error("Error opening database:", err);
    console.error("Make sure you've run 'npm run setup-db' first!");
    process.exit(1);
  } else {
    console.log("Connected to SQLite database at:", dbPath);
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON", (err) => {
      if (err) {
        console.error("Error enabling foreign keys:", err);
      }
    });
  }
});

module.exports = db;
