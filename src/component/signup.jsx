import React, { useState, useEffect } from 'react';
// Import useNavigate for proper React Router navigation
import { Link, useNavigate } from 'react-router-dom';
// Import axiosInstance
import axiosInstance from './utility'; // Adjust path as needed

import './css/login.css'; // Assuming this CSS applies to signup as well

const Signup = () => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false); // Renamed isSubmit to setSubmitting for clarity

  // Use useNavigate for programmatic navigation
  const navigate = useNavigate();

  // --- REMOVED: Manual token expiry check and redirection. ---
  // This logic should primarily be handled by:
  // 1. A PrivateRoute component wrapping your protected routes (e.g., '/home').
  // 2. axiosInstance interceptors for refreshing tokens during API calls.
  // If a user lands on signup, and they somehow have a token, the PrivateRoute
  // would redirect them from the protected routes. For signup itself, it's generally
  // open to all.
  // The `isTokenExpired` function and its `useEffect` are no longer needed here.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); // Set submitting to true
    setError(''); // Clear previous errors

    const userData = {
      username,
      phone,
      email,
      fullname,
      password,
    };

    try {
      // --- FIX 1: Use axiosInstance for the API call ---
      // axiosInstance handles baseURL, withCredentials, and potentially interceptors.
      const response = await axiosInstance.post('/register/', userData); // Assuming backend endpoint is /signup/

      if (response.data.success) {
        // --- FIX 2: ONLY store access_token. Refresh token is an HttpOnly cookie. ---
        // Do NOT try to store refresh_token from response.data here.
        // The backend is configured to set it as an HttpOnly cookie.
        // The 'expires_in' value is for access token expiry, if your backend provides it.
        // It's more robust to let axiosInstance's interceptors handle access token expiry
        // and refresh logic transparently. However, if you rely on it for display purposes,
        // you might keep access_token in localStorage.
        localStorage.setItem('access_token', response.data.access_token);
        // If the backend provides 'expires_in' for the access_token, store its absolute expiry time
        // localStorage.setItem('access_token_expires_at', Date.now() + response.data.expires_in * 1000);

        // --- FIX 3: Use navigate for redirection ---
        navigate('/home');
      } else {
        // Backend errors from serializer would come under response.data.errors if using serializers
        setError(response.data.error || response.data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Signup error:', error);
      // Handle different types of errors
      if (error.response) {
        // Server responded with a status other than 2xx
        if (error.response.data && error.response.data.errors) {
          // If backend uses DRF serializers, errors might be nested
          const errors = error.response.data.errors;
          const errorMessages = Object.keys(errors)
            .map(key => `${key}: ${errors[key].join(', ')}`)
            .join('\n');
          setError(errorMessages);
        } else if (error.response.data && (error.response.data.error || error.response.data.detail)) {
          // Generic error message from backend
          setError(error.response.data.error || error.response.data.detail);
        } else {
          setError('Registration failed: ' + error.response.statusText);
        }
      } else if (error.request) {
        // Request was made but no response was received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something else happened while setting up the request
        setError('An unexpected error occurred during registration. Please try again later.');
      }
    } finally {
      setSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div className="body">
      <div className="login-container"> {/* Renamed to signup-container in CSS perhaps? */}
        {/* --- FIX 4: Change heading to "Sign Up" or "Register" --- */}
        <h2>Sign Up</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form id="signupForm" onSubmit={handleSubmit}> {/* Changed form ID to signupForm */}
          <div className="input-group">
            <input
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              id="username"
              required
              placeholder=" "
              name="username"
            />
            <label htmlFor="username">Username</label>
          </div>
          <div className="input-group">
            <input
              type="number" // Changed from type="text" to number to align with phone input
              onChange={(e) => setPhone(e.target.value)}
              id="phone"
              required
              placeholder=" "
              name="phone"
            />
            <label htmlFor="phone">Phone</label>
          </div>
          <div className="input-group">
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              required
              placeholder=" "
              name="email"
            />
            <label htmlFor="email">Email</label>
          </div>
          <div className="input-group">
            <input
              type="text"
              onChange={(e) => setFullname(e.target.value)}
              id="fullname"
              required
              placeholder=" "
              name="fullname"
            />
            <label htmlFor="fullname">FullName</label>
          </div>
          <div className="input-group">
            <input
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              required
              placeholder=" "
            />
            <label htmlFor="password">Password</label>
          </div>
          {/* --- FIX 5: Remove unused 'remember me' checkbox --- */}
          {/* If you want to implement "remember me", it's usually done on the backend
              by setting a longer refresh token lifetime based on this flag.
              The frontend typically doesn't manage this state directly. */}
          {/* <div className="remember-forgot">
            <label>
              <input
                type="checkbox"
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <a href="https://paystar.com.ng/accounts/password/reset/">Forgot Password?</a>
          </div> */}
          <button
            disabled={submitting}
            type="submit"
            className="login-btn" // Consider renaming to 'signup-btn' in CSS
            id="loginBtn" // Consider renaming to 'signupBtn'
          >
            {submitting ? (
              <span className="login-auth">
                Registering...
                <i className="spinner-border spinner-border-sm"></i> {/* Ensure spinner CSS is loaded */}
              </span>
            ) : (
              // --- FIX 4: Change button text to "Sign Up" ---
              <span className="login-lg">Sign Up</span>
            )}
          </button>
        </form>
        <div className="text-danger text-center">
          {error}
        </div>
        <div className="terms">
          By signing up, you agree to our <a href="https://paystar.com.ng/terms">Terms and Conditions</a>.
        </div>
        <div className="signup-link">
          Already have an account? <Link to="/login/">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
