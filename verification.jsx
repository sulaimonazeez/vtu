import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      const response = await axios.post('/api/submit-nin', { nin }, {
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 rounded-2xl shadow-xl bg-white">
        <h2 className="text-2xl font-bold mb-4">Submit Your NIN</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Enter your NIN" 
            value={nin} 
            onChange={(e) => setNin(e.target.value)} 
            className="w-full p-3 border rounded-md"
            required
          />
          <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-md" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit NIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
