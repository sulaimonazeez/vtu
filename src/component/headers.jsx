import React, { useEffect, useState } from "react";
import "./dashed.css";

import Actions from "./actionNav"; // Assuming this is correct path
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import axiosInstance from "./utility"; // <-- FIX 1: Adjust path to requestUtility.jsx

import { useNavigate, Link } from "react-router-dom";

import axios from "axios"; // <-- REMOVE 2: You should primarily use axiosInstance
import { logout } from './auth.js'; // <-- ADD 3: Import logout utility for proper redirection

import Transaction from "./transactions"; // Assuming this is correct path

import DownNav from "./downNav"; // Assuming this is correct path


const Header = () => {
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [status, isStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Function to close the modal
  const handleClose = () => setShowModal(false);

  // --- Review 4: Modal logic ---
  // This useEffect will cause the modal to show *every time the Header component mounts*.
  // If you only want it to show on the *very first visit* or *after login*,
  // you'll need a mechanism to track if it's been shown (e.g., using localStorage).
  useEffect(() => {
    setShowModal(true); // This might not be the desired behavior for repeated mounts
  }, []);

  useEffect(() => {
    // --- REMOVE 5: Redundant accessToken check at top level ---
    // The PrivateRoute in App.js already handles initial authentication.
    // If this component renders, it means the user should be authenticated or is being redirected.
    // const accessToken = localStorage.getItem("access_token");
    // if (!accessToken) {
    //   console.error("No access token found, redirecting to login.");
    //   navigate("/login");
    //   return; // Added return to prevent further execution if no token
    // }


    const fetchProfile = async () => {
      try {
        // --- REMOVE 6: Redundant accessToken check inside fetchProfile ---
        // const accessToken = localStorage.getItem("access_token");

        const response = await axiosInstance.get("/profile/"); // Use axiosInstance
        setProfile(response.data);
        console.log("Profile Data:", response.data);
        isStatus(response.data.status);
        if (response.data.status === true) {
          setAccountNumber(response.data.account_number);
          setBankName(response.data.bank_name);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // --- No manual 401 handling here, axiosInstance interceptor does it ---
        // If axiosInstance fails after refresh attempts, it will trigger logout.
        // Any errors caught here are typically non-authentication errors (e.g., 404, 500)
      }
    };

    const fetchBalance = async () => {
      try {
        // --- REMOVE 7: Redundant accessToken check inside fetchBalance ---
        // const accessToken = localStorage.getItem("access_token");
        // if (!accessToken) {
        //   console.error("No access token found, redirecting to login.");
        //   navigate("/login");
        //   return;
        // }

        const response = await axiosInstance.get("/balance/"); // Use axiosInstance
        setBalance(response.data.balance || 0);
        console.log("Balance Data:", response.data);
      } catch (error) {
        console.error("Error fetching balance:", error);

        // --- CRITICAL FIX 8: REMOVE THE INFINITE LOOP FOR 401 ERRORS ---
        // The axiosInstance interceptor already handles 401s (token expiry/refresh).
        // If it reaches this catch block with a 401, it means the refresh itself failed,
        // and the interceptor has already triggered a logout.
        // Calling fetchBalance() again here would create an infinite loop
        // if the refresh token is also invalid.
        /*
        if (error.response && error.response.status === 401) {
            fetchBalance();
        }
        */
        // If axiosInstance's interceptor has failed to refresh and redirected,
        // any error caught here for a 401 would be after a logout has already happened.
        // Other errors (e.g., 404, 500) should be handled by displaying an error message.
      }
    };

    // --- REMOVE 9: This entire checkTokenAndFetch block is redundant and problematic ---
    // The PrivateRoute handles the initial authentication check for accessing this component.
    // The axiosInstance interceptor handles automatic token refresh for API calls.
    // If the access token is expired, isAuthenticated (in App.js) will call logout.
    // The problematic `localStorage.removeItem` lines are also here.
    /*
    const checkTokenAndFetch = async () => {
      const accessToken = localStorage.getItem("access_token");
      const expiresIn = localStorage.getItem("expires_in");

      if (accessToken && expiresIn && Date.now() < expiresIn) {
        console.log("Token Valid");
      } else {
        // This is incorrect for removal and should use `logout()`
        const accessToken = localStorage.removeItem("access_token"); // This assigns undefined
        const expiresIn = localStorage.removeItem("expires_in");   // This assigns undefined
      }

      fetchBalance(); // These calls will be made regardless of the check above
      fetchProfile();
    };

    checkTokenAndFetch(); // Calls the problematic function
    */

    // --- REPLACEMENT FOR checkTokenAndFetch and redundant checks ---
    // If the component mounts, we assume isAuthenticated() has already passed.
    // The fetches should run directly.
    fetchProfile();
    fetchBalance();

  }, [navigate]); // ✅ `Maps` is a stable function from `useNavigate` in React Router v6.
                  // The dependency array is fine here if you want the effect to re-run if `Maps`
                  // were somehow to change (unlikely for `useNavigate`), or if you need
                  // a re-fetch when the component re-renders due to a navigation event.
                  // For a fetch-on-mount scenario, an empty array `[]` is usually sufficient.
                  // However, keeping `[navigate]` won't cause issues here.

  return (
    <div>
      <div className="container">
        <div className="topbar">
          <div onClick={ () => navigate("/profile")} className="profile">
            <img style={{ width: "35px", height: "35px", borderRadius: "50%" }} src="https://paystar.com.ng/static/download.01b70cfb472f.png" alt="User" className="avatar profile-image" />
            <span>Good Day, {profile?.first_name || "User"}</span>
          </div>
          <i className="fas fa-bell notification-icon"></i>
        </div>

        <div className="balance-card mt-1">
          <h2>Wallet Balance</h2>
          <p>₦{balance || 0}</p>
          <div>
            {status ? (
              <span>
                <small>{bankName} || </small>
                <span id="accs">
                  <strong><small>{accountNumber}</small></strong>
                </span>
                <i className="fa fa-clone" aria-hidden="true"></i>
              </span>
            ) : (
              <Link to="/verification" className="stylish-button">Generate Virtual Account</Link>
            )}
          </div>
        </div>

        <div className="services">
          <div onClick={() => navigate("/airtime")} className="service-box" id="airtime">
            <i className="fas fa-phone-volume"></i>
            <span>Airtime</span>
          </div>
          <div onClick={() => navigate("/data")} className="service-box" id="data">
            <i className="fas fa-wifi"></i>
            <span>Data</span>
          </div>
          <div className="service-box" id="electric">
            <i className="fas fa-bolt"></i>
            <span>Electricity</span>
          </div>
          <div className="service-box" id="#refferal">
            <i className="fas fa-receipt"></i>
            <span>Utility Bills</span>
          </div>
          <div className="service-box">
            <i className="fas fa-user-friends"></i>
            <span> Referral</span>
          </div>
          <div className="service-box">
            <i className="fas fa-graduation-cap"></i>
            <span>Education</span>
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>You're Honoured!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Welcome to our website!</h4>
          <p>We are truly honoured to have you here. Thank you for visiting!</p>
          <p>Enjoy exploring, and feel free to reach out if you have any questions!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <DownNav />

    </div>

  );
};

export default Header;
