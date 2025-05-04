import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./css/signup.css";

const Signup = () => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
        setError(response.data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('An error occurred during registration. Please try again later.');
    }
  };

  return (
    <div className="signup-container">
      <h2>Create an Account</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
