import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// --- FIX 1: Import axiosInstance (adjust path if necessary) ---
import axiosInstance from "./utility"; // Assuming utility.js is in the same directory
// Removed direct axios import, as axiosInstance is preferred for authenticated calls
// import axios from 'axios';
import './NINSubmission.css';

export default function NINSubmission() {
  const [nin, setNin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Initialize with null for cleaner checks
  const navigate = useNavigate();

  // --- Recommendation: This useEffect can often be simplified or removed
  // if a robust PrivateRoute component handles route protection
  // and axiosInstance handles token validity during API calls. ---
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    // Basic check for token existence and validity before component renders fully
    if (!token || isTokenExpired(token)) {
      navigate('/login');
    }
  }, [navigate]); // Add navigate to dependency array

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Convert exp to milliseconds for comparison with Date.now()
      return Date.now() >= payload.exp * 1000;
    } catch (e) {
      console.error("Error parsing token:", e);
      return true; // Assume expired if parsing fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      // --- FIX 1 & 2: Use axiosInstance.post and relative path ---
      // axiosInstance handles the Authorization header and token refreshing.
      const response = await axiosInstance.post('/submit-nin/', { nin }); // Assuming backend expects a trailing slash

      if (response.data.status === "success") {
        navigate("/home");
      } else {
        // Display specific error message from backend if available
        setError(response.data.message || "NIN submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting NIN:", error.response?.data || error.message);
      // More detailed error message from backend, or a generic one
      setError(error.response?.data?.detail || error.response?.data?.message || "An unexpected error occurred. Please try again.");
      // The axiosInstance interceptor should handle 401 Unauthorized by redirecting to login.
      // Errors caught here are likely 400 (bad request), 500 (server error), network issues.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nin-container">
      <div className="nin-card">
        <h2 className="nin-title">Submit Your NIN</h2>
        <form onSubmit={handleSubmit} className="nin-form">
          <input 
            type="text" 
            placeholder="Enter your NIN" 
            value={nin} 
            onChange={(e) => setNin(e.target.value)} 
            className="nin-input"
            required
          />
          {/* --- FIX 3: Display error message --- */}
          {error && <p className="error-message text-danger">{error}</p>} 

          <button 
            type="submit" 
            className={`nin-button ${loading ? 'loading' : ''}`} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="ms-2">Submitting...</span>
              </>
            ) : (
              'Submit NIN'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
