import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    <a onClick={()=> navigate("/home");} className="active">
      <i className="fas fa-home"></i>
      Home
    </a>
    <a onClick={()=> navigate("/history");}>
      <i className="fas fa-list-alt"></i>
      History
    </a>
    <a onClick={()=> navigate("/notification");}>
      <i className="fas fa-bell"></i>
      Notification
    </a>
    <a onClick={Logout}>
      <i className="fas fa-sign-out-alt"></i>
      Logout
    </a>
  </div>
    )
}

export default DownNav;
