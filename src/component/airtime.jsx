import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/airtime.css"; // Assuming this is correct
import { useNavigate } from "react-router-dom";

// --- FIX 1: Import axiosInstance instead of plain axios ---
import axiosInstance from "./utility"; // Adjust path as needed
// --- ADDED: Import logout utility if needed for specific error handling ---
import { logout } from "./auth"; // Adjust path as needed

import DownNav from "./downNav"; // Assuming this is correct

const Airtime = () => {
    const [network, setNetwork] = useState("");
    const [amount, setAmount] = useState("");
    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");
    const [userMessage, setUserMessage] = useState(""); // For form-level messages
    const [modalVisible, setModalVisible] = useState(false); // For PIN entry modal
    const [responseModalVisible, setResponseModalVisible] = useState(false); // For transaction response modal
    const [transactionStatus, setTransactionStatus] = useState(""); // 'success' or 'error'
    const [message, setResponseMessage] = useState(""); // Message for transaction response modal
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // General loading state for operations
    // const [error, setError] = useState(""); // Removed: Use `message` or a separate state for API errors
    const [submitting, setSubmitting] = useState(false); // Specific loading state for form submission

    // --- FIX 1: REMOVE THIS ENTIRE useEffect BLOCK FOR MANUAL TOKEN REFRESH ---
    // The axiosInstance interceptor handles token refreshing automatically and securely.
    // Storing refresh_token in localStorage is a security vulnerability.
    /*
    useEffect(() => {
        const myRefresh = async () => {
            try {
                const refreshToken = localStorage.getItem("refresh_token"); // CRITICAL: REFRESH TOKEN SHOULD NOT BE IN LOCALSTORAGE
                const res = await axios.post("https://paystar.com.ng/api/token/refresh/", {
                    refresh: refreshToken,
                });
                localStorage.setItem("access_token", res.data.access);
            } catch (e) {
                console.error("Refresh token failed, logging out.");
                localStorage.removeItem("access_token"); // Removes access token
                localStorage.removeItem("refresh_token"); // Tries to remove refresh token which shouldn't be there
                navigate("/login");
            }
        };

        const accessToken = localStorage.getItem("access_token");
        const expiresIn = localStorage.getItem("expires_in");

        if (accessToken && expiresIn && Date.now() < parseInt(expiresIn)) { // Added parseInt
            console.log("Token Valid");
        } else {
            myRefresh();
        }
    }, [navigate]);
    */
    // The above useEffect is replaced by the automatic refresh mechanism in `axiosInstance`.

    const handleNetworkChange = (e) => {
        setNetwork(e.target.value);
    };

    const handleAmount = (e) => {
        setAmount(e.target.value);
    };

    // --- FIX 2 & 5: Use axiosInstance for API call ---
    const sendData = async () => {
        setSubmitting(true); // Start loading for actual data submission
        let formData = {
            network,
            phone,
            amount,
            // If your backend expects the PIN here for validation, add it:
            // pin: pin,
        };

        try {
            // --- CRITICAL FIX: Use axiosInstance.post ---
            // axiosInstance automatically adds Authorization header, handles withCredentials,
            // and transparently refreshes tokens if needed.
            const response = await axiosInstance.post("/airtime/", formData); // Using relative path due to baseURL in axiosInstance

            console.log("Response:", response.data);
            if (response.data.status || response.data.status === "pending") {
                setTransactionStatus("success");
                setResponseMessage(response.data.message);
                // Clear form fields on success
                setNetwork("");
                setAmount("");
                setPhone("");
            } else {
                setTransactionStatus("error");
                setResponseMessage(response.data.message || "Failed to buy airtime. Please try again.");
            }
        } catch (error) {
            console.error("Error during airtime purchase:", error.response?.data || error.message);
            setTransactionStatus("error");
            // The interceptor handles 401s and redirects to login.
            // Errors caught here are usually non-authentication issues (e.g., 400, 500).
            setResponseMessage(error.response?.data?.detail || error.response?.data?.error || "Failed to perform transaction. Please try again.");
            // If a global logout function is needed for unhandled critical auth errors not caught by interceptor:
            // if (error.response?.status === 401 && !error.config.__isRetryRequest) { logout(); }
        } finally {
            setSubmitting(false); // End loading
            setResponseModalVisible(true); // Show transaction response modal
        }
    };

    // --- FIX 4: Move onChange to the input tag ---
    const handlePhoneChange = (e) => {
        setPhone(e.target.value);
    };

    const handlePinChange = (e) => {
        setPin(e.target.value.slice(0, 4)); // Ensures PIN is max 4 digits
    };

    // --- FIX 3: PIN VALIDATION MUST BE DONE ON BACKEND ---
    const submitPin = async () => {
        setSubmitting(true); // Indicate PIN submission is in progress
        setUserMessage(""); // Clear previous messages
        try {
            // --- Replace with API call to backend for PIN validation ---
            // Example:
            const response = await axiosInstance.post("/validate-pin/", { pin: pin }); // Your actual backend endpoint
            if (response.data.status === "success") { // Assuming backend returns { isValid: true/false }
                setModalVisible(false); // Close PIN modal
                sendData(); // Proceed with airtime purchase
                setPin(""); // Clear PIN
            } else {
                setUserMessage(response.data.message || "Incorrect PIN. Please try again.");
                setPin(""); // Clear PIN for retry
            }
        } catch (error) {
            console.error("PIN validation failed:", error.response?.data || error.message);
            setUserMessage(error.response?.data?.message || "PIN validation error. Please try again.");
            setPin(""); // Clear PIN for retry
        } finally {
            setSubmitting(false); // End PIN submission loading
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!network || !phone || !amount) {
            setUserMessage("Please fill in all fields");
            return;
        }

        // Show modal for PIN entry
        setUserMessage(""); // Clear any previous messages
        setModalVisible(true);
    };

    return (
        <div className="bodys">
            <div className="container spacing">
                <h2 className="text-center mb-4">Buy Airtime</h2> {/* Changed title to Airtime */}
                <div className="text-center d-flex justify-content-evenly network-icons mb-3">
                    <img onClick={() => setNetwork("airtel")} style={{ width: "15%", height: "14vw" }} id="airtel" src="https://paystar.com.ng/static/airtel.png" alt="Airtel" />
                    <img onClick={() => setNetwork("mtn")} style={{ width: "15%", height: "14vw" }} id="mtn" src="https://paystar.com.ng/static/mtn.png" alt="MTN" />
                    <img onClick={() => setNetwork("glo")} style={{ width: "15%", height: "14vw" }} id="glo" src="https://paystar.com.ng/static/glo.png" alt="Glo" />
                    <img onClick={() => setNetwork("mobile9")} style={{ width: "15%", height: "14vw" }} id="9mobile" src="https://paystar.com.ng/static/9mobile.png" alt="9mobile" />
                </div>
                <form onSubmit={handleFormSubmit} noValidate>
                    <div className="form-group">
                        <select className="form-control" value={network} onChange={handleNetworkChange} required>
                            <option value="" disabled>Select Network</option>
                            <option value="airtel">Airtel</option>
                            <option value="mtn">MTN</option>
                            <option value="glo">Glo</option>
                            <option value="mobile9">9mobile</option>
                        </select>
                    </div>

                    <div className="form-group">
                        {/* FIX 4: onChange moved to input tag */}
                        <input placeholder="Phone Number" value={phone} type="tel" className="form-control" onChange={handlePhoneChange} required />
                    </div>

                    <div className="form-group">
                        <input onChange={handleAmount} placeholder="Amount to pay" type="number" value={amount} className="form-control" required />
                    </div>

                    {userMessage && <p className="text-danger">{userMessage}</p>}

                    <button disabled={submitting} type="submit" className="btn btn-primary">
                        {submitting ? (
                            <span>Purchasing... <i className="spinner-border spinner-border-sm"></i></span>
                        ) : (
                            <span>Proceed</span>
                        )}
                    </button>
                </form>
            </div>

            {/* PIN Modal */}
            <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter PIN</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <input type="password" className="form-control" value={pin} onChange={handlePinChange} placeholder="Enter 4-Digit Pin" maxLength="4" />
                    </div>
                    {userMessage && <p className="text-danger">{userMessage}</p>}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-primary" onClick={submitPin} disabled={submitting}>Submit</button>
                </Modal.Footer>
            </Modal>

            {/* Transaction Response Modal */}
            <Modal show={responseModalVisible} onHide={() => setResponseModalVisible(false)} className="text-center">
                <Modal.Header closeButton className={`modal-header-custom ${transactionStatus === "success" ? "success" : "error"}`}>
                    <Modal.Title>Transaction Status</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body">
                    <div className={`status-icon ${transactionStatus === "success" ? "success" : "error"}`}>
                        <i className={`fa ${transactionStatus === "success" ? "fa-check-circle text-success fs-1" : "fs-1 text-danger fa-times-circle"}`} aria-hidden="true" style={{ fontSize: "100px" }}></i>
                    </div>
                    <p className="transaction-status-text">{message}</p>
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <button className="btn-primary" onClick={() => setResponseModalVisible(false)}>Close</button>
                </Modal.Footer>
            </Modal>
            <DownNav />
        </div>
    );
};

export default Airtime;
