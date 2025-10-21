import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClientNavBar from '../components/ClientNavBar';

function FeedbackReviews() {
  const [clientName, setClientName] = useState('');
  const [notifications, setNotifications] = useState(0);

  const [completedCases, setCompletedCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch client name and completed cases
  useEffect(() => {
    async function fetchData() {
      try {
        const profileRes = await axios.get('/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClientName(profileRes.data.name);

        const casesRes = await axios.get('/cases/client', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const cases = casesRes.data.filter(c => c.status === 'completed');
        setCompletedCases(cases);
      } catch (err) {}
    }
    if (token) fetchData();
  }, [token]);

  // Submit lawyer rating and review
  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!selectedCaseId || rating < 1 || !review.trim()) {
      alert("All fields are required.");
      return;
    }
    setSubmittingReview(true);
    try {
      await axios.post(`/cases/${selectedCaseId}/rate`, {
        rating, review
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Review submitted successfully!");
      setRating(0);
      setReview('');
      setSelectedCaseId('');
    } catch (err) {
      alert("Failed to submit review.");
    }
    setSubmittingReview(false);
  }

  // Submit general feedback (to admin)
  async function handleFeedbackSubmit(e) {
    e.preventDefault();
    if (!feedback.trim()) {
      alert("Feedback message is required.");
      return;
    }
    setSubmittingFeedback(true);
    try {
      await axios.post('/feedback', {
        message: feedback
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Feedback sent!");
      setFeedback('');
    } catch {
      alert("Failed to send feedback.");
    }
    setSubmittingFeedback(false);
  }

  return (
    <div>
      <ClientNavBar clientName={clientName} notifications={notifications} />
      <div style={{ padding: "30px", maxWidth: 700, margin: "0 auto" }}>
        <h2>Review Your Lawyer</h2>
        <form onSubmit={handleReviewSubmit} style={{ marginBottom: "38px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="caseSelect">Select Completed Case:</label>
            <select
              id="caseSelect"
              value={selectedCaseId}
              onChange={e => setSelectedCaseId(e.target.value)}
              style={{ padding: "5px 18px", marginLeft: "14px", fontSize: "16px" }}
            >
              <option value="">-- Choose your case --</option>
              {completedCases.map(c =>
                <option key={c._id} value={c._id}>
                  {c.lawyer?.name} | {c._id}
                </option>
              )}
            </select>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label>Rate your lawyer:</label>
            <span style={{ marginLeft: "14px" }}>
              {[1,2,3,4,5].map(num => (
                <span key={num}
                  style={{
                    cursor: "pointer",
                    color: num <= rating ? "#ffa600" : "#ddd",
                    fontSize: "28px"
                  }}
                  onClick={() => setRating(num)}
                >
                  ★
                </span>
              ))}
            </span>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label>Write your review:</label><br />
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              rows={4}
              style={{ width: "100%", fontSize: "15px", marginTop: "8px", padding: "10px", borderRadius: "6px" }}
              placeholder="Describe your experience..."
            />
          </div>
          <button
            type="submit"
            disabled={submittingReview}
            style={{
              background: "#1268D3", color: "#fff", border: "none", borderRadius: "6px",
              padding: "12px 32px", fontSize: "17px", cursor: "pointer", marginTop: "10px"
            }}
          >
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        <h2>Send General Feedback</h2>
        <form onSubmit={handleFeedbackSubmit}>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            rows={3}
            style={{ width: "100%", fontSize: "15px", marginTop: "8px", padding: "10px", borderRadius: "6px" }}
            placeholder="Send feedback or suggestions to the platform admin"
          />
          <button
            type="submit"
            disabled={submittingFeedback}
            style={{
              background: "#219150", color: "#fff", border: "none", borderRadius: "6px",
              padding: "12px 32px", fontSize: "17px", cursor: "pointer", marginTop: "10px"
            }}
          >
            {submittingFeedback ? "Sending..." : "Send Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FeedbackReviews;
