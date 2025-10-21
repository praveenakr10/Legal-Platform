import React, { useState, useEffect } from "react";
import axios from "axios";
import LawyerNavBar from "../../components/LawyerNavBar";

function LawyerProfile() {
  const [lawyerName, setLawyerName] = useState("");
  const [notifications, setNotifications] = useState(0);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    certificates: []
  });
  const [newProfile, setNewProfile] = useState(profile);
  const [editing, setEditing] = useState(false);

  const token = localStorage.getItem("token");

  // Load lawyer profile
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("/lawyer/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data;
        setLawyerName(user.name);

        const formattedProfile = {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          location: user.location || "",
          certificates: user.certificates || []
        };

        setProfile(formattedProfile);
        setNewProfile(formattedProfile);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    }
    if (token) fetchData();
  }, [token]);

  // Update profile info
  async function handleSaveProfile(e) {
    e.preventDefault();
    try {
      await axios.patch(
        "/lawyer/profile",
        {
          name: newProfile.name,
          phone: newProfile.phone,
          location: newProfile.location,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProfile({ ...profile, ...newProfile });
      setEditing(false);
      alert("Profile updated.");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    }
  }

  return (
    <div>
      <LawyerNavBar lawyerName={lawyerName} notifications={notifications} />
      <div style={{ padding: "30px", maxWidth: 700, margin: "0 auto" }}>
        <h2>My Profile</h2>
        <form
          onSubmit={handleSaveProfile}
          style={{
            background: "#F8FAFB",
            borderRadius: "12px",
            padding: "24px 32px",
          }}
        >
          {/* Name */}
          <div style={{ marginBottom: "16px" }}>
            <label>Name: </label>
            {editing ? (
              <input
                type="text"
                value={newProfile.name}
                onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                style={{ marginLeft: 10, padding: "6px" }}
              />
            ) : (
              <span style={{ marginLeft: 10 }}>{profile.name}</span>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label>Email: </label>
            <span style={{ marginLeft: 10 }}>{profile.email}</span>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: "16px" }}>
            <label>Phone: </label>
            {editing ? (
              <input
                type="text"
                value={newProfile.phone}
                onChange={(e) => setNewProfile({ ...newProfile, phone: e.target.value })}
                style={{ marginLeft: 10, padding: "6px" }}
              />
            ) : (
              <span style={{ marginLeft: 10 }}>{profile.phone}</span>
            )}
          </div>

          {/* Location */}
          <div style={{ marginBottom: "16px" }}>
            <label>Location: </label>
            {editing ? (
              <input
                type="text"
                value={newProfile.location}
                onChange={(e) => setNewProfile({ ...newProfile, location: e.target.value })}
                style={{ marginLeft: 10, padding: "6px" }}
              />
            ) : (
              <span style={{ marginLeft: 10 }}>{profile.location}</span>
            )}
          </div>

          {/* Verification Certificates */}
          <div style={{ marginBottom: "16px" }}>
            <label>Verification Certificates: </label>
            {profile.certificates.length > 0 ? (
              <ul style={{ marginLeft: 10 }}>
                {profile.certificates.map((cert, index) => (
                  <li key={index}>
                    <a href={cert.filePath} target="_blank" rel="noopener noreferrer">
                      {cert.type}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <span style={{ marginLeft: 10 }}>No certificates uploaded.</span>
            )}
          </div>

          {/* Buttons */}
          <div>
            {editing ? (
              <>
                <button
                  type="submit"
                  style={{
                    background: "#1268D3",
                    color: "#fff",
                    padding: "8px 18px",
                    border: "none",
                    borderRadius: "5px",
                    marginRight: "12px",
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewProfile(profile);
                    setEditing(false);
                  }}
                  style={{
                    padding: "8px 18px",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setEditing(true);
                }}
                style={{
                  background: "#219150",
                  color: "#fff",
                  padding: "8px 18px",
                  border: "none",
                  borderRadius: "5px",
                  marginRight: "12px",
                }}
              >
                Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default LawyerProfile;
