import React, { useEffect, useState } from "react";
import "./dashed.css";
import Actions from "./actionNav";
import axiosInstance from "./utility";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import DownNav from "./downNav";

const Header = () => {
  const [balance, setBalance] = useState(0);
  const [profile, setProfile] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [status, isStatus] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      const accessToken = localStorage.getItem("access_token");
      const expiresIn = localStorage.getItem("expires_in");

      if (!accessToken || !expiresIn) {
        navigate("/login");
        return;
      }

      if (Date.now() >= Number(expiresIn)) {
        const refreshed = await myRefresh();
        if (!refreshed) {
          navigate("/login");
          return;
        }
      }

      await Promise.all([fetchProfile(), fetchBalance()]);
    };

    initialize();
  }, [navigate]);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const response = await axios.get("https://paystar.com.ng/api/profile/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const profileData = response.data;
      setProfile(profileData);
      isStatus(profileData.status);
      if (profileData.status) {
        setAccountNumber(profileData.account_number);
        setBankName(profileData.bank_name);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Fetch balance data
  const fetchBalance = async () => {
    try {
      const response = await axiosInstance.get("/balance/");
      if (balance !== response.data.balance) {
        setBalance(response.data.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Refresh token only if expired
  const myRefresh = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) return false;

      const res = await axios.post("https://paystar.com.ng/api/token/refresh/", {
        refresh: refreshToken,
      });

      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("expires_in", Date.now() + 3600 * 1000); // 1-hour expiry
      console.log("Token refreshed successfully");
      return true;
    } catch (e) {
      console.error("Refresh token failed. Logging out.");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return false;
    }
  };

  return (
    <div>
      <div className="container">
        <div className="topbar">
          <div className="profile">
            <img
              style={{ width: "35px", height: "35px", borderRadius: "50%" }}
              src="https://paystar.com.ng/static/download.01b70cfb472f.png"
              alt="User"
              className="avatar profile-image"
            />
            <span>Good Day, {profile?.first_name || "User"}</span>
          </div>
          <i className="fas fa-bell notification-icon"></i>
        </div>

        <div className="balance-card">
          <h2>Wallet Balance</h2>
          <p>₦{balance.toFixed(2)}</p>
          <div>
            {status ? (
              <span>
                <small>{bankName} || </small>
                <span id="accs">
                  <strong>
                    <small>{accountNumber}</small>
                  </strong>
                </span>
                <i className="fa fa-clone" aria-hidden="true"></i>
              </span>
            ) : (
              <Link to="/virtualaccount" className="stylish-button">
                Generate Virtual Account
              </Link>
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
            <span>Referral</span>
          </div>
          <div className="service-box">
            <i className="fas fa-graduation-cap"></i>
            <span>Education</span>
          </div>
        </div>
      </div>
      <DownNav />
    </div>
  );
};

export default Header;
          
