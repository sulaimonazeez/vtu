import React, { useEffect, useState } from "react";
import "./dashed.css";
import Actions from "./actionNav";
import axiosInstance from "./utility";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Transaction from "./transactions";
import DownNav from "./downNav";

const Header = () => {
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
        console.error("No access token found, redirecting to login.");
        navigate("/login");
    }
    const fetchProfile = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");

        const response = await axios.get("https://paystar.com.ng/api/profile/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setProfile(response.data);
        console.log("Profile Data:", response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const fetchBalance = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
          console.error("No access token found, redirecting to login.");
          navigate("/login");
          return;
        }

        const response = await axiosInstance.get(
          "/balance/",
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setBalance(response.data.balance || 0);
        console.log("Balance Data:", response.data);
      } catch (error) {
        console.error("Error fetching balance:", error);

        // If token is invalid or expired, refresh token
        if (error.response && error.response.status === 401) {
          await myRefresh();
          fetchBalance(); // Retry after refresh
        }
      }
    };

    const myRefresh = async () => {
      try {
        const refreshToken = localStorage.getItem("refresh_token");

        const res = await axios.post("https://paystar.com.ng/api/token/refresh/", {
          refresh: refreshToken,
        });

        // ✅ Update token & expiration time
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("expires_in", Date.now() + 3600 * 1000); // 1-hour expiry

        console.log("Token refreshed successfully");
      } catch (e) {
        console.error("Refresh token failed, logging out.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
      }
    };

    const checkTokenAndFetch = async () => {
      const accessToken = localStorage.getItem("access_token");
      const expiresIn = localStorage.getItem("expires_in");

      if (accessToken && expiresIn && Date.now() < expiresIn) {
        console.log("Token Valid");
      } else {
        await myRefresh();
      }

      fetchBalance();
      fetchProfile();
    };

    checkTokenAndFetch();
  }, [navigate]); // ✅ Empty dependency array ensures it runs only once

  return (
   <div>
     <div className="container">
         <div className="topbar">
      <div className="profile">
        <img style={{width: "35px", height: "35px", borderRadius: "50%"}} src="https://paystar.com.ng/static/download.01b70cfb472f.png" alt="User" className="avatar profile-image" />
        <span>Good Day, {profile?.first_name || "User"}</span>
      </div>
      <i className="fas fa-bell notification-icon"></i>
    </div><br/><br /><br />
    
    <div className="balance-card">
      <h2>Wallet Balance</h2>
      <p>₦{ balance.balance || 0 }</p>
        <div>
          <span><small>9Payment Service Bank || </small></span>
          <span id="accs"><strong><small>5458657957</small></strong></span>
           <i className="fa fa-clone" aria-hidden="true"></i>
        </div>
    </div>

    <div className="services">
      <div onClick={ () => navigate("/airtime")} className="service-box" id="airtime">
        <i className="fas fa-phone-volume"></i>
        <span>Airtime</span>
      </div>
      <div className="service-box" id="data">
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

  <div className="bottom-nav">
    <a href="/home" className="active">
      <i className="fas fa-home"></i>
      Home
    </a>
    <a href="/history">
      <i className="fas fa-list-alt"></i>
      History
    </a>
    <a href="/notification">
      <i className="fas fa-bell"></i>
      Notification
    </a>
    <a href="/logout">
      <i className="fas fa-sign-out-alt"></i>
      Logout
    </a>
  </div>
    </div>
  );
};

export default Header;
