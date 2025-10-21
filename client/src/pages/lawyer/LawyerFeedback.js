import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LawyerNavBar from '../../components/LawyerNavBar';

function LawyerFeedback() {
  const [lawyerName, setLawyerName] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [adminFeedback, setAdminFeedback] = useState({ subject: '', message: '' });
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

        // Fetch client feedbacks/ratings
        const feedbacksRes = await axios.get('/lawyer/feedback', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFeedbacks(feedbacksRes.data);

        setNotifications(0); // Placeholder
        setLoading(false);
      } catch (err) {
        console.error("Error fetching feedback data", err);
        setLoading(false);
      }
    }

    if (token) fetchData();
  }, [token]);

  const handleSubmitAdminFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/feedback/admin', adminFeedback, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Feedback submitted to admin.');
      setAdminFeedback({ subject: '', message: '' });
    } catch (err) {
      console.error("Error submitting feedback", err);
      alert('Error submitting feedback.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <LawyerNavBar lawyerName={lawyerName} notifications={notifications} />
      <div style={{ padding: "30px" }}>
        <h1>Feedback & Ratings</h1>

        <h2>Client Ratings & Reviews</h2>
        {feedbacks.length === 0 ? (
          <p>No feedbacks yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {feedbacks.map((fb) => (
              <div key={fb._id} style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
                <p><strong>Client:</strong> {fb.client.name}</p>
                <p><strong>Rating:</strong> {fb.review.rating}/5</p>
                <p><strong>Review:</strong> {fb.review.review}</p>
                <p><strong>Date:</strong> {new Date(fb.review.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        <h2>Provide Feedback to Admin</h2>
        <form onSubmit={handleSubmitAdminFeedback} style={{ marginTop: "20px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label>Subject:</label>
            <input
              type="text"
              value={adminFeedback.subject}
              onChange={(e) => setAdminFeedback({ ...adminFeedback, subject: e.target.value })}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Message:</label>
            <textarea
              value={adminFeedback.message}
              onChange={(e) => setAdminFeedback({ ...adminFeedback, message: e.target.value })}
              required
              style={{ width: "100%", height: "100px", padding: "8px" }}
            />
          </div>
          <button type="submit" style={{ padding: "10px 20px", background: "#1268D3", color: "white", border: "none", borderRadius: "4px" }}>
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}

export default LawyerFeedback;
