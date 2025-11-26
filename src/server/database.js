const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create database file in server directory
const dbPath = path.join(__dirname, "bansfield_connections.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
    process.exit(1);
  } else {
    console.log("Connected to SQLite database at:", dbPath);
    // Enable foreign keys and WAL mode for better concurrent access
    db.run("PRAGMA foreign_keys = ON", (err) => {
      if (err) {
        console.error("Error enabling foreign keys:", err);
      }
    });
    // Enable WAL mode for better concurrency with multiple users
    db.run("PRAGMA journal_mode = WAL", (err) => {
      if (err) {
        console.error("Error enabling WAL mode:", err);
      } else {
        console.log("WAL mode enabled for better concurrent access");
      }
    });
  }
});

module.exports = db;
