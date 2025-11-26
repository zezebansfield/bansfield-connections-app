const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create database file
const dbPath = path.join(__dirname, "bansfield_connections.db");
const db = new sqlite3.Database(dbPath);

console.log("Setting up SQLite database...\n");

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

// Run schema setup
db.serialize(() => {
  // Drop tables if they exist (for clean setup)
  console.log("Dropping existing tables...");
  db.run("DROP TABLE IF EXISTS words");
  db.run("DROP TABLE IF EXISTS categories");
  db.run("DROP TABLE IF EXISTS user_played_games");
  db.run("DROP TABLE IF EXISTS games");
  db.run("DROP TABLE IF EXISTS users");

  // Create users table
  console.log("Creating users table...");
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create games table
  console.log("Creating games table...");
  db.run(`
    CREATE TABLE games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      creator_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create categories table
  console.log("Creating categories table...");
  db.run(`
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      category_name TEXT NOT NULL,
      difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 4),
      description TEXT,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `);

  // Create words table
  console.log("Creating words table...");
  db.run(`
    CREATE TABLE words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      word TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);

  // Create user_played_games junction table
  console.log("Creating user_played_games table...");
  db.run(`
    CREATE TABLE user_played_games (
      user_id INTEGER NOT NULL,
      game_id INTEGER NOT NULL,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, game_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `);

  // Insert mock user
  console.log("\nInserting mock data...");
  db.run(
    "INSERT INTO users (username) VALUES (?)",
    ["john_doe"],
    function (err) {
      if (err) {
        console.error("Error inserting user:", err);
        return;
      }
      console.log("✓ Created user: john_doe");

      const userId = this.lastID;

      // Insert mock game
      db.run(
        "INSERT INTO games (title, creator_id) VALUES (?, ?)",
        ["Tech Terms", userId],
        function (err) {
          if (err) {
            console.error("Error inserting game:", err);
            return;
          }
          console.log("✓ Created game: Tech Terms");

          const gameId = this.lastID;

          // Define categories
          const categories = [
            {
              name: "Programming Languages",
              level: 1,
              desc: "Popular programming languages",
              words: ["PYTHON", "JAVASCRIPT", "JAVA", "RUBY"],
            },
            {
              name: "Web Technologies",
              level: 2,
              desc: "Technologies used in web development",
              words: ["REACT", "ANGULAR", "VUE", "SVELTE"],
            },
            {
              name: "Database Systems",
              level: 3,
              desc: "Types of databases",
              words: ["MYSQL", "POSTGRESQL", "MONGODB", "REDIS"],
            },
            {
              name: "Cloud Providers",
              level: 4,
              desc: "Major cloud service providers",
              words: ["AWS", "AZURE", "GCP", "ORACLE"],
            },
          ];

          let categoriesInserted = 0;

          // Insert each category and its words
          categories.forEach((category) => {
            db.run(
              "INSERT INTO categories (game_id, category_name, difficulty_level, description) VALUES (?, ?, ?, ?)",
              [gameId, category.name, category.level, category.desc],
              function (err) {
                if (err) {
                  console.error("Error inserting category:", err);
                  return;
                }
                console.log(`✓ Created category: ${category.name}`);

                const categoryId = this.lastID;

                // Insert words for this category
                const stmt = db.prepare(
                  "INSERT INTO words (category_id, word) VALUES (?, ?)"
                );
                category.words.forEach((word) => {
                  stmt.run(categoryId, word);
                });
                stmt.finalize();

                categoriesInserted++;

                // If all categories done, mark game as played and show results
                if (categoriesInserted === categories.length) {
                  // Mark game as played by user
                  db.run(
                    "INSERT INTO user_played_games (user_id, game_id) VALUES (?, ?)",
                    [userId, gameId],
                    (err) => {
                      if (err) {
                        console.error("Error marking game as played:", err);
                        return;
                      }
                      console.log("✓ Marked game as played by john_doe");

                      // Display all data
                      console.log("\n" + "=".repeat(50));
                      console.log("DATABASE SETUP COMPLETE!");
                      console.log("=".repeat(50));

                      // Show users
                      db.all("SELECT * FROM users", (err, rows) => {
                        if (!err && rows) {
                          console.log("\n📊 USERS:");
                          console.table(rows);
                        }

                        // Show games
                        db.all("SELECT * FROM games", (err, rows) => {
                          if (!err && rows) {
                            console.log("\n🎮 GAMES:");
                            console.table(rows);
                          }

                          // Show categories
                          db.all(
                            `SELECT c.*, g.title as game_title 
                             FROM categories c 
                             JOIN games g ON c.game_id = g.id 
                             ORDER BY c.difficulty_level`,
                            (err, rows) => {
                              if (!err && rows) {
                                console.log("\n📁 CATEGORIES:");
                                console.table(rows);
                              }

                              // Show words
                              db.all(
                                `SELECT w.*, c.category_name 
                                 FROM words w 
                                 JOIN categories c ON w.category_id = c.id 
                                 ORDER BY c.difficulty_level, w.id`,
                                (err, rows) => {
                                  if (!err && rows) {
                                    console.log("\n📝 WORDS:");
                                    console.table(rows);
                                  }

                                  // Show played games
                                  db.all(
                                    `SELECT upg.*, u.username, g.title 
                                     FROM user_played_games upg 
                                     JOIN users u ON upg.user_id = u.id 
                                     JOIN games g ON upg.game_id = g.id`,
                                    (err, rows) => {
                                      if (!err && rows) {
                                        console.log("\n✅ USER PLAYED GAMES:");
                                        console.table(rows);
                                      }

                                      console.log(
                                        "\n✅ Setup complete! Run 'npm run server' to start the API."
                                      );
                                      db.close();
                                    }
                                  );
                                }
                              );
                            }
                          );
                        });
                      });
                    }
                  );
                }
              }
            );
          });
        }
      );
    }
  );
});
