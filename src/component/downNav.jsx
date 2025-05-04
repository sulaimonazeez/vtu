import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "./dashed.css";

const DownNav = () => {
    const navigate = useNavigate();
    const Logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
    }

    return (
        <div className="bottom-nav">
            <Link to="/home" className="nav-link">
                <i className="fas fa-home"></i>
                Home
            </Link>
            <Link to="/history" className="nav-link">
                <i className="fas fa-list-alt"></i>
                History
            </Link>
            <Link to="/notification" className="nav-link">
                <i className="fas fa-bell"></i>
                Notification
            </Link>
            <a onClick={Logout} className="nav-link">
                <i className="fas fa-sign-out-alt"></i>
                Logout
            </a>
        </div>
    );
}

export default DownNav;
