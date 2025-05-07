import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NINSubmission.css';

export default function NINSubmission() {
  const [nin, setNin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token || isTokenExpired(token)) {
      navigate('/login');
    }
  }, []);

  const isTokenExpired = (token) => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      await axios.post('/api/submit-nin', { nin }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('NIN submitted successfully');
    } catch (error) {
      alert('Failed to submit NIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nin-container">
      <div className="nin-card">
        <h2 className="nin-title">Submit Your NIN</h2>
        <form onSubmit={handleSubmit} className="nin-form">
          <input 
            type="text" 
            placeholder="Enter your NIN" 
            value={nin} 
            onChange={(e) => setNin(e.target.value)} 
            className="nin-input"
            required
          />
          <button 
            type="submit" 
            className={`nin-button ${loading ? 'loading' : ''}`} 
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit NIN'}
          </button>
        </form>
      </div>
    </div>
  );
            }

