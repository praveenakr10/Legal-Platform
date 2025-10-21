import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClientNavBar from '../../components/ClientNavBar';

function Dashboard() {
  // These state variables will hold values from backend
  const [clientName, setClientName] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [ongoingCases, setOngoingCases] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [completedCases, setCompletedCases] = useState(0);

  // Get auth token after login (assuming you save it in localStorage)
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch client profile (name) and dashboard stats
    async function fetchData() {
      try {
        // Get client profile
        const profileRes = await axios.get('/client/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClientName(profileRes.data.name);

        // Get all cases for the client
        const casesRes = await axios.get('/client/cases', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Count cases for dashboard cards
        const cases = casesRes.data;
        setOngoingCases(cases.filter(c => c.status === 'ongoing').length);
        setPendingRequests(cases.filter(c => c.status === 'pending').length);
        setCompletedCases(cases.filter(c => c.status === 'completed').length);

        // For unread messages: (You might need a separate API, example given)
        let unreadCount = 0;
        for (const c of cases) {
          const messagesRes = await axios.get(`/messages/${c._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          unreadCount += messagesRes.data.filter(m => !m.read && m.sender.role !== 'client').length;
        }
        setNotifications(unreadCount);

      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    }

    if (token) fetchData();
  }, [token]);

  return (
    <div>
      <ClientNavBar clientName={clientName} notifications={notifications} />
      <div style={{ padding: "30px" }}>
        <h1>Welcome back, {clientName} 👋</h1>
        <div style={{ display: "flex", gap: "30px", marginTop: "30px" }}>
          <div style={{
            background: "#F1F6FC",
            padding: "22px 30px",
            borderRadius: "12px",
            fontSize: "18px",
            minWidth: "170px"
          }}>
            Ongoing Cases: {ongoingCases}
          </div>
          <div style={{
            background: "#F1F6FC",
            padding: "22px 30px",
            borderRadius: "12px",
            fontSize: "18px",
            minWidth: "170px"
          }}>
            Pending Requests: {pendingRequests}
          </div>
          <div style={{
            background: "#F1F6FC",
            padding: "22px 30px",
            borderRadius: "12px",
            fontSize: "18px",
            minWidth: "170px"
          }}>
            Completed Cases: {completedCases}
          </div>
          <div style={{
            background: "#F1F6FC",
            padding: "22px 30px",
            borderRadius: "12px",
            fontSize: "18px",
            minWidth: "170px"
          }}>
            Unread Messages: {notifications}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
