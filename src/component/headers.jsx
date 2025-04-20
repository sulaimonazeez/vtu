import React, { useEffect, useState } from "react";
import "./css/home.css";
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
    <div className="container-fluids">
      <header>
        <div className="profile">
          <img className="profile-image" alt="Profile" src="https://paystar.com.ng/static/download.png" />
        </div>
        <div className="notifications" id="notify">
          <i className="fa fa-bell-o"></i>
        </div>
      </header>

      <section className="board-panel">
        <div className="bord-greeting">
          <div><p><strong>Good Day, {profile?.first_name || "User"}</strong></p></div>
          <div className="select">
            <select>
              <option value="NG">NG</option>
            </select>
          </div>
        </div>

        <div className="cpu-board">
          <div className="make-inline">
            <div>
              <small>Wallet Balance <i className="fa fa-eye"></i></small>
              <h3 className="blc"><strong>NGN {balance} </strong></h3>
            </div>
            <div className="make-plus">
              <div className="plus"><i className="mt-2 fa fa-plus"></i></div>
              <small className="blc-text"><strong>Add Money</strong></small>
            </div>
          </div>
        </div>

        <div className="account-grid">
          <p id="accs">9payment Service - 5074563753</p>
          <i className="fa fa-clone" aria-hidden="true"></i>
        </div>
      </section>

      <section className="marque">
        <div className="inner-marque">
          <div className="marque-flex">
            <div className="inner-flex">
              <small>Get Airtime at 1% off</small>
              <a href="/airtime" className="airtime-btn">Buy Now</a>
            </div>
          </div>
        </div>
      </section>

      <Actions />
      <Transaction />
      <DownNav />
    </div>
  );
};

export default Header;
