import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClientNavBar from '../../components/ClientNavBar';

function FindLawyers() {
  const [clientName, setClientName] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [lawyers, setLawyers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [requesting, setRequesting] = useState(null); // lawyer id being requested

  const token = localStorage.getItem('token');

  // Get profile for nav bar
  useEffect(() => {
    async function fetchProfile() {
      try {
        const profileRes = await axios.get('/client/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClientName(profileRes.data.name);
      } catch {}
    }
    if (token) fetchProfile();
  }, [token]);

  // Fetch lawyers based on search
  useEffect(() => {
    async function fetchLawyers() {
      try {
        const params = {};
        if (searchName) params.name = searchName;
        if (searchLocation) params.location = searchLocation;
        const response = await axios.get('/lawyers/search', {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        setLawyers(response.data);
      } catch (err) {
        setLawyers([]);
      }
    }
    if (token) fetchLawyers();
  }, [token, searchName, searchLocation]);

  // Request consultation
  async function handleRequestConsultation(lawyerId) {
    setRequesting(lawyerId);
    try {
      await axios.post('/cases', {
        lawyerId,
        details: "Requesting consultation"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Consultation requested!");
    } catch {
      alert("Request failed.");
    }
    setRequesting(null);
  }

  // Helper function to calculate age from date of birth
  function calculateAge(dob) {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  return (
    <div>
      <ClientNavBar clientName={clientName} notifications={notifications} />
      <div style={{ padding: "30px" }}>
        <h2>Find Lawyers</h2>
        <div style={{ marginBottom: "24px", display: "flex", gap: "18px" }}>
          <input
            type="text"
            placeholder="Search by name"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            style={{ fontSize: "16px", padding: "6px 12px", border: "1px solid #bbb", borderRadius: "6px" }}
          />
          <input
            type="text"
            placeholder="Search by location"
            value={searchLocation}
            onChange={e => setSearchLocation(e.target.value)}
            style={{ fontSize: "16px", padding: "6px 12px", border: "1px solid #bbb", borderRadius: "6px" }}
          />
          <button
            onClick={() => { setSearchName(''); setSearchLocation(''); }}
            style={{ background: "#ededed", border: "none", borderRadius: "6px", padding: "7px 12px", marginLeft: "10px" }}
          >
            Clear
          </button>
        </div>
        <div>
          {lawyers.length === 0
            ? <div>No lawyers found.</div>
            : lawyers.map(lawyer => (
                <div key={lawyer._id} style={{
                  background: "#F1F6FC",
                  padding: "18px 23px",
                  borderRadius: "10px",
                  marginBottom: "19px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={lawyer.profilePic || "/logo.png"}
                      height="48"
                      width="48"
                      alt={lawyer.name}
                      style={{ borderRadius: "50%", marginRight: "16px", background: "#fff" }}
                    />
                    <div>
                      <div><b>{lawyer.name}</b> ({lawyer.gender}, {calculateAge(lawyer.dob)})</div>
                      <div>{lawyer.location}</div>
                      <div>
                        Ongoing Cases: {lawyer.ongoingCases ?? 0} |
                        Completed Cases: {lawyer.completedCases ?? 0}
                      </div>
                      <div>
                        Ratings: {"⭐".repeat(Math.round(lawyer.ratings ?? 0))} {lawyer.ratings ?? 'N/A'}
                      </div>
                    </div>
                  </div>
                  <button
                    disabled={requesting === lawyer._id}
                    onClick={() => handleRequestConsultation(lawyer._id)}
                    style={{
                      background: "#1268D3",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "10px 24px",
                      fontSize: "15px",
                      cursor: "pointer"
                    }}>
                    {requesting === lawyer._id ? "Requesting..." : "Request Consultation"}
                  </button>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
}

export default FindLawyers;
