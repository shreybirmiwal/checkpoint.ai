import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import React from "react"

import { Home } from "./Pages/Home";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Dashboard from "./Pages/Dashboard";
import AnalyticsStudents from "./Components/Analytics/AnalyticsStudents";
import AnalyticsAssignments from "./Components/Analytics/AnalyticsAssignments";

function App() {
  return (
    <Router>
      <Routes>

        <Route exact path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/analytics/students/:id" element={<AnalyticsStudents />} />
        <Route path="/analytics/assignments/:id" element={<AnalyticsAssignments />} />

      </Routes>
    </Router>

  );
}

export default App;