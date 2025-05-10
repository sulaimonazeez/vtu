import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/bundle.css"; // Assuming this path is correct

// --- FIX 1 & 4: Import axiosInstance (make sure the path is correct) ---
import axiosInstance from "./utility"; // Adjust path as needed

import { useNavigate } from "react-router-dom";
import DownNav from "./downNav"; // Assuming this path is correct

const BuyDataForm = () => {
    const [networkData, setNetworkData] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState("");
    const [selectedDataType, setSelectedDataType] = useState("");
    const [selectedDataPlan, setSelectedDataPlan] = useState("");
    const [amount, setAmount] = useState("");
    const [phone, setPhone] = useState(""); // Added phone state
    const [pin, setPin] = useState("");
    const [modalVisible, setModalVisible] = useState(false); // State for PIN entry modal
    const [responseModalVisible, setResponseModalVisible] = useState(false); // State for transaction response modal
    const [userMessage, setUserMessage] = useState(""); // For form-level messages (e.g., validation errors)
    const [loading, setLoading] = useState(false); // General loading state (e.g., for API calls)
    const [transactionStatus, setTransactionStatus] = useState(""); // 'success' or 'error'
    const [message, setResponseMessage] = useState(""); // Message for transaction response modal
    const navigate = useNavigate();

    useEffect(() => {
        // --- FIX 4: Use axiosInstance.get for consistency, assuming it's configured with a baseURL ---
        // If this is a truly public endpoint that doesn't need axiosInstance's interceptors/baseURL,
        // then `Workspace` is acceptable. But for consistency with authenticated calls, axiosInstance is preferred.
        axiosInstance.get("/network/") // Using relative path assuming baseURL in axiosInstance
            .then((response) => {
                if (response.status === 200) {
                    setNetworkData(response.data);
                } else {
                    console.error("Error fetching network data:", response.statusText);
                    // Optionally display an error message to the user
                }
            })
            .catch((error) => console.error("Error fetching network data:", error));

        // Authentication check
        const accessToken = localStorage.getItem("access_token");
        const expiresIn = localStorage.getItem("expires_in");

        // --- FIX 3: Parse expiresIn to integer for correct comparison ---
        if (!accessToken || !expiresIn || Date.now() >= parseInt(expiresIn)) {
            // This check simply ensures the user is redirected if they land here without a valid token.
            // The actual token refresh is handled by axiosInstance interceptor on API calls.
            navigate("/login");
        }
    }, [navigate]);

    const handleNetworkChange = (e) => {
        setSelectedNetwork(e.target.value);
        setSelectedDataType("");
        setSelectedDataPlan("");
        setAmount("");
    };

    const handleDataTypeChange = (e) => {
        setSelectedDataType(e.target.value);
        setSelectedDataPlan("");
        setAmount("");
    };

    const handleDataPlanChange = (e) => {
        const selectedPlanElement = e.target.selectedOptions[0];
        // Ensure planPrice is parsed as a number if you plan to use it in calculations
        const planPrice = selectedPlanElement?.getAttribute("data-price") || "";
        setAmount(planPrice);
        setSelectedDataPlan(e.target.value);
    };

    const handlePinChange = (e) => {
        setPin(e.target.value.slice(0, 4)); // Max 4 digits
    };

    const sendData = async () => {
        setLoading(true); // Start loading for the actual data purchase API call
        setModalVisible(false); // Close PIN modal

        const formData = {
            network: selectedNetwork,
            sme: selectedDataType, // Ensure this matches your backend's expected key
            data_plan: selectedDataPlan, // Ensure this matches your backend's expected key (e.g., `data_plan` vs `dataType`)
            amount: amount,
            phone: phone,
            // --- RECOMMENDATION: Send PIN here if the PIN validation is done on the backend with the transaction ---
            // pin: pin, // Uncomment if your /api/bundle/ endpoint also expects PIN for validation
        };

        try {
            // --- CRITICAL FIX 1: Use axiosInstance.post ---
            // This will automatically add the Authorization header and handle token refreshing.
            const response = await axiosInstance.post("/bundle/", formData); // Using relative path due to baseURL in axiosInstance

            setTransactionStatus(response.data.status);
            setResponseMessage(response.data.message);

            if (response.data.status === "success" || response.data.status === "pending") {
                // Clear form fields on success/pending
                setSelectedNetwork("");
                setSelectedDataType("");
                setSelectedDataPlan("");
                setAmount("");
                setPhone("");
            } else {
                // Backend should ideally provide a more specific error message.
                // Fallback to a generic message if not provided.
                setResponseMessage(response.data.message || "Failed to buy data. Please try again.");
            }
        } catch (error) {
            console.error("Error during data purchase:", error.response?.data || error.message);
            setTransactionStatus("error");
            // Detailed error message from backend or a generic one
            setResponseMessage(error.response?.data?.detail || error.response?.data?.message || "Failed to perform transaction. Please try again.");
            // The axiosInstance interceptor should handle 401 (unauthorized) by redirecting to login.
            // Errors caught here are likely 400 (bad request), 500 (server error), network issues.
        } finally {
            setLoading(false);
            setResponseModalVisible(true); // Show transaction response modal
        }
    };

    // --- CRITICAL FIX 2: PIN VALIDATION MUST BE DONE ON BACKEND ---
    const submitPin = async () => {
        setLoading(true); // Indicate PIN submission is in progress
        setUserMessage(""); // Clear previous messages for PIN modal

        try {
            // --- Replace with an API call to your backend for PIN validation ---
            // Example:
            const response = await axiosInstance.post("/validate-pin/", { pin: pin }); // Replace with your actual backend endpoint
            
            if (response.data.isValid) { // Assuming your backend returns { isValid: true, message: "..." }
                setModalVisible(false); // Close PIN modal
                sendData(); // Proceed with data purchase if PIN is valid
                setPin(""); // Clear PIN after successful validation
            } else {
                // Backend should provide an error message like "Incorrect PIN"
                setUserMessage(response.data.message || "Incorrect PIN. Please try again.");
                setPin(""); // Clear PIN for retry
            }
        } catch (error) {
            console.error("PIN validation failed:", error.response?.data || error.message);
            setUserMessage(error.response?.data?.message || "PIN validation error. Please try again.");
            setPin(""); // Clear PIN for retry
        } finally {
            setLoading(false); // End PIN submission loading
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!selectedNetwork || !selectedDataType || !selectedDataPlan || !amount || !phone) {
            setUserMessage("⚠Please fill in all fields");
            return;
        }
        setUserMessage(""); // Clear any previous form-level messages
        setModalVisible(true); // Show PIN modal
    };

    // Filter data plans based on selected network and data type
    const filteredDataPlans = networkData
        .filter((n) => n.name.toLowerCase() === selectedNetwork)
        .flatMap((network) => network.categories)
        .filter((category) => category.name === selectedDataType)
        .flatMap((category) => category.plans);

    return (
        <div className="bodys">
            <div className="container spacing">
                <h2 className="text-center mb-4">Buy Data</h2>

                <form onSubmit={handleFormSubmit} noValidate>
                    <div className="form-group">
                        <select
                            name="network"
                            className="form-control"
                            value={selectedNetwork}
                            onChange={handleNetworkChange}
                            required
                        >
                            <option value="" disabled>
                                Select Network
                            </option>
                            {/* Render network options from networkData */}
                            {networkData.map((net) => (
                                <option key={net.name} value={net.name.toLowerCase()}>
                                    {net.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <select
                            name="sme"
                            className="form-control"
                            value={selectedDataType}
                            onChange={handleDataTypeChange}
                            required
                            disabled={!selectedNetwork} // Disable until network is selected
                        >
                            <option value="" disabled>
                                Select Data Type
                            </option>
                            {networkData
                                .filter((n) => n.name.toLowerCase() === selectedNetwork)
                                .flatMap((network) => network.availability)
                                .map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <select
                            name="dataType"
                            className="form-control"
                            value={selectedDataPlan}
                            onChange={handleDataPlanChange}
                            required
                            disabled={!selectedDataType} // Disable until data type is selected
                        >
                            <option value="" disabled>
                                Select Data Plan
                            </option>
                            {filteredDataPlans.map((plan) => (
                                <option key={plan.name} value={plan.name} data-price={plan.price}>
                                    {plan.name} (₦{plan.price}) {/* Display price */}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <input
                            name="phone"
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Phone Number"
                            type="tel"
                            className="form-control"
                            required
                            value={phone}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            name="amount"
                            placeholder="Amount to pay"
                            type="number"
                            className="form-control"
                            required
                            value={amount}
                            readOnly // Amount is derived from data plan, should be read-only
                        />
                    </div>

                    <div className="text-center">
                        {userMessage && <p className="text-danger">{userMessage}</p>} {/* Display form-level messages */}
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    <span className="ms-2">Processing...</span>
                                </>
                            ) : (
                                "Buy Now"
                            )}
                        </button>
                    </div>
                </form>

                {/* PIN Entry Modal */}
                <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Enter Your PIN</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <input
                            type="password"
                            className="form-control"
                            value={pin}
                            onChange={handlePinChange}
                            maxLength={4}
                            placeholder="Enter 4-digit PIN"
                        />
                        {userMessage && <p className="text-danger mt-2">{userMessage}</p>} {/* Display PIN modal messages */}
                        <button onClick={submitPin} className="btn btn-primary mt-3" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    <span className="ms-2">Submitting PIN...</span>
                                </>
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </Modal.Body>
                </Modal>

                {/* Transaction Response Modal */}
                <Modal
                    show={responseModalVisible}
                    onHide={() => setResponseModalVisible(false)}
                    className="text-center"
                >
                    <Modal.Header
                        closeButton
                        className={`modal-header-custom ${
                            transactionStatus === "success" ? "success" : "error"
                        }`}
                    >
                        <Modal.Title>Transaction Status</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modal-body">
                        <div
                            className={`status-icon ${
                                transactionStatus === "success" ? "success" : "error"
                            }`}
                        >
                            <i
                                className={`fa ${
                                    transactionStatus === "success"
                                        ? "fa-check-circle text-success fs-1"
                                        : "fs-1 text-danger fa-times-circle"
                                }`}
                                aria-hidden="true"
                                style={{ fontSize: "100px" }}
                            ></i>
                        </div>
                        <p className="transaction-status-text">{message}</p>
                    </Modal.Body>
                    <Modal.Footer className="modal-footer-custom">
                        <button className="btn-primary" onClick={() => setResponseModalVisible(false)}>
                            Close
                        </button>
                    </Modal.Footer>
                </Modal>
            </div>

            <DownNav />
        </div>
    );
};

export default BuyDataForm;
