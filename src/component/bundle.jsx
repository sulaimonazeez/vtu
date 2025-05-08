import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/bundle.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import axiosInstance from "./utility";
import DownNav from "./downNav";

const BuyDataForm = () => {
    const [networkData, setNetworkData] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState("");
    const [selectedDataType, setSelectedDataType] = useState("");
    const [selectedDataPlan, setSelectedDataPlan] = useState("");
    const [amount, setAmount] = useState("");
    const [pin, setPin] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [responseModalVisible, setResponseModalVisible] = useState(false); // NEW modal state for transaction response
    const [userMessage, setUserMessage] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(""); // NEW - Stores success or failure message
    const [message, setResponseMessage] = useState("")
    const navigate = useNavigate();

    useEffect(() => {
        fetch("https://paystar.com.ng/api/network/")
            .then(response => response.json())
            .then(data => setNetworkData(data))
            .catch(error => console.error("Error fetching data:", error));

        const accessToken = localStorage.getItem("access_token");
        const expiresIn = localStorage.getItem("expires_in");

        if (!accessToken || !expiresIn || Date.now() >= expiresIn) {
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
        const planPrice = selectedPlanElement?.getAttribute("data-price") || "";
        setAmount(planPrice);
        setSelectedDataPlan(e.target.value);
    };

    const handlePinChange = (e) => {
        setPin(e.target.value.slice(0, 4)); // Max 4 digits
    };

    const sendData = async () => {
        setLoading(true);
        setModalVisible(false); // Close PIN modal

        const formData = {
            selectedNetwork,
            selectedDataType,
            selectedDataPlan,
            amount,
            phone
        };

        try {
            const accessToken = localStorage.getItem("access_token");
            const response = await axios.post("https://paystar.com.ng/api/bundle/", formData, {
                headers: {
                       "Content-Type": "application/json",
                       'Authorization': `Bearer ${accessToken}`
                }
             });

            setTransactionStatus(response.data.status);
            setResponseMessage(response.data.message);
            if (response.data.status === "failed") {
               setResponseMessage("Failed to buy data. Please try again...");
            }
        } catch (error) {
            setResponseMessage("Failed to buy data. Please try again.");
        } finally {
            setLoading(false);
            setResponseModalVisible(true); // Show transaction response modal
        }
    };

    const submitPin = () => {
        if (pin === "1111") {
            sendData();
            setPin("");
        } else {
            setUserMessage("Incorrect PIN");
            setPin("");
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!selectedNetwork || !selectedDataType || !selectedDataPlan || !amount || !phone) {
            setUserMessage("⚠Please fill in all fields");
            return;
        }
        setUserMessage("");
        setModalVisible(true); // Show PIN modal
    };

    return (
        <div className="bodys">
            <div className="container spacing">
                <h2 className="text-center mb-4">Buy Data</h2>

                <form onSubmit={handleFormSubmit} noValidate>
                    <div className="form-group">
                        <select
                            className="form-control"
                            value={selectedNetwork}
                            onChange={handleNetworkChange}
                            required
                        >
                            <option value="" disabled>Select Network</option>
                            <option value="airtel">Airtel</option>
                            <option value="mtn">MTN</option>
                            <option value="glo">Glo</option>
                            <option value="mobile9">9mobile</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <select
                            className="form-control"
                            value={selectedDataType}
                            onChange={handleDataTypeChange}
                            required
                        >
                            <option value="" disabled>Select Data Type</option>
                            {networkData
                                .filter(n => n.name.toLowerCase() === selectedNetwork)
                                .flatMap(network => network.availability)
                                .map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <select
                            className="form-control"
                            value={selectedDataPlan}
                            onChange={handleDataPlanChange}
                            required
                        >
                            <option value="" disabled>Select Data Plan</option>
                            {networkData
                                .filter(n => n.name.toLowerCase() === selectedNetwork)
                                .flatMap(network => network.categories)
                                .filter(category => category.name === selectedDataType)
                                .flatMap(category => category.plans)
                                .map(plan => (
                                    <option key={plan.name} value={plan.name} data-price={plan.price}>
                                        {plan.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <input
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
                            placeholder="Amount to pay"
                            type="number"
                            className="form-control"
                            required
                            value={amount}
                            readOnly
                        />
                    </div>

                    <div className="text-center">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Processing..." : "Buy Now"}
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
                        {userMessage && <p>{userMessage}</p>}
                        <button onClick={submitPin} className="btn btn-primary mt-2">Submit</button>
                    </Modal.Body>
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
            </div>

            <DownNav />
        </div>
    );
};

export default BuyDataForm;
