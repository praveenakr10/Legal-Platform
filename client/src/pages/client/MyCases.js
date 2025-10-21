import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClientNavBar from '../../components/ClientNavBar';
import { Link } from 'react-router-dom';

function MyCases() {
  const [clientName, setClientName] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [cases, setCases] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch profile for name
        const profileRes = await axios.get('/client/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClientName(profileRes.data.name);

        // Fetch all the client's cases
        const casesRes = await axios.get('/client/cases', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCases(casesRes.data);

        // Count unread messages for notifications
        let unreadCount = 0;
        for (const c of casesRes.data) {
          const messagesRes = await axios.get(`/messages/${c._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          unreadCount += messagesRes.data.filter(m => !m.read && m.sender.role !== 'client').length;
        }
        setNotifications(unreadCount);

      } catch (err) {
        console.error("Error fetching cases or notifications", err);
      }
    }

    if (token) fetchData();
  }, [token]);

  return (
    <div>
      <ClientNavBar clientName={clientName} notifications={notifications} />
      <div style={{ padding: "30px" }}>
        <h2>My Cases</h2>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#F8FAFB",
          marginTop: "25px"
        }}>
          <thead>
            <tr style={{ background: "#E7F0FB" }}>
              <th style={{ padding: "12px" }}>Lawyer</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Progress</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {cases.map(c => (
              <tr key={c._id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "12px" }}>
                  {c.lawyer.name}
                </td>
                <td>{c.status}</td>
                <td>{new Date(c.updatedAt).toLocaleString()}</td>
                <td>{c.progress ? c.progress : "No update yet"}</td>
                <td>
                  <Link to={`/cases/${c._id}`}>
                    <button style={{
                      background: "#1268D3", color: "#fff", border: "none",
                      borderRadius: "4px", padding: "6px 14px", cursor: "pointer"
                    }}>
                      View Details
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
            {cases.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: "22px", textAlign: "center" }}>
                  No cases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MyCases;
