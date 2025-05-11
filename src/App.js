import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./component/login.jsx";
import Signup from "./component/signup.jsx";
import Home from "./component/home.jsx";
import BuyDataForm from "./component/bundle.jsx";
import Airtime from "./component/airtime.jsx";
import AllTransaction from "./component/allTransaction.jsx";
import NINSubmission from "./component/verification.jsx";
import Notifications from "./component/notification.jsx";
import ProfileWrapper from "./component/profileWrapper.jsx";
import Landing from "./component/landing.jsx";
import UpdatePin from "./component/updatepin.jsx";
// Import the logout utility function that also calls your Django backend.
// Make sure you have this utility function defined, for example, in src/utils/auth.js
// as we've outlined in previous steps.
import { logout } from './component/auth'; // <<< ADJUST THIS PATH IF NECESSARY based on your file structure

// Simple authentication check for route guarding
const isAuthenticated = () => {
  const accessToken = localStorage.getItem("access_token");
  const expiresIn = localStorage.getItem("expires_in");

  // Fix 1: Parse expiresIn to an integer for correct comparison
  // If no access token or it's expired, consider the user not authenticated.
  if (!accessToken || !expiresIn || Date.now() >= parseInt(expiresIn)) {
    // If the access token was present but expired, trigger a full logout.
    // Fix 2: Call `logout()` (from src/utils/auth.js) to also invalidate the
    // HttpOnly refresh token on the backend and handle redirection.
    if (accessToken && expiresIn && Date.now() >= parseInt(expiresIn)) {
      console.log("Access token expired for route protection. Logging out.");
      logout(); // This function handles redirection to /login and backend invalidation
    } else if (!accessToken) {
      // If there's no access token at all, just clear anything that might be left and redirect.
      // We can call `logout()` here too, as it handles client-side clearing and redirection.
      console.log("No access token found. Ensuring logout state.");
      logout();
    }
    return false;
  }

  console.log("Access Token Valid for route access.");
  return true;
};

// Function to clear tokens from localStorage
// This function should NOT be called directly for full logout scenarios
// because it doesn't communicate with the backend to invalidate the HttpOnly refresh token.
// Instead, use the `logout()` function imported from `src/utils/auth.js`.
const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("expires_in");
  // Removed console.log("Tokens Cleared"); as it's handled by `logout()` now.
};


// PrivateRoute component to protect routes that require authentication
const PrivateRoute = ({ element }) => {
  // If isAuthenticated() returns true, render the protected element;
  // otherwise, navigate to the login page.
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

function App() {
  // --- FIX 3: REMOVE THE AUTO-REFRESH PAGE EFFECT ---
  // The Axios interceptor (configured in requestUtility.jsx) handles
  // automatic access token refreshing when API calls return 401.
  // A full page reload is no longer necessary and would degrade user experience.
  /*
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);
  */

  return (
    <Router>
      <Routes>
        {/* Public Routes (no authentication required) */}
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Signup />} />
        <Route path="/" element={<Landing />} />

        {/* Protected Routes (require authentication via PrivateRoute) */}
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/profile" element={<PrivateRoute element={<ProfileWrapper />} />} />
        <Route path="/data" element={<PrivateRoute element={<BuyDataForm />} />} />
        <Route path="/airtime" element={<PrivateRoute element={<Airtime />} />} />
        <Route path="/notification" element={<PrivateRoute element={<Notifications />} />} />
        <Route path="/verification" element={<PrivateRoute element={<NINSubmission />} />} />
        <Route path="/history" element={<PrivateRoute element={<AllTransaction />} />} />
        <Route path="/pin" element={<PrivateRoute element={<UpdatePin />} />} />

        {/* Default route: redirect to /home or /login based on auth status */}
        {/* You might want to check isAuthenticated() here before redirecting to /home */}
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default App;
