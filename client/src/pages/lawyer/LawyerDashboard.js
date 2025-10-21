import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LawyerNavBar from '../../components/LawyerNavBar';

function LawyerDashboard() {
  const [lawyerName, setLawyerName] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [incomingRequests, setIncomingRequests] = useState(0);
  const [ongoingCases, setOngoingCases] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('Pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [certificates, setCertificates] = useState({ idProof: null, qualifications: null, barCouncil: null, experience: null });

  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch lawyer profile
        const profileRes = await axios.get('/lawyer/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLawyerName(profileRes.data.name);
        setVerificationStatus(profileRes.data.approved ? 'Approved' : 'Pending');
        if (profileRes.data.approved === false && profileRes.data.rejectionReason) {
          setVerificationStatus('Rejected');
        }
        if (!profileRes.data.approved && profileRes.data.rejectionReason) {
          setRejectionReason(profileRes.data.rejectionReason);
        }

        // Fetch incoming requests
        const requestsRes = await axios.get('/cases?status=pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIncomingRequests(requestsRes.data.length);

        // Fetch ongoing cases
        const casesRes = await axios.get('/cases?status=ongoing', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOngoingCases(casesRes.data.length);

        // Fetch unread notifications (messages, requests)
        let unreadCount = 0;
        // Add logic for unread messages from cases
        for (const c of casesRes.data) {
          const messagesRes = await axios.get(`/messages/${c._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          unreadCount += messagesRes.data.filter(m => !m.read && m.sender.role === 'client').length;
        }
        setNotifications(unreadCount);

      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    }

    if (token) fetchData();
  }, [token]);

  const handleFileChange = (e, type) => {
    setCertificates({ ...certificates, [type]: e.target.files[0] });
  };

  const handleUpload = async () => {
    const formData = new FormData();
    if (certificates.idProof) formData.append('idProof', certificates.idProof);
    if (certificates.qualifications) formData.append('qualifications', certificates.qualifications);
    if (certificates.barCouncil) formData.append('barCouncil', certificates.barCouncil);
    if (certificates.experience) formData.append('experience', certificates.experience);

    try {
      await axios.post('/lawyer/certificates/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      alert('Certificates uploaded successfully. Awaiting admin approval.');
    } catch (err) {
      console.error("Error uploading certificates", err);
    }
  };

  return (
    <div>
      <LawyerNavBar lawyerName={lawyerName} notifications={notifications} />
      <div style={{ padding: "30px" }}>
        <h1>Welcome back, {lawyerName} 👋</h1>
        <div style={{ marginTop: "30px" }}>
          <h2>Verification Status: {verificationStatus}</h2>
          {verificationStatus === 'Rejected' && rejectionReason && (
            <p>Reason: {rejectionReason}</p>
          )}
          {verificationStatus === 'Pending' && (
            <div>
              <h3>Upload Certificates for Verification</h3>
              <input type="file" onChange={(e) => handleFileChange(e, 'idProof')} placeholder="ID Proof" />
              <input type="file" onChange={(e) => handleFileChange(e, 'qualifications')} placeholder="Educational Qualifications" />
              <input type="file" onChange={(e) => handleFileChange(e, 'barCouncil')} placeholder="Bar Council Registration" />
              <input type="file" onChange={(e) => handleFileChange(e, 'experience')} placeholder="Professional Experience Details" />
              <button onClick={handleUpload}>Upload</button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "30px", marginTop: "30px" }}>
          <Link to="/lawyer/consultations" style={{ textDecoration: 'none' }}>
            <div style={{
              background: "#F1F6FC",
              padding: "22px 30px",
              borderRadius: "12px",
              fontSize: "18px",
              minWidth: "170px",
              cursor: "pointer"
            }}>
              Consultation Requests: {incomingRequests}
            </div>
          </Link>
          <Link to="/lawyer/cases" style={{ textDecoration: 'none' }}>
            <div style={{
              background: "#F1F6FC",
              padding: "22px 30px",
              borderRadius: "12px",
              fontSize: "18px",
              minWidth: "170px",
              cursor: "pointer"
            }}>
              Ongoing Cases: {ongoingCases}
            </div>
          </Link>
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

export default LawyerDashboard;
