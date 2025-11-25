import { useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bansfield Connections</h1>
        <p className="subtitle">Welcome to your React application</p>
      </header>

      <main className="app-main">
        <div className="card">
          <h2>Getting Started</h2>
          <p>
            Edit <code>src/App.jsx</code> to customize this page.
          </p>

          <div className="counter-section">
            <button onClick={() => setCount((count) => count + 1)}>
              Count is: {count}
            </button>
          </div>

          <div className="nav-section">
            <Link to="/create" className="nav-link">
              Go to Create Game →
            </Link>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <h3>📚 Learn React</h3>
            <p>Discover the power of component-based development</p>
          </div>
          <div className="info-card">
            <h3>⚡ Powered by Vite</h3>
            <p>Lightning-fast development experience</p>
          </div>
          <div className="info-card">
            <h3>🎨 Modern UI</h3>
            <p>Beautiful and responsive design out of the box</p>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with React + Vite</p>
      </footer>
    </div>
  );
}

export default Home;
