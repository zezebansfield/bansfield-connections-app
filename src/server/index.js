const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

console.log("Server starting...");

// API Routes

// Get all users
app.get("/api/users", (req, res) => {
  db.all("SELECT * FROM users", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get user by ID with their created and played games
app.get("/api/users/:id", (req, res) => {
  const userId = req.params.id;

  // Get user info
  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get created games
    db.all(
      "SELECT id FROM games WHERE creator_id = ?",
      [userId],
      (err, createdGames) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Get played games
        db.all(
          "SELECT game_id FROM user_played_games WHERE user_id = ?",
          [userId],
          (err, playedGames) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            user.created_games = createdGames.map((g) => g.id);
            user.played_games = playedGames.map((g) => g.game_id);
            res.json(user);
          }
        );
      }
    );
  });
});

// Get all games
app.get("/api/games", (req, res) => {
  const query = `
    SELECT g.*, u.username as creator_name
    FROM games g
    JOIN users u ON g.creator_id = u.id
    ORDER BY g.created_at DESC
  `;

  db.all(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get game by ID with all categories and words
app.get("/api/games/:id", (req, res) => {
  const gameId = req.params.id;

  // Get game info
  db.get(
    `SELECT g.*, u.username as creator_name
     FROM games g
     JOIN users u ON g.creator_id = u.id
     WHERE g.id = ?`,
    [gameId],
    (err, game) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Get categories for this game
      db.all(
        "SELECT * FROM categories WHERE game_id = ? ORDER BY difficulty_level",
        [gameId],
        (err, categories) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Get words for each category
          let processedCategories = 0;
          const categoriesWithWords = [];

          if (categories.length === 0) {
            game.categories = [];
            return res.json(game);
          }

          categories.forEach((category) => {
            db.all(
              "SELECT word FROM words WHERE category_id = ?",
              [category.id],
              (err, words) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }

                categoriesWithWords.push({
                  id: category.id,
                  category_name: category.category_name,
                  difficulty_level: category.difficulty_level,
                  description: category.description,
                  words: words.map((w) => w.word),
                });

                processedCategories++;

                // When all categories are processed, return the result
                if (processedCategories === categories.length) {
                  // Sort by difficulty level
                  categoriesWithWords.sort(
                    (a, b) => a.difficulty_level - b.difficulty_level
                  );
                  game.categories = categoriesWithWords;
                  res.json(game);
                }
              }
            );
          });
        }
      );
    }
  );
});

// Create a new user
app.post("/api/users", (req, res) => {
  const { username } = req.body;

  db.run("INSERT INTO users (username) VALUES (?)", [username], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json([{ id: this.lastID, username }]);
  });
});

// Create a new game
app.post("/api/games", (req, res) => {
  const { title, creator_id, categories } = req.body;

  // Validate input
  if (!title || !creator_id || !categories || categories.length !== 4) {
    return res.status(400).json({
      error:
        "Invalid input. Game must have a title, creator_id, and 4 categories",
    });
  }

  // Validate each category has 4 words
  for (const category of categories) {
    if (!category.words || category.words.length !== 4) {
      return res.status(400).json({
        error: "Each category must have exactly 4 words",
      });
    }
  }

  // Insert game
  db.run(
    "INSERT INTO games (title, creator_id) VALUES (?, ?)",
    [title, creator_id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const gameId = this.lastID;
      let categoriesInserted = 0;
      let hasError = false;

      // Insert each category and its words
      categories.forEach((category) => {
        if (hasError) return;

        db.run(
          "INSERT INTO categories (game_id, category_name, difficulty_level, description) VALUES (?, ?, ?, ?)",
          [
            gameId,
            category.category_name,
            category.difficulty_level,
            category.description || null,
          ],
          function (err) {
            if (err) {
              hasError = true;
              return res.status(500).json({ error: err.message });
            }

            const categoryId = this.lastID;

            // Insert words for this category
            const stmt = db.prepare(
              "INSERT INTO words (category_id, word) VALUES (?, ?)"
            );

            category.words.forEach((word) => {
              stmt.run(categoryId, word);
            });

            stmt.finalize((err) => {
              if (err) {
                hasError = true;
                return res.status(500).json({ error: err.message });
              }

              categoriesInserted++;

              // If all categories inserted, return success
              if (categoriesInserted === categories.length && !hasError) {
                res.status(201).json({ id: gameId, title, creator_id });
              }
            });
          }
        );
      });
    }
  );
});

// Mark a game as played by a user
app.post("/api/users/:userId/played/:gameId", (req, res) => {
  const { userId, gameId } = req.params;

  // Check if already played
  db.get(
    "SELECT * FROM user_played_games WHERE user_id = ? AND game_id = ?",
    [userId, gameId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row) {
        // Update played_at timestamp
        db.run(
          "UPDATE user_played_games SET played_at = CURRENT_TIMESTAMP WHERE user_id = ? AND game_id = ?",
          [userId, gameId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Game play time updated" });
          }
        );
      } else {
        // Insert new record
        db.run(
          "INSERT INTO user_played_games (user_id, game_id) VALUES (?, ?)",
          [userId, gameId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Game marked as played" });
          }
        );
      }
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log("\nAvailable endpoints:");
  console.log("  GET  /api/users");
  console.log("  GET  /api/users/:id");
  console.log("  POST /api/users");
  console.log("  GET  /api/games");
  console.log("  GET  /api/games/:id");
  console.log("  POST /api/games");
  console.log("  POST /api/users/:userId/played/:gameId");
});
