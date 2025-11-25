import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Game.css";

function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const { categories } = location.state || {};

  const [shuffledWords, setShuffledWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [foundCategories, setFoundCategories] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, message: "", type: "" });

  useEffect(() => {
    if (!categories || categories.length === 0) {
      navigate("/create");
      return;
    }

    // Flatten all words from all categories and shuffle them
    const allWords = categories.flatMap((category) => category.words);
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  }, [categories, navigate]);

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

  const handleDeselectAll = () => {
    setSelectedWords([]);
  };

  const handleShuffle = () => {
    setShuffledWords([...shuffledWords].sort(() => Math.random() - 0.5));
  };

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
        <Link to="/create" className="back-link">
          ← New Game
        </Link>
        <h1>Connections Game</h1>
        <p className="subtitle">Find groups of four related words</p>
      </header>

      <main className="game-main">
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

        {/* Game Over */}
        {foundCategories.length === 4 ? (
          <div className="game-over">
            <h2>🎉 Congratulations!</h2>
            <p>You found all the categories!</p>
            <Link to="/create" className="play-again-btn">
              Create New Game
            </Link>
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
                  disabled={selectedWords.length !== 4}
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
