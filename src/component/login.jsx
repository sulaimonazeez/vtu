import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "./css/login.css";
import axios from "axios";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [remember, setRemember] = useState(false);
    const [submitting, setSubmitting] = useState(false); // Renamed for clarity
    const navigate = useNavigate();
    const API_URL = "https://paystar.com.ng/api/login/";

    // Check if the user is already authenticated (i.e., has a valid access token)
    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const expiresIn = localStorage.getItem("expires_in");

        // If access token exists and has not expired, redirect to home page
        if (accessToken && expiresIn && Date.now() < expiresIn) {
            navigate("/home");
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setSubmitting(true); // Start the loading state

        const userCredentials = { username, password };

        try {
            const response = await axios.post(API_URL, userCredentials, {
                headers: { "Content-Type": "application/json" },
            });

            const { access_token, refresh_token, expires_in } = response.data;

            // Calculate expiry time in milliseconds and store in localStorage
            const expiresAt = Date.now() + expires_in * 1000;

            // Store the tokens and expiry time in localStorage
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
            localStorage.setItem("expires_in", expiresAt);

            alert("Login Successful!");
            navigate("/home"); // Redirect to home or dashboard after successful login
        } catch (error) {
            setError(error.response ? error.response.data.message : error.message);
        } finally {
            setSubmitting(false); // Reset loading state
        }
    };

    return (
        <div className="body">
            <div className="login-container">
                <h2>Login</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form id="loginForm" onSubmit={handleLogin}>
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
                        <a href="/accounts/password/reset/">Forgot Password?</a>
                    </div>
                    <button disabled={submitting} type="submit" className="login-btn" id="loginBtn">
                        {submitting ? (
                            <span className="login-aut">
                                Authenticating <i className="spinner-border spinner-border-sm"></i>
                            </span>
                        ) : (
                            <span className="login-lg">Login</span>
                        )}
                    </button>
                </form>
                <div className="terms">
                    By logging in, you agree to our <a href="/terms">Terms and Conditions</a>.
                </div>
                <div className="signup-link">
                    Don't have an account? <a href="/accounts/create/">Sign up</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
