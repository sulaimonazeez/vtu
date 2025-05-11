import React from 'react';
import './landing.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";


function Landing() {
  const navigate = useNavigate();
  return (
    <div className="bodyss">
      <div className="landing-container">
        {/* Header Section */}
        <div className="landing-header">
          <h1 className="title">Top-Up Your Life Fast! 🔋</h1>
          <p className="subtitle">Recharge Airtime, Buy Data, All In One Place</p>
        </div>

        {/* Feature Icons */}
        <div className="feature-icons">
          <div className="icon-container airtime">
            <i className="fas fa-mobile-alt fa-3x"></i>
            <p>Airtime</p>
          </div>

          <div className="icon-container data">
            <i className="fas fa-wifi fa-3x"></i>
            <p>Data</p>
          </div>

          <div className="icon-container payment">
            <i className="fas fa-credit-card fa-3x"></i>
            <p>Payments</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="cta-container">
          <button onClick={() => navigate("/login")} className="cta-button">Start Now</button>
        </div>
      </div>
    </div>
  );
}

export default Landing;
