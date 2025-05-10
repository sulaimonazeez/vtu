import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "./css/login.css";
import axios from "axios"; // Using plain axios for the initial login request is fine.

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [remember, setRemember] = useState(false); // State for "Remember me" checkbox
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    // --- RECOMMENDATION 1: Use Environment Variable for API_URL ---
    // It's better practice to use environment variables (e.g., a .env file)
    // for API URLs, so you don't have to change code between environments (dev, prod).
    // Example: const API_URL = process.env.REACT_APP_API_BASE_URL + "/login/";
    const API_URL = "https://paystar.com.ng/api/login/"; // Your custom login endpoint

    // Check if the user is already authenticated (i.e., has a valid access token)
    // This prevents authenticated users from seeing the login page unnecessarily.
    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const expiresIn = localStorage.getItem("expires_in");

        // Fix 2: Parse expiresIn to an integer for correct numerical comparison
        // If access token exists and has not expired, redirect to home page
        if (accessToken && expiresIn && Date.now() < parseInt(expiresIn)) {
            navigate("/home");
        }
    }, [navigate]); // `Maps` is a stable function, so this useEffect runs once on mount.

    const handleLogin = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(""); // Clear previous errors

        const userCredentials = { username, password };
        
        // --- RECOMMENDATION 3: Send 'remember' state if it has backend implications ---
        // If your backend's login logic should behave differently based on "Remember me"
        // (e.g., set a longer refresh token lifetime), you must send this state.
        // userCredentials.remember = remember; 

        try {
            const response = await axios.post(API_URL, userCredentials, {
                headers: { "Content-Type": "application/json" },
                // --- CRITICAL FIX 4: Add withCredentials: true ---
                // This is ABSOLUTELY ESSENTIAL for the browser to send and receive cookies
                // (like your HttpOnly refresh_token) with cross-origin requests.
                withCredentials: true,
            });

            // Your Django LoginView should return 'access_token' and 'expires_in' (access token's duration in seconds)
            const { access_token, expires_in } = response.data;

            // Calculate the absolute expiration time in milliseconds
            const expiresAt = Date.now() + expires_in * 1000;

            // Store the access token and its calculated expiry time in localStorage.
            // The refresh_token is handled by the HttpOnly cookie and is not stored here.
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("expires_in", expiresAt.toString()); // Store as a string

            // --- RECOMMENDATION 5: Improve success notification (avoid alert) ---
            // For a better UX, consider a toast notification library (e.g., react-toastify).
            alert("Login Successful!"); // Still using alert for simplicity in this example
            
            navigate("/home"); // Redirect to home or dashboard after successful login

        } catch (error) {
            console.error("Login failed:", error.response ? error.response.data : error.message);
            // Display a user-friendly error message
            setError(error.response?.data?.message || error.response?.data?.detail || "Login failed. Please check your credentials.");
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
                            value={username} // Bind value to state
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
                            value={password} // Bind value to state
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
