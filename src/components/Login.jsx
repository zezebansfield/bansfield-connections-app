import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./Login.css";

function Login() {
  const [mode, setMode] = useState("select");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState(undefined);

  useEffect(() => {
    fetch(`${API_BASE_URL}/users`, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        // console.log(response.clone().json());
        const data = await response.clone().json();
        return data;
      })
      .then((data) => setUsers(data))
      .catch((error) => {
        console.error(error);
        setError("Failed to fetch users");
      });
  }, []);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    try {
      if (mode === "create") {
        if (users.some((user) => user.username === username.trim())) {
          setError("Username already exists");
          return;
        }

        // Create new user
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ username: username.trim() }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to create user");
          return;
        }

        // Store user info and navigate to home
        localStorage.setItem("userId", data[0].id);
        localStorage.setItem("username", data[0].username);
        navigate("/home");
      } else if (mode === "login") {
        if (!users.some((user) => user.username === username.trim())) {
          setError("User not found");
          return;
        }

        // Login existing user
        const response = await fetch(
          `${API_BASE_URL}/users?username=${encodeURIComponent(
            username.trim()
          )}`,
          {
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!response.ok) {
          setError("User not found");
          return;
        }

        const data = await response.json();
        const userId = data.find(
          (user) => user.username === username.trim()
        ).id;

        // Store user info and navigate to home
        localStorage.setItem("userId", userId);
        localStorage.setItem("username", username.trim());
        navigate("/home");
      }
    } catch (err) {
      setError("Connection error. Please make sure the server is running.");
      console.error(err);
    }
  };

  const handleBack = () => {
    setMode("select");
    setUsername("");
    setError("");
  };

  return users ? (
    <div className="app">
      <main className="app-main">
        <div className="card login-card">
          {mode === "select" ? (
            <div className="login-select">
              <h2>Get Started</h2>
              <p>Choose an option to continue</p>
              <div className="login-buttons">
                <button
                  className="login-button create-button"
                  onClick={() => setMode("create")}
                >
                  Create New User
                </button>
                <button
                  className="login-button login-button-action"
                  onClick={() => setMode("login")}
                >
                  Login with Existing User
                </button>
              </div>
            </div>
          ) : (
            <div className="login-form-container">
              <h2>{mode === "create" ? "Create New User" : "Login"}</h2>
              <p className="form-subtitle">
                {mode === "create"
                  ? "Enter a username to create your account"
                  : "Enter your username to login"}
              </p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoFocus
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="form-actions">
                  <button
                    type="button"
                    className="back-button"
                    onClick={handleBack}
                  >
                    Back
                  </button>
                  <button type="submit" className="submit-button">
                    {mode === "create" ? "Create Account" : "Login"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Made by Zainab Bansfield</p>
      </footer>
    </div>
  ) : (
    <div>Loading...</div>
  );
}

export default Login;
