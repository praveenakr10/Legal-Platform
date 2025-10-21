import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LawyerNavBar from '../../components/LawyerNavBar';

function Consultations() {
  const [requests, setRequests] = useState([]);
  const [lawyerName, setLawyerName] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch lawyer profile for name
        const profileRes = await axios.get('/lawyer/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLawyerName(profileRes.data.name);

        // Fetch incoming consultation requests (pending cases)
        const requestsRes = await axios.get('/cases?status=pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(requestsRes.data);

        // Fetch notifications (simplified)
        setNotifications(0); // Placeholder; integrate with actual notifications

        setLoading(false);
      } catch (err) {
        console.error("Error fetching consultations data", err);
        setLoading(false);
      }
    }

    if (token) fetchData();
  }, [token]);

  const handleAccept = async (requestId) => {
    try {
      await axios.post(`/lawyer/requests/${requestId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Request accepted! A new case has been created and client notified.');
      // Refresh requests
      const updatedRes = await axios.get('/cases?status=pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(updatedRes.data);
    } catch (err) {
      console.error("Error accepting request", err);
      alert('Error accepting request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post(`/lawyer/requests/${requestId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Request rejected.');
      // Refresh requests
      const updatedRes = await axios.get('/cases?status=pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(updatedRes.data);
    } catch (err) {
      console.error("Error rejecting request", err);
      alert('Error rejecting request');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <LawyerNavBar lawyerName={lawyerName} notifications={notifications} />
      <div style={{ padding: "30px" }}>
        <h1>Consultation Requests</h1>
        {requests.length === 0 ? (
          <p>No incoming requests at the moment.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {requests.map((request) => (
              <div key={request._id} style={{
                border: "1px solid #ddd",
                padding: "20px",
                borderRadius: "8px"
              }}>
                <h3>Client: {request.client?.name || 'Unknown'}</h3>
                <p>Case Summary: {request.progress || 'No summary provided'}</p>
                <p>Requested Time: {new Date(request.createdAt).toLocaleString()}</p>
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => handleAccept(request._id)}
                    style={{
                      background: "#4CAF50",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      marginRight: "10px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(request._id)}
                    style={{
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Consultations;
