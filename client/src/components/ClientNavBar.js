import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Feedback from './Feedback';

function ClientNavBar({ clientName, notifications }) {
  const navigate = useNavigate();

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
          <span style={{ fontSize: 20, fontWeight: 600 }}>{clientName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none" }}>Dashboard</Link>
          <Link to="/cases" style={{ color: "#fff", textDecoration: "none" }}>My Cases</Link>
          <Link to="/find-lawyers" style={{ color: "#fff", textDecoration: "none" }}>Find Lawyers</Link>
          <Link to="/chat" style={{ color: "#fff", textDecoration: "none" }}>Chat</Link>
          <Link to="/profile" style={{ color: "#fff", textDecoration: "none" }}>Profile</Link>
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

export default ClientNavBar;
