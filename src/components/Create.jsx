import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Create.css";

function Create() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([
    { name: "", words: ["", "", "", ""] },
    { name: "", words: ["", "", "", ""] },
    { name: "", words: ["", "", "", ""] },
    { name: "", words: ["", "", "", ""] },
  ]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Categories submitted:", categories);

    // Navigate to game with categories data
    navigate("/game", { state: { categories } });
  };

  const handleReset = () => {
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
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
        <h1>Create Connection Game</h1>
        <p className="subtitle">Create 4 categories with 4 words each</p>
      </header>

      <main className="create-main">
        <form onSubmit={handleSubmit}>
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
            <button type="button" onClick={handleReset} className="btn-reset">
              Reset All
            </button>
            <button type="submit" className="btn-submit">
              Save Categories
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Create;
