import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "./utility";
import DownNav from "./downNav";
import TransactionModal from "./TransactionModal"; // Import the new modal
import "./css/transaction.css"; // Import the updated CSS

const AllTransaction = () => {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionStatus, setTransactionStatus] = useState(null); // Track transaction success or failure
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const closeModal = () => {
    setTransactionStatus(null); // Close the modal by resetting status
  };

  // Simulate transaction handling logic
  const handleTransaction = (status) => {
    setTransactionStatus(status); // Set to 'true' for success, 'false' for failure
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
        setFilteredHistory(response.data); // Set filtered history initially as all fetched history
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
        getHistory(); // Access token is valid, fetch history
      } else {
        await myRefresh(); // Refresh token and then fetch history
        getHistory();
      }
    };

    checkTokenAndFetch(); // Call this function when the component mounts
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
              const statusClass = data.status_code ? "success" : "failure";
              const statusIcon = data.status_code ? "fa-check" : "fa-close";
              const statusText = data.status_code ? "Success" : "Failure";

              return (
                <div
                  key={data.id}
                  className={`transaction-card ${statusClass}`}
                  title="View Transaction Details"
                  onClick={() => handleTransaction(data.status_code)}
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

      <TransactionModal
        transactionStatus={transactionStatus}
        closeModal={closeModal}
      />

      <DownNav />
    </section>
  );
};

export default AllTransaction;
