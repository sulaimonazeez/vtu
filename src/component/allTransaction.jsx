import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
// --- FIX 1 & 2: Import axiosInstance (ensure path is correct for your project) ---
import axiosInstance from "./utility"; // Assuming utility.js is in the same directory
import DownNav from './downNav';
import "./css/transaction.css";
// Removed: axios is no longer needed directly for API calls, as axiosInstance is used
// import axios from 'axios'; 
import { Link } from 'react-router-dom';

const AllTransaction = () => {
    const [history, setHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // New state for error messages
    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        const getHistory = async () => {
            try {
                setLoading(true);
                setError(null); // Clear previous errors

                // --- FIX 2: Removed manual Authorization header ---
                // axiosInstance's interceptor handles adding the Authorization header automatically.
                const response = await axiosInstance.get("/history/"); 

                setHistory(response.data);
                setFilteredHistory(response.data); // Set filtered history initially as all fetched history
            } catch (e) {
                console.error("Error fetching history:", e.response?.data || e.message);
                // Provide user-friendly error message
                setError("Failed to load transactions. Please try again later.");
                // The axiosInstance interceptor should handle 401 Unauthorized errors by redirecting to login
                // if the refresh token mechanism fails. No need for manual redirection here based on token presence,
                // as the interceptor is the gatekeeper for authenticated requests.
            } finally {
                setLoading(false);
            }
        };

        // --- FIX 1: Removed redundant and insecure token refresh logic ---
        // The axiosInstance interceptor handles token refreshing automatically and securely.
        // Storing refresh_token in localStorage is a security vulnerability.
        // getHistory(); // Call the function directly
        // --- IMPORTANT: Add an immediate call to getHistory() ---
        // The component should try to fetch history immediately.
        // The axiosInstance interceptor will handle token expiration and refresh.
        getHistory();

    }, []); // Empty dependency array means this runs once on mount. 
            // If `history` needs to refetch on certain state changes, add them here.
            // Since `Maps` is not used inside `getHistory` anymore, it's not a dependency.

    // This useEffect handles filtering whenever searchQuery or history changes
    useEffect(() => {
        if (searchQuery) {
            const filtered = history.filter((data) =>
                // Ensure 'message' field exists on your data objects
                data.message && data.message.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredHistory(filtered);
        } else {
            setFilteredHistory(history);
        }
    }, [searchQuery, history]); // Dependencies: searchQuery and history

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
                <div className="loading">Loading transactions...</div>
            ) : error ? ( // Display error message if there's an error
                <div className="error-message">{error}</div>
            ) : (
                <div className="transactions-list">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map((data) => {
                            // Assuming status_code is a boolean or truthy/falsy indicating success
                            const transactionLink = data.status_code 
                                ? `/history/${data.id}` // Use a template literal here
                                : `/myreciept/${data.id}`;
                            const statusClass = data.status_code ? 'success' : 'failure';
                            const statusIcon = data.status_code ? 'fa-check' : 'fa-close';
                            const statusText = data.status_code ? 'Success' : 'Failure';

                            return (
                                <Link 
                                    key={data.id}
                                    to={transactionLink} 
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
                                        {/* Added aria-hidden for decorative icons */}
                                        <i className={`fa ${statusIcon}`} aria-label={statusText} aria-hidden="false"></i> 
                                    </div>
                                </Link>
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
