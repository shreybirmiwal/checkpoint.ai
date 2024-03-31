import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import React from "react"

import { Home } from "./Pages/Home";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Dashboard from "./Pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>

        <Route exact path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </Router>

  );
}

export default App;