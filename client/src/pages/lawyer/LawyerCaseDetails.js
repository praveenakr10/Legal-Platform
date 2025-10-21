import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LawyerNavBar from '../../components/LawyerNavBar';
import './LawyerCaseDetails.css'; // Import the new CSS file

function LawyerCaseDetails() {
  const { id } = useParams(); // gets case ID from url like /lawyer/cases/:id
  const navigate = useNavigate();
  const [lawyerName, setLawyerName] = useState('');
  const [notifications, setNotifications] = useState(0);

  const [caseData, setCaseData] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [editingProgress, setEditingProgress] = useState(false);

  // State for meetings
  const [showAddMeetingForm, setShowAddMeetingForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    platform: '', date: '', link: '', agenda: ''
  });
  const [submittingMeeting, setSubmittingMeeting] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [editingMeetingData, setEditingMeetingData] = useState(null);

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
        // Fetch lawyer profile for name
        const profileRes = await axios.get('/lawyer/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLawyerName(profileRes.data.name);

        // Fetch case details
        const caseRes = await axios.get(`/cases/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCaseData(caseRes.data);
        setProgress(caseRes.data.progress || '');

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

  // Handle progress update
  async function handleUpdateProgress() {
    try {
      await axios.put(`/lawyer/cases/${id}/update`, { progress }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCaseData(prev => ({ ...prev, progress }));
      setEditingProgress(false);
      alert('Progress updated successfully.');
    } catch (err) {
      alert('Failed to update progress.');
    }
  }

  // Handle close case
  async function handleCloseCase() {
    if (!window.confirm('Are you sure you want to close this case?')) return;
    try {
      await axios.put(`/lawyer/cases/${id}/update`, { status: 'completed' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCaseData(prev => ({ ...prev, status: 'completed' }));
      // Refresh meetings after closing case
      await fetchMeetings();
      alert('Case closed successfully.');
    } catch (err) {
      alert('Failed to close case.');
    }
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
      const res = await axios.post(`/lawyer/cases/${id}/meeting`, newMeeting, {
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

  if (loading) return <div>Loading...</div>;
  if (!caseData) return <div>Case not found</div>;

  return (
    <div>
      <LawyerNavBar lawyerName={lawyerName} notifications={notifications} />
      <div className="case-details-page">
        <h2>Case Details</h2>
        <div className="case-summary-card">
          <div className="summary-item"><b>Client:</b> {caseData.client.name} ({caseData.client.email})</div>
          <div className="summary-item"><b>Status:</b> {caseData.status}</div>
          <div className="summary-item"><b>Progress Update:</b> {caseData.progress || "No update yet"}</div>
          <div className="summary-item"><b>Last Updated:</b> {new Date(caseData.updatedAt).toLocaleString()}</div>
        </div>

        {/* Timeline Section */}
        <div className="case-section-card">
          <h3>📜 Case Timeline</h3>
          {editingProgress ? (
            <div className="progress-edit-form">
              <textarea
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
              />
              <button className="save-btn" onClick={handleUpdateProgress}>Save</button>
              <button className="cancel-btn" onClick={() => setEditingProgress(false)}>Cancel</button>
            </div>
          ) : (
            <div>
              <div>{caseData.progress || "No progress updates yet."}</div>
              {caseData.status === 'ongoing' && (
                <button className="edit-progress-btn" onClick={() => setEditingProgress(true)}>Edit Progress</button>
              )}
            </div>
          )}
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
                <label>Platform (e.g., Google Meet)</label>
                <input name="platform" type="text" value={newMeeting.platform} onChange={handleMeetingInputChange} required />
              </div>
              <div className="form-group">
                <label>Date and Time</label>
                <input name="date" type="datetime-local" value={newMeeting.date} onChange={handleMeetingInputChange} required />
              </div>
              <div className="form-group full-width">
                <label>Meeting Link</label>
                <input name="link" type="url" value={newMeeting.link} onChange={handleMeetingInputChange} required />
              </div>
              <div className="form-group full-width">
                <label>Agenda (Optional)</label>
                <textarea name="agenda" rows="2" value={newMeeting.agenda} onChange={handleMeetingInputChange}></textarea>
              </div>
              <div className="full-width">
                <button type="submit" className="upload-button" disabled={submittingMeeting}>
                  {submittingMeeting ? 'Scheduling...' : 'Schedule Meeting'}
                </button>
                <button type="button" onClick={() => setShowAddMeetingForm(false)} className="upload-button" style={{ marginLeft: '10px', background: '#777' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <ul className="item-list">
            {meetings.length > 0 ? (
              meetings.map(m => (
                <li key={m._id}>
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
                        <button onClick={() => setEditingMeetingId(null)} className="upload-button" style={{ marginLeft: '10px', background: '#777' }}>
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

        {caseData.status === 'ongoing' && (
          <div className="close-case-container">
            <button className="close-case-btn" onClick={handleCloseCase}>
              Close Case
            </button>
          </div>
        )}

        {/* Chat shortcut */}
        <div className="chat-button-container">
          <button className="chat-button" onClick={() => navigate(`/chat?case=${caseData._id}`)}>
            Open Chat with Client
          </button>
        </div>
      </div>
    </div>
  );
}

export default LawyerCaseDetails;
