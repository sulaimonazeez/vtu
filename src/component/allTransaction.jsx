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
    const [loading, setLoading] = useState(true);
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
                setFilteredHistory(response.data);
            } catch (e) {
                console.error("Error fetching history:", e);
            } finally {
                setLoading(false);
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

    useEffect(() => {
        if (searchQuery) {
            const filtered = history.filter((data) =>
                data.message.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredHistory(filtered);
        } else {
            setFilteredHistory(history);
        }
    }, [searchQuery, history]);

    return (
        <section className="transactions-container">
            <header className="header">
                <h4>Transaction History</h4>
                <p>Your recent transactions.</p>
                <input
                    type="text"
                    placeholder="Search by message"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="search-input"
                />
            </header>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="transactions-list">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map((data) => {
                            const transactionLink = data.status_code
                                ? `/history/${data.id}`
                                : `/myreciept/${data.id}`;
                            const statusClass = data.status_code ? 'success' : 'failure';
                            const statusIcon = data.status_code ? 'fa-check' : 'fa-close';
                            const statusText = data.status_code ? 'Success' : 'Failure';

                            return (
                                <div 
                                    key={data.id}
                                    className={`transaction-card ${statusClass}`}
                                    title="View Transaction Details"
                                >
                                    <div className="transaction-info">
                                        <h5>{data.message}</h5>
                                        <p>Ref: {data.reference}</p>
                                        <div className="transaction-footer">
                                            <span className="amount">{data.amount}</span>
                                            <small>{data.date}</small>
                                        </div>
                                    </div>
                                    <div className="status-icon">
                                        <i className={`fa ${statusIcon}`} aria-label={statusText}></i>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No transactions found.</p>
                    )}
                </div>
            )}

            <DownNav />
        </section>
    );
};

export default AllTransaction;
