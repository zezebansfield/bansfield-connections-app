import { useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import bansfieldFamily from "../assets/bansfieldFamily.png";

function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
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
      </main>

      <footer className="app-footer">
        <p>Made by Zainab Bansfield</p>
      </footer>
    </div>
  );
}

export default Home;
