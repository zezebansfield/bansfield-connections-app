# API Usage Examples

This file contains examples of how to use the API from your React frontend.

## Base URL

```javascript
const API_BASE_URL = "http://localhost:3001/api";
```

## Example API Calls

### 1. Get All Games

```javascript
// Fetch all available games
const getAllGames = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/games`);
    const games = await response.json();
    console.log(games);
    // Returns: [{ id, title, creator_id, creator_name, created_at }]
  } catch (error) {
    console.error("Error fetching games:", error);
  }
};
```

### 2. Get a Specific Game (with all categories and words)

```javascript
// Fetch a game by ID with all its categories and words
const getGameById = async (gameId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}`);
    const game = await response.json();
    console.log(game);
    /*
    Returns:
    {
      id: 1,
      title: "Tech Terms",
      creator_id: 1,
      creator_name: "john_doe",
      created_at: "2025-11-26 15:57:00",
      categories: [
        {
          id: 1,
          category_name: "Programming Languages",
          difficulty_level: 1,
          description: "Popular programming languages",
          words: ["PYTHON", "JAVASCRIPT", "JAVA", "RUBY"]
        },
        // ... 3 more categories
      ]
    }
    */
  } catch (error) {
    console.error("Error fetching game:", error);
  }
};
```

### 3. Create a New User

```javascript
// Create a new user
const createUser = async (username) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    const newUser = await response.json();
    console.log(newUser);
    // Returns: { id: 2, username: "jane_smith" }
  } catch (error) {
    console.error("Error creating user:", error);
  }
};
```

### 4. Get User Details (with their games)

```javascript
// Fetch user with their created and played games
const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    const user = await response.json();
    console.log(user);
    /*
    Returns:
    {
      id: 1,
      username: "john_doe",
      created_at: "2025-11-26 15:57:00",
      created_games: [1, 2, 3],  // Array of game IDs they created
      played_games: [1, 2, 3, 4] // Array of game IDs they played
    }
    */
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};
```

### 5. Create a New Game

```javascript
// Create a new Connections game
const createGame = async (title, creatorId, categories) => {
  try {
    const response = await fetch(`${API_BASE_URL}/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        creator_id: creatorId,
        categories: categories, // Must be an array of 4 categories
      }),
    });
    const newGame = await response.json();
    console.log(newGame);
    // Returns: { id: 2, title: "My Game", creator_id: 1 }
  } catch (error) {
    console.error("Error creating game:", error);
  }
};

// Example usage:
createGame("Sports Terms", 1, [
  {
    category_name: "Ball Sports",
    difficulty_level: 1,
    description: "Sports played with a ball",
    words: ["SOCCER", "BASKETBALL", "TENNIS", "GOLF"],
  },
  {
    category_name: "Water Sports",
    difficulty_level: 2,
    description: "Sports in water",
    words: ["SWIMMING", "SURFING", "DIVING", "KAYAKING"],
  },
  {
    category_name: "Winter Sports",
    difficulty_level: 3,
    description: "Sports in snow or ice",
    words: ["SKIING", "HOCKEY", "SKATING", "SNOWBOARDING"],
  },
  {
    category_name: "Combat Sports",
    difficulty_level: 4,
    description: "Fighting sports",
    words: ["BOXING", "JUDO", "WRESTLING", "KARATE"],
  },
]);
```

### 6. Mark a Game as Played

```javascript
// Mark that a user has played a game
const markGameAsPlayed = async (userId, gameId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/played/${gameId}`,
      {
        method: "POST",
      }
    );
    const result = await response.json();
    console.log(result);
    // Returns: { message: "Game marked as played" }
  } catch (error) {
    console.error("Error marking game as played:", error);
  }
};
```

## React Component Example

Here's a complete example of a React component that fetches and displays games:

```javascript
import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:3001/api";

function GamesList() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all games on component mount
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/games`);
      const data = await response.json();
      setGames(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching games:", error);
      setLoading(false);
    }
  };

  const fetchGameDetails = async (gameId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}`);
      const data = await response.json();
      setSelectedGame(data);
    } catch (error) {
      console.error("Error fetching game details:", error);
    }
  };

  if (loading) {
    return <div>Loading games...</div>;
  }

  return (
    <div>
      <h1>Available Games</h1>
      <div className="games-list">
        {games.map((game) => (
          <div key={game.id} onClick={() => fetchGameDetails(game.id)}>
            <h3>{game.title}</h3>
            <p>Created by: {game.creator_name}</p>
            <p>Date: {game.created_at}</p>
          </div>
        ))}
      </div>

      {selectedGame && (
        <div className="game-details">
          <h2>{selectedGame.title}</h2>
          <p>Created by: {selectedGame.creator_name}</p>
          <h3>Categories:</h3>
          {selectedGame.categories.map((category) => (
            <div key={category.id}>
              <h4>
                {category.category_name} (Difficulty:{" "}
                {category.difficulty_level})
              </h4>
              <p>{category.description}</p>
              <div className="words">
                {category.words.map((word, idx) => (
                  <span key={idx} className="word-box">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GamesList;
```

## Important Notes

1. **CORS**: The server is configured with CORS enabled, so you can make requests from your React app running on port 3000.

2. **Error Handling**: Always wrap API calls in try-catch blocks to handle network errors gracefully.

3. **Game Structure**: Each game must have exactly 4 categories, and each category must have exactly 4 words.

4. **Difficulty Levels**: Categories have difficulty levels from 1-4:

   - 1 = Easiest
   - 2 = Easy
   - 3 = Hard
   - 4 = Hardest

5. **Authentication**: Currently, there's no authentication system. You may want to add user login/sessions in the future.

## Next Steps

To integrate this API into your React app:

1. Update your `Create.jsx` component to POST new games to the API
2. Update your `Game.jsx` component to fetch game data from the API
3. Update your `Home.jsx` component to display the list of available games from the API
4. Consider adding a user login system to track who's creating and playing games
