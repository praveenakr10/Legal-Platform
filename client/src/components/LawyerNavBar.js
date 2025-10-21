import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Feedback from './Feedback';

function LawyerNavBar({ lawyerName, notifications }) {
  const navigate = useNavigate();
  const [approved, setApproved] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch lawyer profile to check approval status
    async function fetchProfile() {
      try {
        const res = await axios.get('/lawyer/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApproved(res.data.approved);
      } catch (err) {
        console.error("Error fetching lawyer profile", err);
      }
    }
    if (token) fetchProfile();
  }, [token]);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login'); // Go to login after logout
  }

  return (
    <>
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#1268D3",
        padding: "8px 30px",
        color: "#fff"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Put your logo file in public/logo.png */}
          <img src="/logo.png" alt="Platform Logo" height="70" style={{ marginRight: 45 }} />
          <span style={{ fontSize: 20, fontWeight: 600 }}>{lawyerName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          <Link to="/lawyer/dashboard" style={{ color: "#fff", textDecoration: "none" }}>Dashboard & Verification</Link>
          {approved ? (
            <>
              <Link to="/lawyer/consultations" style={{ color: "#fff", textDecoration: "none" }}>Consultation Requests</Link>
              <Link to="/lawyer/cases" style={{ color: "#fff", textDecoration: "none" }}>Case Management</Link>
              <Link to="/lawyer/chat" style={{ color: "#fff", textDecoration: "none" }}>Client Communication</Link>
              <Link to="/lawyer/feedback" style={{ color: "#fff", textDecoration: "none" }}>Feedback & Ratings</Link>
              <Link to="/lawyer/profile" style={{ color: "#fff", textDecoration: "none" }}>Profile</Link>
            </>
          ) : (
            <>
              <span style={{ color: "#ccc" }}>Consultation Requests (Pending Approval)</span>
              <span style={{ color: "#ccc" }}>Case Management (Pending Approval)</span>
              <span style={{ color: "#ccc" }}>Client Communication (Pending Approval)</span>
              <span style={{ color: "#ccc" }}>Feedback & Ratings (Pending Approval)</span>
              <span style={{ color: "#ccc" }}>Profile (Pending Approval)</span>
            </>
          )}
          <span style={{ position: "relative", cursor: "pointer" }}>
            <span style={{ fontSize: 25 }} role="img" aria-label="Notification">&#128276;</span>
            {notifications > 0 &&
              <span style={{
                position: "absolute", top: -5, right: -8,
                background: "red", borderRadius: "50%", color: "#fff",
                padding: "2px 7px", fontSize: "12px"
              }}>{notifications}</span>
            }
          </span>
          <button onClick={handleLogout} style={{
            background: "#fff", color: "#1268D3",
            border: "none", borderRadius: 4, padding: "4px 12px", cursor: "pointer"
          }}>Logout</button>
        </div>
      </nav>
      <Feedback />
    </>
  );
}

export default LawyerNavBar;
