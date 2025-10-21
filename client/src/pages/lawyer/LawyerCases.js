import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LawyerNavBar from '../../components/LawyerNavBar';
import { Link } from 'react-router-dom';

function LawyerCases() {
  const [cases, setCases] = useState([]);
  const [lawyerName, setLawyerName] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch lawyer profile
        const profileRes = await axios.get('/lawyer/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLawyerName(profileRes.data.name);

        // Fetch cases by status (ongoing and completed)
        const ongoingRes = await axios.get('/lawyer/cases?status=ongoing', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const completedRes = await axios.get('/lawyer/cases?status=completed', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const allCases = [...ongoingRes.data, ...completedRes.data];
        setCases(allCases);

        // Fetch notifications
        setNotifications(0); // Placeholder

        setLoading(false);
      } catch (err) {
        console.error("Error fetching cases", err);
        setLoading(false);
      }
    }

    if (token) fetchData();
  }, [token]);

  if (loading) return <div>Loading...</div>;

  const filteredCases = cases.filter(c => c.status === activeTab);

  return (
    <div>
      <LawyerNavBar lawyerName={lawyerName} notifications={notifications} />
      <div style={{ padding: "30px" }}>
        <h1>Case Management</h1>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button onClick={() => setActiveTab('ongoing')} style={{ background: activeTab === 'ongoing' ? '#1268D3' : '#f0f0f0', color: activeTab === 'ongoing' ? 'white' : 'black' }}>Ongoing</button>
          <button onClick={() => setActiveTab('completed')} style={{ background: activeTab === 'completed' ? '#1268D3' : '#f0f0f0', color: activeTab === 'completed' ? 'white' : 'black' }}>Completed</button>
        </div>

        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#F8FAFB",
          marginTop: "25px"
        }}>
          <thead>
            <tr style={{ background: "#E7F0FB" }}>
              <th style={{ padding: "12px" }}>Client</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Progress</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map(c => (
              <tr key={c._id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "12px" }}>
                  {c.client.name} ({c.client.email})
                </td>
                <td>{c.status}</td>
                <td>{new Date(c.updatedAt).toLocaleString()}</td>
                <td>{c.progress ? c.progress : "No update yet"}</td>
                <td>
                  <Link to={`/lawyer/cases/${c._id}`}>
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
            {filteredCases.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: "22px", textAlign: "center" }}>
                  No cases in {activeTab} status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LawyerCases;
