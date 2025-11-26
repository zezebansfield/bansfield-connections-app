import {
  useLocation,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import "./Game.css";

function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("id");
  const { categories: stateCategories } = location.state || {};

  const [categories, setCategories] = useState(stateCategories || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gameTitle, setGameTitle] = useState("");

  const [shuffledWords, setShuffledWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [foundCategories, setFoundCategories] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, message: "", type: "" });
  const [hardMode, setHardMode] = useState(false);
  const [guessesRemaining, setGuessesRemaining] = useState(4);
  const [gameOver, setGameOver] = useState(false);

  // Fetch game from API if id is in URL
  useEffect(() => {
    if (gameId && !stateCategories) {
      setLoading(true);
      fetch(`${API_BASE_URL}/games/${gameId}`, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch game");
          }
          return response.json();
        })
        .then((data) => {
          // Transform API categories to match expected format
          const transformedCategories = data.categories.map((cat) => ({
            name: cat.category_name,
            words: cat.words,
            difficulty_level: cat.difficulty_level,
            description: cat.description,
          }));
          setCategories(transformedCategories);
          setGameTitle(data.title);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load game");
          setLoading(false);
        });
    }
  }, [gameId, stateCategories]);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      if (!loading && !gameId) {
        navigate("/create");
      }
      return;
    }

    // Flatten all words from all categories and shuffle them
    const allWords = categories.flatMap((category) => category.words);
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  }, [categories, navigate, loading, gameId]);

  const handleWordClick = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else if (selectedWords.length < 4) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleSubmit = () => {
    if (selectedWords.length !== 4) {
      setModal({
        isOpen: true,
        message: "Please select exactly 4 words!",
        type: "error",
      });
      return;
    }

    // Check if selected words match any category exactly
    const matchedCategory = categories.find((category) => {
      return selectedWords.every((word) => category.words.includes(word));
    });

    if (matchedCategory) {
      setModal({
        isOpen: true,
        message: `Correct! You found: ${matchedCategory.name}`,
        type: "success",
      });
      setFoundCategories([...foundCategories, matchedCategory]);
      setShuffledWords(
        shuffledWords.filter((word) => !selectedWords.includes(word))
      );
      setSelectedWords([]);
    } else {
      // Incorrect guess - decrement guesses in hard mode
      if (hardMode) {
        const newGuessesRemaining = guessesRemaining - 1;
        setGuessesRemaining(newGuessesRemaining);

        if (newGuessesRemaining === 0) {
          setGameOver(true);
          setModal({
            isOpen: true,
            message: "Game Over! You've run out of guesses in Hard Mode.",
            type: "error",
          });
          setSelectedWords([]);
          return;
        }
      }

      // Check how close they are to each category
      let closestMatch = 0;
      categories.forEach((category) => {
        const matchingWords = selectedWords.filter((word) =>
          category.words.includes(word)
        );
        if (matchingWords.length > closestMatch) {
          closestMatch = matchingWords.length;
        }
      });

      // Provide feedback based on how close they are
      let message = "";
      if (closestMatch === 3) {
        message = "One away! You have 3 correct words.";
      } else if (closestMatch === 2) {
        message = "Two away! You have 2 correct words.";
      } else if (closestMatch === 1) {
        message = "No matching words found in any category.";
      } else {
        message = "Not quite! None of these words belong to the same category.";
      }

      setModal({
        isOpen: true,
        message: message,
        type: "info",
      });

      setSelectedWords([]);
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, message: "", type: "" });
  };

  const toggleHardMode = () => {
    if (!hardMode) {
      // Turning on hard mode
      setHardMode(true);
      setGuessesRemaining(4);
      setGameOver(false);
    } else {
      // Turning off hard mode
      setHardMode(false);
      setGuessesRemaining(4);
      setGameOver(false);
    }
  };

  const restartGame = () => {
    // Reset game state
    setGameOver(false);
    setGuessesRemaining(4);
    setFoundCategories([]);
    setSelectedWords([]);

    // Re-shuffle all words
    const allWords = categories.flatMap((category) => category.words);
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  };

  const handleDeselectAll = () => {
    setSelectedWords([]);
  };

  const handleShuffle = () => {
    setShuffledWords([...shuffledWords].sort(() => Math.random() - 0.5));
  };

  if (loading) {
    return (
      <div className="game-container">
        <div className="loading-container">
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/home" className="back-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!categories) {
    return null;
  }

  return (
    <div className="game-container">
      {/* Modal */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <p>{modal.message}</p>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="modal-close-btn">
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="game-header">
        <Link to="/home" className="back-link">
          ← Back to Home
        </Link>
        <h1>{gameTitle || "Connections Game"}</h1>
        <p className="subtitle">Find groups of four related words</p>
        <button onClick={toggleHardMode} className="hard-mode-toggle">
          {hardMode ? "🔥 Hard Mode: ON" : "Hard Mode: OFF"}
        </button>
      </header>

      <main className="game-main">
        {/* Hard Mode Guesses Remaining */}
        {hardMode && !gameOver && foundCategories.length < 4 && (
          <div className="guesses-remaining">
            <p>
              Guesses Remaining: <strong>{guessesRemaining}</strong>
            </p>
          </div>
        )}
        {/* Found Categories */}
        {foundCategories.length > 0 && (
          <div className="found-categories">
            {foundCategories.map((category, index) => (
              <div key={index} className="found-category">
                <h3>{category.name}</h3>
                <p>{category.words.join(", ")}</p>
              </div>
            ))}
          </div>
        )}

        {/* Game Over - Win */}
        {foundCategories.length === 4 ? (
          <div className="game-over">
            <h2>🎉 Congratulations!</h2>
            <p>You found all the categories!</p>
            {hardMode && (
              <p className="hard-mode-badge">Hard Mode Complete! 🔥</p>
            )}
            <Link to="/create" className="play-again-btn">
              Create New Game
            </Link>
          </div>
        ) : gameOver ? (
          <div className="game-over game-lost">
            <h2>💔 Game Over</h2>
            <p>You ran out of guesses in Hard Mode!</p>
            <div className="remaining-categories">
              <h3>The categories were:</h3>
              {categories.map((category, index) => (
                <div key={index} className="revealed-category">
                  <strong>{category.name}:</strong> {category.words.join(", ")}
                </div>
              ))}
            </div>
            <div className="game-over-buttons">
              <button onClick={restartGame} className="play-again-btn">
                Try Again
              </button>
              <Link to="/create" className="play-again-btn secondary">
                New Game
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Word Grid */}
            <div className="word-grid">
              {shuffledWords.map((word, index) => (
                <button
                  key={index}
                  className={`word-tile ${
                    selectedWords.includes(word) ? "selected" : ""
                  }`}
                  onClick={() => handleWordClick(word)}
                >
                  {word}
                </button>
              ))}
            </div>

            {/* Game Controls */}
            <div className="game-controls">
              <p className="selection-count">
                Selected: {selectedWords.length} / 4
              </p>
              <div className="control-buttons">
                <button
                  onClick={handleShuffle}
                  className="btn-shuffle"
                  disabled={shuffledWords.length === 0}
                >
                  Shuffle
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="btn-deselect"
                  disabled={selectedWords.length === 0}
                >
                  Deselect All
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn-submit-guess"
                  disabled={selectedWords.length !== 4 || gameOver}
                >
                  Submit
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Game;
