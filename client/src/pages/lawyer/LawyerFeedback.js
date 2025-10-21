import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LawyerNavBar from '../../components/LawyerNavBar';
import './LawyerFeedback.css';

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

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'filled' : 'empty'}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) return <div className="feedback-page"><div>Loading...</div></div>;

  return (
    <div>
      <LawyerNavBar lawyerName={lawyerName} notifications={notifications} />
      <div className="feedback-page">
        <div className="feedback-header">
          <h1>Feedback & Ratings</h1>
          <p>View client reviews and provide feedback to administrators</p>
        </div>

        <div className="feedback-section">
          <h2>Client Ratings & Reviews</h2>
          {feedbacks.length === 0 ? (
            <div className="no-feedback">
              <p>No feedbacks yet.</p>
            </div>
          ) : (
            <div className="feedback-list">
              {feedbacks.map((fb) => (
                <div key={fb._id} className="feedback-item">
                  <h3>{fb.client?.name || 'Anonymous Client'}</h3>
                  <div className="feedback-rating">
                    <div className="rating-stars">
                      {renderStars(fb.review?.rating || 0)}
                    </div>
                    <span className="rating-number">{fb.review?.rating || 0}/5</span>
                  </div>
                  <div className="feedback-text">
                    {fb.review?.review || 'No review provided'}
                  </div>
                  <div className="feedback-date">
                    {fb.review?.createdAt ? new Date(fb.review.createdAt).toLocaleDateString() : 'Date not available'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="feedback-section">
          <h2>Provide Feedback to Admin</h2>
          <form onSubmit={handleSubmitAdminFeedback} className="feedback-form">
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                value={adminFeedback.subject}
                onChange={(e) => setAdminFeedback({ ...adminFeedback, subject: e.target.value })}
                required
                placeholder="Enter feedback subject"
              />
            </div>
            <div className="form-group">
              <label>Message:</label>
              <textarea
                value={adminFeedback.message}
                onChange={(e) => setAdminFeedback({ ...adminFeedback, message: e.target.value })}
                required
                placeholder="Enter your feedback message"
              />
            </div>
            <button type="submit" className="submit-btn">
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LawyerFeedback;
