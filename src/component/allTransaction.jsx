import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axiosInstance from "./utility";
import DownNav from './downNav';
import "./css/transaction.css";
import axios from 'axios';

const AllTransaction = () => {
    const [history, setHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredHistory, setFilteredHistory] = useState([]);
    const navigate = useNavigate();

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Filter transactions based on search query
    useEffect(() => {
        const getHistory = async () => {
            try {
                const accessToken = localStorage.getItem("access_token");

                if (!accessToken) {
                    console.error("No access token found, redirecting to login.");
                    navigate("/login");
                    return;
                }

                const response = await axiosInstance.get("/history/", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                setHistory(response.data);
                setFilteredHistory(response.data);
            } catch (e) {
                console.error("Error fetching history:", e);
            }
        };

        const myRefresh = async () => {
            try {
                const refreshToken = localStorage.getItem("refresh_token");

                if (!refreshToken) {
                    console.error("No refresh token found.");
                    navigate("/login");
                    return;
                }

                const res = await axios.post("http://localhost:8000/api/token/refresh/", {
                    refresh: refreshToken,
                });

                // Update token & expiration time
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
                getHistory();
            } else {
                console.log("Token expired or not found, refreshing...");
                await myRefresh();
                getHistory(); // Fetch history after refreshing the token
            }
        };

        // Fetch data or refresh token on initial load
        checkTokenAndFetch();

        // Filter history based on search query
        if (searchQuery) {
            const filtered = history.filter((data) =>
                data.message.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredHistory(filtered);
        } else {
            setFilteredHistory(history);
        }

    }, [searchQuery, navigate]); // Remove history from the dependency array

    return (
        <section className="parent-container" itemScope itemType="https://schema.org/ItemList">
            <header className="custom-search">
                <h4>Transactions</h4>
                <p className="to-grey">Your last 100 transactions.</p>
                <p className="to-red">Click on the transaction to view the details.</p>
                <form method="GET" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="text"
                        name="q"
                        placeholder="Search by message"
                        className="search"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </form>
            </header>

            <section className="search-result">
                {filteredHistory && filteredHistory.map((data) => {
                    const transactionLink = data.status_code
                        ? `/history/${data.id}`
                        : `/myreciept/${data.id}`;
                    const statusClass = data.status_code ? 'success' : 'failure';
                    const statusIcon = data.status_code ? 'fa-check' : 'fa-close';
                    const statusText = data.status_code ? 'Success' : 'Failure';
                    return (
                        <a href={transactionLink} className={`detail jst-content ${statusClass}`} itemScope itemType="https://schema.org/Order" title="View Transaction Details">
                            <div className="for-wifi">
                                <i className={`fa fa-wifi ${statusClass}`} aria-label="WiFi Icon"></i>
                            </div>
                            <div className="data-wifi" itemProp="description">
                                <h4>Data</h4>
                                <p className="data-desc">{data.message}</p>
                                <small>Ref: <span itemProp="orderNumber">{data.reference}</span></small>
                            </div>
                            <div className="data-amt">
                                <br />
                                <h4 itemProp="price">{data.amount}</h4>
                                <small>{data.date}</small><br />
                                <i className={`fa ${statusIcon}`} aria-label={statusText}></i>
                            </div>
                        </a>
                    );
                })}
            </section>

            <DownNav />
        </section>
    );
};

export default AllTransaction;
