import React, { useEffect, useState } from "react";
import Profile from "./profile.jsx"; // Assuming Profile.jsx is in the same directory
import axiosInstance from "./utility"; // Assuming axiosInstance is correctly configured

const ProfileWrapper = () => {
    const [user, setUser] = useState(null); // Initialize with null to indicate no data yet
    const [loading, setLoading] = useState(true); // Added: State for loading status
    const [error, setError] = useState(null);     // Added: State for error messages

    const fetchProfile = async () => {
        setLoading(true); // Start loading before API call
        setError(null);   // Clear any previous errors
        try {
            let response = await axiosInstance.get("/profile/");
            setUser(response.data); // Set user data on success
        } catch (err) {
            console.error("Failed to fetch profile:", err); // Log full error for debugging
            // Improved error handling:
            if (err.response) {
                // Server responded with a status other than 2xx (e.g., 404, 500)
                setError(err.response.data.message || err.response.data.detail || "Failed to load profile.");
            } else if (err.request) {
                // Request was made but no response received (e.g., network issue)
                setError("No response from server. Please check your internet connection.");
            } else {
                // Something else happened while setting up the request
                setError("An unexpected error occurred. Please try again.");
            }
            setUser(null); // Ensure user is null if there's an error
        } finally {
            setLoading(false); // End loading regardless of success or failure
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []); // Empty dependency array means it runs once on mount

    // Conditional rendering based on loading and error states
    if (loading) {
        return (
            <div className="profile-loading">
                Loading profile... {/* You can replace this with a spinner component */}
                <i className="spinner-border spinner-border-sm"></i> {/* Example spinner */}
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-error" style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>
                Error: {error}
                {/* Optionally add a retry button */}
                <button onClick={fetchProfile} style={{ marginLeft: '10px' }}>Retry</button>
            </div>
        );
    }

    // Only render Profile component if user data is available
    if (user) {
        return (
            <div>
                <Profile user={user} />
            </div>
        );
    }

    // Fallback if somehow not loading, no error, and no user (shouldn't happen with above logic)
    return (
        <div className="profile-no-data">
            No profile data available.
        </div>
    );
};

export default ProfileWrapper;
