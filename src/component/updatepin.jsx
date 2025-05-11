import React, { useState } from 'react';
import { Modal } from 'react-bootstrap'; // Assuming you have react-bootstrap installed
import axiosInstance from './utility'; // Adjust path as needed
import './update-pin.css'; // We'll create this CSS file
import DownNav from "./downNav";
const UpdatePin = () => {
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(''); // For client-side validation errors

    // State for the result modal
    const [showResultModal, setShowResultModal] = useState(false);
    const [modalStatus, setModalStatus] = useState(''); // 'success' or 'error'
    const [modalMessage, setModalMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError(''); // Clear previous form errors

        // Client-side validation
        if (!oldPin || !newPin || !confirmNewPin) {
            setFormError('All PIN fields are required.');
            setLoading(false);
            return;
        }
        if (newPin !== confirmNewPin) {
            setFormError('New PIN and Confirm New PIN do not match.');
            setLoading(false);
            return;
        }
        if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
            setFormError('New PIN must be a 4-digit number.');
            setLoading(false);
            return;
        }
        if (oldPin.length !== 4 || !/^\d{4}$/.test(oldPin)) {
            setFormError('Old PIN must be a 4-digit number.');
            setLoading(false);
            return;
        }
        if (oldPin === newPin) {
            setFormError('New PIN cannot be the same as the old PIN.');
            setLoading(false);
            return;
        }


        try {
            const response = await axiosInstance.post('/update-pin/', { // Adjust endpoint if different
                old_pin: oldPin,
                new_pin: newPin,
                confirm_new_pin: confirmNewPin,
            });

            if (response.data.success) {
                setModalStatus('success');
                setModalMessage(response.data.message || 'PIN updated successfully!');
                // Clear form fields on success
                setOldPin('');
                setNewPin('');
                setConfirmNewPin('');
            } else {
                setModalStatus('error');
                setModalMessage(response.data.message || 'Failed to update PIN. Please try again.');
            }
        } catch (error) {
            console.error("PIN update error:", error.response?.data || error.message);
            setModalStatus('error');
            setModalMessage(error.response?.data?.message || 'An error occurred during PIN update. Please try again later.');
        } finally {
            setLoading(false);
            setShowResultModal(true); // Always show modal after attempt
        }
    };

    const handleCloseModal = () => {
        setShowResultModal(false);
        setModalMessage('');
        setModalStatus('');
    };

    return (
        <div className="update-pin-container">
            <h2>Update Your PIN</h2>
            {formError && <div className="alert alert-danger">{formError}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                    <label htmlFor="oldPin">Current PIN</label>
                    <input
                        type="password"
                        className="form-control"
                        id="oldPin"
                        maxLength="4"
                        value={oldPin}
                        onChange={(e) => setOldPin(e.target.value)}
                        required
                        placeholder="Enter current 4-digit PIN"
                    />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="newPin">New PIN</label>
                    <input
                        type="password"
                        className="form-control"
                        id="newPin"
                        maxLength="4"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        required
                        placeholder="Enter new 4-digit PIN"
                    />
                </div>
                <div className="form-group mb-4">
                    <label htmlFor="confirmNewPin">Confirm New PIN</label>
                    <input
                        type="password"
                        className="form-control"
                        id="confirmNewPin"
                        maxLength="4"
                        value={confirmNewPin}
                        onChange={(e) => setConfirmNewPin(e.target.value)}
                        required
                        placeholder="Confirm new 4-digit PIN"
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? (
                        <span>
                            Updating PIN... <i className="spinner-border spinner-border-sm"></i>
                        </span>
                    ) : (
                        <span>Update PIN</span>
                    )}
                </button>
            </form>

            {/* Result Modal */}
            <Modal show={showResultModal} onHide={handleCloseModal} centered className="result-modal">
                <Modal.Header closeButton className={`modal-header-custom ${modalStatus}`}>
                    <Modal.Title>PIN Update Status</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body">
                    <div className={`status-icon ${modalStatus}`}>
                        {modalStatus === 'success' ? (
                            <i className="fa fa-check-circle animated" aria-hidden="true"></i>
                        ) : (
                            <i className="fa fa-times-circle animated" aria-hidden="true"></i>
                        )}
                    </div>
                    <p className="message-text">{modalMessage}</p>
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                </Modal.Footer>
            </Modal>
            <DownNav />
        </div>
    );
};

export default UpdatePin;
