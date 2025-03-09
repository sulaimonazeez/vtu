import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./component/login.jsx";
import Signup from "./component/signup.jsx";
import Home from "./component/home.jsx";
import BuyDataForm from "./component/bundle.jsx";
import Airtime from "./component/airtime.jsx";
import AllTransaction from "./component/allTransaction.jsx";

// Simple auth check (with token expiration handling)
const isAuthenticated = () => {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const expiresIn = localStorage.getItem("expires_in");

  // If no access token, no refresh token, or expired token, clear tokens and return false
  if (!accessToken || !refreshToken || !expiresIn || Date.now() >= expiresIn) {
    clearTokens();
    return false;
  }

  console.log("Token Valid");
  return true;
};

// Function to clear tokens from localStorage
const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("expires_in");
};

// PrivateRoute to protect routes that require authentication
const PrivateRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

function App() {
  // Auto-refresh page every 5 minutes (300000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Signup />} />
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/data" element={<PrivateRoute element={<BuyDataForm />} />} />
        <Route path="/airtime" element={<PrivateRoute element={<Airtime />} />} />
        <Route path="/history" element={<PrivateRoute element={<AllTransaction />} />} />
      </Routes>
    </Router>
  );
}

export default App;
