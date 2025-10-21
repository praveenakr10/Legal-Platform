import React, { useState } from 'react';
import axios from 'axios';
import './Feedback.css';

function Feedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem('token');

  // Don't render the component if the user is not logged in
  if (!token) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please enter your feedback before sending.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post('/feedback', { message }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Thank you for your feedback!");
      setMessage('');
      setIsOpen(false);
    } catch (err) {
      alert("Failed to send feedback. Please try again later.");
    }
    setSubmitting(false);
  };

  return (
    <>
      <button className="feedback-fab" onClick={() => setIsOpen(true)}>
        ?
      </button>

      {isOpen && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal-content">
            <button className="feedback-modal-close" onClick={() => setIsOpen(false)}>&times;</button>
            <h3>Send Feedback to Admin</h3>
            <p>Have a suggestion, a bug report, or a general comment? Let us know!</p>
            <form onSubmit={handleSubmit}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows="6"
                required
              />
              <button type="submit" className="feedback-submit-btn" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Feedback;