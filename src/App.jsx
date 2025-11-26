import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Create from "./components/Create";
import Game from "./components/Game";
import Login from "./components/Login";
import "./App.css";

function App() {
  return (
    <Router basename="/bansfield-connections-app">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create" element={<Create />} />
        <Route path="/game" element={<Game />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
