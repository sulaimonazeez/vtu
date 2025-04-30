import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/airtime.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DownNav from "./downNav";


const Airtime = () => {

    const [network, setNetwork] = useState("");
    const [amount, setAmount] = useState("");
    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");
    const [userMessage, setUserMessage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [responseModalVisible, setResponseModalVisible] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState("");
    const [message, setResponseMessage] = useState("")
    const navigate = useNavigate();
    const [error, setError] = useState("");

    useEffect(() => {
        const myRefresh = async () => {
            try {
                const refreshToken = localStorage.getItem("refresh_token");
                const res = await axios.post("http://localhost:8000/api/token/refresh/", {
                  refresh: refreshToken,
                });
        
                // Store new access token
                localStorage.setItem("access_token", res.data.access);
            } catch (e) {
                console.error("Refresh token failed, logging out.");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                navigate("/login");
            }
        };

        const accessToken = localStorage.getItem("access_token");
        const expiresIn = localStorage.getItem("expires_in");
    
        // If access token exists and has not expired, redirect to home page
        if (accessToken && expiresIn && Date.now() < expiresIn) {
            console.log("Token Valid");
        } else {
            myRefresh();
        }
        
    }, [navigate]);
        
    const handleNetworkChange = (e) => {
        setNetwork(e.target.value);
    };

    const handleAmount = (e) => {
        setAmount(e.target.value);
    }

    const sendData = async () => {
        let formData = {
            network,
            phone,
            amount
        }
        try {
            const accessToken = localStorage.getItem("access_token");
            const response = await axios.post("http://127.0.0.1:8000/api/airtime/", formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
        });
            console.log("Response:", response.data);
            setTransactionStatus(message);
        } catch (error) {
            console.error("Error:", error);
            setError(error);
            setTransactionStatus("Failed to Perform Transaction. Please try again.");
        } finally {
            setResponseModalVisible(true); // Show transaction response modal
        }
    }

    const handlePhone = (e) => {
        setPhone(e.target.value);
    }

    const handlePinChange = (e) => {
        setPin(e.target.value.slice(0, 4)); // Ensures PIN is max 4 digits
    };

    const submitPin = () => {
        if (pin === "1111") {
            setModalVisible(false);
            sendData();
            setResponseMessage(`You've successful Purchase Purchase Airtime ${amount} for ${phone}`)
            setPin("");
        } else {
            setUserMessage("Incorrect Pin");
            setPin("");
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
                <h2 className="text-center mb-4">Buy Data</h2>
                <div className="text-center d-flex justify-content-evenly network-icons mb-3">
            <img onClick={ () => setNetwork("airtel") } style={{width: "15%", height: "14vw"}} id="airtel" src="https://paystar.com.ng/static/airtel.png" alt="Airtel" />
            <img onClick={ () => setNetwork("mtn") } style={{width: "15%", height: "14vw"}} id="mtn" src="https://paystar.com.ng/static/mtn.png" alt="MTN" />
            <img onClick={ () => setNetwork("glo") } style={{width: "15%", height: "14vw"}} id="glo" src="https://paystar.com.ng/static/glo.png" alt="Glo" />
            <img onClick={ () => setNetwork("mobile9") } style={{width: "15%", height: "14vw"}} id="9mobile" src="https://paystar.com.ng/static/9mobile.png" alt="9mobile"/>
        </div>
                <form onSubmit={handleFormSubmit} noValidate>
                    <div className="form-group">
                        <select
                            className="form-control"
                            value={network}
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

                    <div className="form-group" onChange={handlePhone}>
                        <input
                            placeholder="Phone Number"
                            value={phone}
                            type="tel"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            onChange={handleAmount}
                            placeholder="Amount to pay"
                            type="number"
                            className="form-control"
                            required
                            value={amount}
                        />
                    </div>

                    <div className="text-center">
                        <button type="submit" className="btn btn-primary">Buy Now</button>
                    </div>
                </form>

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


                <Modal show={responseModalVisible} onHide={() => setResponseModalVisible(false)} className="text-center">
    <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title className="text-center w-100">Transaction Status</Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-center">
        <div className="status-icon">
            <i style={error? {backgroundColor:"red"}:{backgroundColor:"green"}} className="fs-1 fa fa-check-circle" aria-hidden="true"></i>
        </div>
        <p className="transaction-status-text">{transactionStatus}</p>
    </Modal.Body>
    <Modal.Footer className="modal-footer-custom">
        <button className="btn btn-primary" onClick={() => setResponseModalVisible(false)}>
            Close
        </button>
    </Modal.Footer>
</Modal>


            </div>
            <DownNav />
        </div>

    )
}


export default Airtime;
