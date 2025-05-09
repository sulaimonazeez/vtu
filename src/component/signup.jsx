import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./css/login.css";
import { Link } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const [submitting, isSubmit] = useState(false);
  // Function to check if the token is expired
  const isTokenExpired = () => {
    const accessToken = localStorage.getItem('access_token');
    const expiresIn = localStorage.getItem('expires_in'); // Store expiration time from the response

    if (!accessToken || !expiresIn) {
      return true; // Token doesn't exist or expiration time is missing
    }

    const currentTime = Date.now(); // Current time in milliseconds
    return currentTime >= expiresIn; // If the current time is greater than expiration time, token is expired
  };

  // Check if there's a valid token when the component mounts
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      if (isTokenExpired()) {
        // If the token is expired, remove it and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('expires_in');
        // Redirect to login if token is expired
      } else {
        // Redirect to home if the token is still valid
        window.location.href = '/home';
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    isSubmit(true);
    const userData = {
      username,
      phone,
      email,
      fullname,
      password,
    };

    try {
      const response = await axios.post('https://paystar.com.ng/api/register/', userData, {
        headers: {
          'Content-Type': 'application/json',
          // Optional: You can pass the Authorization header if needed
        },
      });

      if (response.data.success) {
        // Store access token and expiration time in localStorage
        const { access_token, refresh_token, expires_in } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('expires_in', Date.now() + expires_in * 1000); // Save expiration time in ms

        // Redirect to home or dashboard page
        window.location.href = '/home';  // Redirect to home page
      } else {
        isSubmit(false)
        setError(response.data.error || 'Something went wrong');
      }
    } catch (error) {
      isSubmit(false);
      setError('An error occurred during registration. Please try again later.');
    }
  };

  return (
    <div className="body">
            <div className="login-container">
                <h2>Login</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form id="loginForm" onSubmit={handleSubmit}>
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
                            type="number"
                            onChange={(e) => setPhone(e.target.value)}
                            id="phone"
                            required
                            placeholder=" "
                            name="phone"
                        />
                        <label htmlFor="phone">phone</label>
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
                    <div className="remember-forgot">
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
                    </div>
                    <button disabled={submitting} type="submit" className="login-btn" id="loginBtn">
                      {submitting? (
                         <span className="login-lg">Login</span>
                      ):(
                        <span className="login-auth">Authenticating <i className="spinner-border"></i></span>
                     )
                    </button>
                </form>
              <div className="text-danger text-center">
                { error }
              </div>
                <div className="terms">
                    By logging in, you agree to our <a href="https://paystar.com.ng/terms">Terms and Conditions</a>.
                </div>
                <div className="signup-link">
                    Already have an account? <Link to="/login/">Login</Link>
                </div>
            </div>
    </div>
  );
};

export default Signup;
