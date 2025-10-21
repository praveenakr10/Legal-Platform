import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClientNavBar from '../../components/ClientNavBar';
import './CaseDetails.css'; // Import the new CSS file

function CaseDetails() {
  const { id } = useParams(); // gets case ID from url like /cases/:id
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [notifications, setNotifications] = useState(0);

  const [caseData, setCaseData] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  // State for meetings
  const [showAddMeetingForm, setShowAddMeetingForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    platform: '', date: '', link: '', agenda: ''
  });
  const [submittingMeeting, setSubmittingMeeting] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [editingMeetingData, setEditingMeetingData] = useState(null);

  // State for reviews
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(false);



  const token = localStorage.getItem('token');

  const fetchMeetings = async () => {
    try {
      const meetingsRes = await axios.get(`/cases/${id}/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(meetingsRes.data);
    } catch (err) {
      console.error("Error fetching meetings", err);
    }
  };

  useEffect(() => {
    async function fetchAllCaseDetails() {
      try {
        // Fetch client profile for name
        const profileRes = await axios.get('/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClientName(profileRes.data.name);

        // Fetch unread notifications
        // You can use a similar loop as before, or pass down notifications from parent

        // Fetch case details
        const caseRes = await axios.get(`/cases/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCaseData(caseRes.data);

        // Get meetings for this case
        await fetchMeetings();

        setLoading(false);
      } catch (err) {
        console.error("Error fetching case details", err);
        setLoading(false);
      }
    }

    if (token) fetchAllCaseDetails();
  }, [token, id]);

  // Handle file upload
  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('document', file); // field name must be 'document'

      const res = await axios.post(`/cases/${id}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update caseData with the new list of documents from the server response
      setCaseData(prev => ({ ...prev, documents: res.data.documents }));
      setFile(null); // Reset file input
      document.getElementById('file-input').value = ''; // Clear file input visually
      alert("Document uploaded successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload document.");
    }
    setUploading(false);
  }

  // Handle adding a new meeting
  async function handleAddMeeting(e) {
    e.preventDefault();
    if (!newMeeting.platform || !newMeeting.date || !newMeeting.link) {
      alert("Please fill in Platform, Date, and Link for the meeting.");
      return;
    }
    setSubmittingMeeting(true);
    try {
      const res = await axios.post(`/cases/${id}/meetings`, newMeeting, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(res.data.meetings); // Assuming backend returns the updated case
      setShowAddMeetingForm(false);
      setNewMeeting({ platform: '', date: '', link: '', agenda: '' });
      alert("Meeting scheduled successfully!");
    } catch (err) {
      alert("Failed to schedule meeting.");
    }
    setSubmittingMeeting(false);
  }

  // Handle cancelling a meeting
  async function handleCancelMeeting(meetingId) {
    const reason = window.prompt("Please provide a reason for cancellation (optional):");
    if (reason === null) return; // User clicked cancel on the prompt
    
    try {
      const res = await axios.patch(`/cases/${id}/meetings/${meetingId}`,
        { status: 'cancelled', notes: reason || 'Cancelled without notes.' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update the specific meeting in the state
      setMeetings(meetings.map(m => m._id === meetingId ? res.data : m));
      alert("Meeting cancelled.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel meeting.");
    }
  }

  // Handle marking a meeting as complete
  async function handleCompleteMeeting(meetingId) {
    const notes = window.prompt("Add meeting notes or discussion summary (optional):");
    if (notes === null) return; // User clicked cancel

    try {
      const res = await axios.patch(`/cases/${id}/meetings/${meetingId}`,
        { status: 'completed', notes: notes || 'Completed.' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeetings(meetings.map(m => m._id === meetingId ? res.data : m));
      alert("Meeting marked as completed.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update meeting status.");
    }
  }

  // Handle saving an edited meeting
  async function handleSaveMeeting(meetingId) {
    setSubmittingMeeting(true);
    try {
      const res = await axios.patch(`/cases/${id}/meetings/${meetingId}`, editingMeetingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(meetings.map(m => m._id === meetingId ? res.data : m));
      setEditingMeetingId(null);
      setEditingMeetingData(null);
      alert("Meeting updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update meeting.");
    }
    setSubmittingMeeting(false);
  }

  // Handle submitting a review
  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await axios.post(`/cases/${id}/rate`,
        { rating, review: reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update caseData with the new review details from the server response
      setCaseData(res.data.case);
      alert(editingReview ? "Review updated successfully!" : "Review submitted successfully!");
      setEditingReview(false); // Exit edit mode on success
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review.");
    }
    setSubmittingReview(false);
  }

  const handleMeetingInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeeting(prev => ({ ...prev, [name]: value }));
  };

  const handleEditMeetingInputChange = (e) => {
    const { name, value } = e.target;
    setEditingMeetingData(prev => ({ ...prev, [name]: value }));
  };

  const startEditing = (meeting) => {
    setEditingMeetingId(meeting._id);
    // Format date for datetime-local input
    const localDate = new Date(meeting.date).toISOString().slice(0, 16);
    setEditingMeetingData({ ...meeting, date: localDate });
  };

  const startEditReview = () => {
    setRating(caseData.review.rating);
    setReviewText(caseData.review.review);
    setEditingReview(true);
  };

  if (loading) return <div>Loading...</div>;
  if (!caseData) return <div>Case not found</div>;

  return (
    <div>
      <ClientNavBar clientName={clientName} notifications={notifications} />
      <div className="case-details-page">
        <h2>Case Details</h2>
        <div className="case-summary-card">
          <div className="summary-item"><b>Lawyer:</b> {caseData.lawyer ? <Link to={`/lawyers/${caseData.lawyer._id}`}>{caseData.lawyer.name}</Link> : 'N/A'}</div>
          <div className="summary-item"><b>Status:</b> {caseData.status}</div>
          <div className="summary-item"><b>Progress Update:</b> {caseData.progress || "No update yet"}</div>
          <div className="summary-item"><b>Last Updated:</b> {new Date(caseData.updatedAt).toLocaleString()}</div>
        </div>

        {/* Timeline Section */}
        <div className="case-section-card">
          <h3>📜 Case Timeline</h3>
          <div>{caseData.progress || "No progress updates yet."}</div>
        </div>

        {/* Documents Section */}
        <div className="case-section-card">
          <h3>📄 Documents</h3>
          {caseData.status === 'ongoing' && (
            <form onSubmit={handleUpload} className="document-upload-form">
              <div>
                <label htmlFor="file-input" className="file-input-label">Upload a new document:</label>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={e => setFile(e.target.files[0])}
                  disabled={uploading}
                  style={{ marginLeft: '10px' }}
                />
              </div>
              <button type="submit" className="upload-button" disabled={uploading || !file}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
              {error && <div style={{ color: 'red', marginTop: '10px', flexBasis: '100%' }}>{error}</div>}
            </form>
          )}
          <ul className="item-list">
            {caseData.documents && caseData.documents.length > 0 ? (
              caseData.documents.map((doc, idx) => (
                <li key={idx}>
                  <a href={`/uploads/${doc}`} target="_blank" rel="noopener noreferrer">
                    {doc.split('-').slice(1).join('-')}
                  </a>
                </li>
              ))
            ) : (
              <li className="no-items-message">No documents uploaded.</li>
            )}
          </ul>
        </div>

        {/* Scheduled meetings */}
        <div className="case-section-card">
          <h3>🗓️ Meetings</h3>

          {!showAddMeetingForm && caseData.status === 'ongoing' && (
            <button className="action-button" onClick={() => setShowAddMeetingForm(true)}>
              + Schedule New Meeting
            </button>
          )}

          {showAddMeetingForm && (
            <form onSubmit={handleAddMeeting} className="add-meeting-form">
              <div className="form-group">
                <label htmlFor="platform">Platform (e.g., Google Meet)</label>
                <input id="platform" name="platform" type="text" value={newMeeting.platform} onChange={handleMeetingInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="date">Date and Time</label>
                <input id="date" name="date" type="datetime-local" value={newMeeting.date} onChange={handleMeetingInputChange} required />
              </div>
              <div className="form-group full-width">
                <label htmlFor="link">Meeting Link</label>
                <input id="link" name="link" type="url" value={newMeeting.link} onChange={handleMeetingInputChange} required />
              </div>
              <div className="form-group full-width">
                <label htmlFor="agenda">Agenda (Optional)</label>
                <textarea id="agenda" name="agenda" rows="2" value={newMeeting.agenda} onChange={handleMeetingInputChange}></textarea>
              </div>
              <div className="full-width">
                <button type="submit" className="upload-button" disabled={submittingMeeting}>
                  {submittingMeeting ? 'Scheduling...' : 'Schedule Meeting'}
                </button>
                <button type="button" onClick={() => setShowAddMeetingForm(false)} style={{ marginLeft: '10px', background: '#777' }} className="upload-button">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <ul className="item-list">
          {meetings.length > 0 ? (
            meetings.map(m => (
              <li key={m._id} style={{ display: 'block' }}>
                {editingMeetingId === m._id ? (
                  // EDITING VIEW
                  <div className="add-meeting-form" style={{ marginTop: 0 }}>
                     <div className="form-group">
                        <label>Platform</label>
                        <input name="platform" type="text" value={editingMeetingData.platform} onChange={handleEditMeetingInputChange} required />
                      </div>
                      <div className="form-group">
                        <label>Date and Time</label>
                        <input name="date" type="datetime-local" value={editingMeetingData.date} onChange={handleEditMeetingInputChange} required />
                      </div>
                      <div className="form-group full-width">
                        <label>Meeting Link</label>
                        <input name="link" type="url" value={editingMeetingData.link} onChange={handleEditMeetingInputChange} required />
                      </div>
                      <div className="form-group full-width">
                        <label>Agenda</label>
                        <textarea name="agenda" rows="2" value={editingMeetingData.agenda} onChange={handleEditMeetingInputChange}></textarea>
                      </div>
                      <div className="full-width">
                        <button onClick={() => handleSaveMeeting(m._id)} className="upload-button" disabled={submittingMeeting}>
                          {submittingMeeting ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button onClick={() => setEditingMeetingId(null)} style={{ marginLeft: '10px', background: '#777' }} className="upload-button">
                          Cancel
                        </button>
                      </div>
                  </div>
                ) : (
                  // DISPLAY VIEW
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="meeting-item-details">
                      <b>Date:</b> {new Date(m.date).toLocaleString()}
                      <span className={`meeting-status status-${m.status}`}>{m.status}</span>
                      <br />
                      <b>Platform:</b> {m.platform}<br />
                      <b>Link:</b> <a href={m.link} target="_blank" rel="noopener noreferrer">{m.link}</a><br />
                      {m.agenda && <span><b>Agenda:</b> {m.agenda}<br /></span>}
                      {m.notes && <span><b>Notes:</b> {m.notes}<br /></span>}
                    </div>
                    <div className="meeting-actions">
                      {m.status === 'scheduled' && (
                        <>
                          <button className="btn-complete" onClick={() => handleCompleteMeeting(m._id)}>Mark as Completed</button>
                          <button className="btn-edit" onClick={() => startEditing(m)}>Edit</button>
                          <button className="btn-cancel" onClick={() => handleCancelMeeting(m._id)}>Cancel</button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))
          ) : (
            <li className="no-items-message">No meetings scheduled.</li>
          )}
          </ul>
        </div>

        {/* Review Section - Only for completed cases */}
        {caseData.status === 'completed' && (
          <div className="case-section-card">
            <h3>⭐ Your Review</h3>
            {caseData.review && !editingReview ? (
              // Display submitted review
              <div className="submitted-review">
                <div className="submitted-review-stars">
                  {'★'.repeat(caseData.review.rating)}{'☆'.repeat(5 - caseData.review.rating)}
                </div>
                <p className="submitted-review-text">"{caseData.review.review}"</p>
                <div>
                  <button className="edit-review-button" onClick={startEditReview}>Edit Review</button>
                  <div className="submitted-review-date">
                    Reviewed on {new Date(caseData.review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ) : (
              // Display review form (for new review or editing existing one)
              <form onSubmit={handleReviewSubmit} className="review-form">
                <div className="form-group">
                  <label>Rating</label>
                  <div className="star-rating">
                    {[5, 4, 3, 2, 1].map(star => (
                      <React.Fragment key={star}>
                        <input type="radio" id={`star${star}`} name="rating" value={star} onClick={() => setRating(star)} />
                        <label htmlFor={`star${star}`} style={{ color: star <= rating ? '#f59e0b' : '#d1d5db' }}>&#9733;</label>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="reviewText">Comments</label>
                  <textarea
                    id="reviewText"
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Share your experience with the lawyer..."
                  />
                </div>
                <div>
                  <button type="submit" className="action-button" disabled={submittingReview} style={{ alignSelf: 'flex-start' }}>
                    {submittingReview ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
                  </button>
                  {editingReview && (
                    <button type="button" onClick={() => setEditingReview(false)} style={{ marginLeft: '10px', background: '#777' }} className="upload-button">Cancel</button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* Chat shortcut */}
        <div className="chat-button-container">
          <button className="chat-button" onClick={() => navigate(`/chat?case=${caseData._id}`)}>
            Open Chat with Lawyer
          </button>
        </div>
      </div>
    </div>
  );
}

export default CaseDetails;
