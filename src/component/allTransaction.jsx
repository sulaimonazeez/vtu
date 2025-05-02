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
    const [loading, setLoading] = useState(true);  // For loading state
    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        const getHistory = async () => {
            try {
                setLoading(true);
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
                setFilteredHistory(response.data);  // Initially set filteredHistory with all history
            } catch (e) {
                console.error("Error fetching history:", e);
            } finally {
                setLoading(false);
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

                localStorage.setItem("access_token", res.data.access);
                localStorage.setItem("expires_in", Date.now() + 3600 * 1000); // 1-hour expiry
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
                getHistory();
            } else {
                await myRefresh();
                getHistory();
            }
        };

        checkTokenAndFetch();
    }, [navigate]);

    // New useEffect to handle filtering
    useEffect(() => {
        if (searchQuery) {
            const filtered = history.filter((data) =>
                data.message.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredHistory(filtered);
        } else {
            setFilteredHistory(history);
        }
    }, [searchQuery, history]);  // Only depend on searchQuery and history

    return (
        <section className="parent-container">
            <header className="custom-search">
                <h4>Transactions</h4>
                <p className="to-grey">Your last 100 transactions.</p>
                <p className="to-red">Click on the transaction to view the details.</p>
                <form onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="text"
                        placeholder="Search by message"
                        className="search"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </form>
            </header>

            {loading ? (
                <div className="loading-indicator">Loading...</div>  // Custom loading indicator
            ) : (
                <section className="search-result">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map((data) => {
                            const transactionLink = data.status_code
                                ? `/history/${data.id}`
                                : `/myreciept/${data.id}`;
                            const statusClass = data.status_code ? 'success' : 'failure';
                            const statusIcon = data.status_code ? 'fa-check' : 'fa-close';
                            const statusText = data.status_code ? 'Success' : 'Failure';

                            return (
                                <a 
                                    href={transactionLink}
                                    className={`transaction-card ${statusClass}`}
                                    title="View Transaction Details"
                                >
                                    <div className="transaction-icon">
                                        <i className={`fa fa-wifi ${statusClass}`} aria-label="WiFi Icon"></i>
                                    </div>
                                    <div className="transaction-details">
                                        <h4>{data.message}</h4>
                                        <p>Ref: {data.reference}</p>
                                        <span className="transaction-amount">{data.amount}</span>
                                        <small>{data.date}</small>
                                        <i className={`fa ${statusIcon}`} aria-label={statusText}></i>
                                    </div>
                                </a>
                            );
                        })
                    ) : (
                        <p>No transactions found.</p>  // Display message if no transactions
                    )}
                </section>
            )}

            <DownNav />
        </section>
    );
};

export default AllTransaction;
