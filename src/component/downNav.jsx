import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/home.css';

const DownNav = () => {
    const navigate = useNavigate();
    const Logout = () => {
        localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigate("/login");
      }
      
    return (
        <div className="bottom-nav">
            <div className="nav-item" onClick={() => navigate("/home")}>
                <span className="nav-icon"><img src="https://paystar.com.ng/static/home.png" alt="Nav"/></span>
                <span className="nav-label">Home</span>
            </div>
            <div className="nav-item" onClick={() => navigate("/history")}>
                <span className="nav-icon"><img src="https://paystar.com.ng/static/receipt.png" alt="Nav"/></span>
                <span className="nav-label">History</span>
            </div>
            <div className="nav-item" onClick={() => navigate("/notification")}>
                <span className="nav-icon"><img src="https://paystar.com.ng/static/bell-notification-social-media.png" alt="Nav"/></span>
                <span className="nav-label">Notifications</span>
            </div>
            <div className="nav-item" onClick={ Logout }>
                <span className="nav-icon"><img src="https://paystar.com.ng/static/sign-out-alt.png" alt="Logo"/></span>
                <span className="nav-label">Logout</span>
            </div>
      </div>
    )
}

export default DownNav;
