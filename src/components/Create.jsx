import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./Create.css";

function Create() {
  const navigate = useNavigate();
  const [gameTitle, setGameTitle] = useState("");
  const [categories, setCategories] = useState([
    { name: "", words: ["", "", "", ""] },
    { name: "", words: ["", "", "", ""] },
    { name: "", words: ["", "", "", ""] },
    { name: "", words: ["", "", "", ""] },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCategoryNameChange = (categoryIndex, value) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].name = value;
    setCategories(newCategories);
  };

  const handleWordChange = (categoryIndex, wordIndex, value) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].words[wordIndex] = value;
    setCategories(newCategories);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    // Get user ID from localStorage
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("You must be logged in to create a game");
      setSaving(false);
      return;
    }

    // Transform categories to API format
    const apiCategories = categories.map((category, index) => ({
      category_name: category.name,
      difficulty_level: index + 1, // 1-4 based on order
      description: null,
      words: category.words,
    }));

    const gameData = {
      title: gameTitle,
      creator_id: parseInt(userId),
      categories: apiCategories,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(gameData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create game");
        setSaving(false);
        return;
      }

      // Navigate to the newly created game
      navigate(`/game?id=${data.id}`);
    } catch (err) {
      console.error(err);
      setError("Connection error. Please make sure the server is running.");
      setSaving(false);
    }
  };

  const handleReset = () => {
    setGameTitle("");
    setCategories([
      { name: "", words: ["", "", "", ""] },
      { name: "", words: ["", "", "", ""] },
      { name: "", words: ["", "", "", ""] },
      { name: "", words: ["", "", "", ""] },
    ]);
  };

  return (
    <div className="create-container">
      <header className="create-header">
        <Link to="/home" className="back-link">
          ← Back to Home
        </Link>
        <h1>Create Connection Game</h1>
        <p className="subtitle">Create 4 categories with 4 words each</p>
      </header>

      <main className="create-main">
        <form onSubmit={handleSubmit}>
          {/* Game Title */}
          <div className="game-title-section">
            <label htmlFor="game-title">Game Title</label>
            <input
              id="game-title"
              type="text"
              placeholder="e.g., Family Trivia"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              required
              className="game-title-input"
            />
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          <div className="categories-grid">
            {categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="category-card">
                <div className="category-header">
                  <h3>Category {categoryIndex + 1}</h3>
                </div>
                <div className="category-input-group">
                  <label htmlFor={`category-name-${categoryIndex}`}>
                    Category Name
                  </label>
                  <input
                    id={`category-name-${categoryIndex}`}
                    type="text"
                    placeholder="e.g., Types of Fruit"
                    value={category.name}
                    onChange={(e) =>
                      handleCategoryNameChange(categoryIndex, e.target.value)
                    }
                    required
                  />
                </div>

                <div className="words-section">
                  <label>Words (4 required)</label>
                  <div className="words-grid">
                    {category.words.map((word, wordIndex) => (
                      <input
                        key={wordIndex}
                        type="text"
                        placeholder={`Word ${wordIndex + 1}`}
                        value={word}
                        onChange={(e) =>
                          handleWordChange(
                            categoryIndex,
                            wordIndex,
                            e.target.value
                          )
                        }
                        required
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="action-buttons">
            <button
              type="button"
              onClick={handleReset}
              className="btn-reset"
              disabled={saving}
            >
              Reset All
            </button>
            <button type="submit" className="btn-submit" disabled={saving}>
              {saving ? "Creating Game..." : "Create & Play Game"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Create;
