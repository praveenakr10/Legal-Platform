import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClientNavBar from '../../components/ClientNavBar';

function DocumentUpload() {
  const [clientName, setClientName] = useState('');
  const [notifications, setNotifications] = useState(0);

  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const token = localStorage.getItem('token');

  // Fetch client name and cases list
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
        setCases(casesRes.data);
      } catch (err) {}
    }
    if (token) fetchData();
  }, [token]);

  // Fetch documents for selected case
  useEffect(() => {
    async function fetchDocuments() {
      if (!selectedCaseId) return;
      try {
        const res = await axios.get(`/cases/${selectedCaseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocuments(res.data.documents || []);
      } catch (err) {
        setDocuments([]);
      }
    }
    fetchDocuments();
  }, [selectedCaseId, token, uploading]);

  // Handle file upload
  async function handleUpload(e) {
    e.preventDefault();
    if (!file || !selectedCaseId) {
      alert("Please select a case and file.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file); // field name 'document'
      await axios.post(`/cases/${selectedCaseId}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Document uploaded!");
      setFile(null);
      setUploading(false);
    } catch (err) {
      alert("Failed to upload document.");
      setUploading(false);
    }
  }

  return (
    <div>
      <ClientNavBar clientName={clientName} notifications={notifications} />
      <div style={{ padding: "30px", maxWidth: 700, margin: "0 auto" }}>
        <h2>Document Upload</h2>
        <div style={{ marginBottom: "18px" }}>
          <label htmlFor="caseSelect" style={{ marginRight: "10px" }}>Select Case:</label>
          <select
            id="caseSelect"
            value={selectedCaseId}
            onChange={e => setSelectedCaseId(e.target.value)}
            style={{ padding: "5px 15px", fontSize: "16px" }}
          >
            <option value="">-- Choose a case --</option>
            {cases.map(c => (
              <option key={c._id} value={c._id}>
                {c.lawyer && c.lawyer.name} | {c.status}
              </option>
            ))}
          </select>
        </div>
        {/* Upload form */}
        {selectedCaseId && (
          <form onSubmit={handleUpload} style={{ marginBottom: "22px" }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={e => setFile(e.target.files[0])}
              style={{ fontSize: "15px", padding: "5px", marginRight: "10px" }}
              disabled={uploading}
            />
            <button
              type="submit"
              style={{
                background: "#1268D3", color: "#fff", border: "none",
                borderRadius: "6px", padding: "9px 18px", fontSize: "15px",
                cursor: "pointer"
              }}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        )}
        {/* List of uploaded documents */}
        <h3>Uploaded Documents</h3>
        <ul>
          {documents.length > 0 ? (
            documents.map((doc, i) => (
              <li key={i} style={{ marginBottom: "8px" }}>
                <a href={`/uploads/${doc}`} target="_blank" rel="noopener noreferrer">{doc}</a>
                {/* Add your review status logic here if your backend provides it */}
                <span style={{ marginLeft: "12px", color: "#219150" }}>Reviewed by lawyer ✓</span>
              </li>
            ))
          ) : <li>No documents uploaded yet.</li>}
        </ul>
      </div>
    </div>
  );
}

export default DocumentUpload;
