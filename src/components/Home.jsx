import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import bansfieldFamily from "../assets/bansfieldFamily.png";

function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const username = localStorage.getItem("username");

  useEffect(() => {
    // Fetch games from the API
    fetch("https://permeant-mathias-ungarbed.ngrok-free.dev/api/games", {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch games");
        }
        return response.json();
      })
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load games");
        setLoading(false);
      });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        {username && (
          <div className="username-display">Welcome, {username}!</div>
        )}
        <img
          className="bansfield-family-image"
          src={bansfieldFamily}
          alt="Bansfield Family"
        />
        <h1>Benintendi Family Connections</h1>
        <p className="subtitle">
          Welcome to the Bansfield/Benintendi Family custom connections game
          application
        </p>
      </header>

      <main className="app-main">
        <div className="card">
          <div className="nav-section">
            <p className="nav-section-text">
              Create your own connections categories and play the game by
              clicking the button below
            </p>
            <Link to="/create" className="nav-link">
              Go to Create Game →
            </Link>
          </div>
        </div>

        <div className="card">
          <h2>Available Games</h2>
          {loading ? (
            <p>Loading games...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : games.length === 0 ? (
            <p>No games available yet. Create the first one!</p>
          ) : (
            <div className="games-list">
              {games.map((game) => (
                <div key={game.id} className="game-card">
                  <h3>{game.title}</h3>
                  <p className="game-creator">
                    Created by: {game.creator_name}
                  </p>
                  <p className="game-date">
                    {new Date(game.created_at).toLocaleDateString()}
                  </p>
                  <Link to={`/game?id=${game.id}`} className="play-button">
                    Play Game
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Made by Zainab Bansfield</p>
      </footer>
    </div>
  );
}

export default Home;
