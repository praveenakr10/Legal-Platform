import React, { useState, useEffect } from "react";
import axios from "axios";
import ClientNavBar from "../components/ClientNavBar";

function Profile() {
  const [clientName, setClientName] = useState("");
  const [notifications, setNotifications] = useState(0);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    dob: "",
    gender: ""
  });
  const [newProfile, setNewProfile] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [cases, setCases] = useState([]);

  const token = localStorage.getItem("token");

  // Load client profile and consultation history
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("/client/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.user;
        setClientName(user.name);

        const formattedProfile = {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          location: user.location || "",
          dob: user.dob ? new Date(user.dob).toLocaleDateString() : "",
          gender: user.gender || "",
        };

        setProfile(formattedProfile);
        setNewProfile(formattedProfile);

        const casesRes = await axios.get("/client/cases", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCases(casesRes.data);
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
      // PATCH request to update only editable fields
      await axios.patch(
        "/client/profile",
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
      console.log("Profile updated to:", { ...profile, ...newProfile });
      setEditing(false);
      alert("Profile updated.");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    }
  }

  return (
    <div>
      <ClientNavBar clientName={clientName} notifications={notifications} />
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
                onChange={(e) => {
                  console.log("Name changed to:", e.target.value);
                  setNewProfile({ ...newProfile, name: e.target.value });
                }}
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
          {/* Phone */}
          <div style={{ marginBottom: "16px" }}>
            <label>Phone: </label>
            {editing ? (
              <input
                type="text"
                value={newProfile.phone}
                onChange={(e) =>
                  setNewProfile({ ...newProfile, phone: e.target.value })
                }
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
                onChange={(e) => {
                  console.log("Location changed to:", e.target.value);
                  setNewProfile({ ...newProfile, location: e.target.value });
                }}
                style={{ marginLeft: 10, padding: "6px" }}
              />
            ) : (
              <span style={{ marginLeft: 10 }}>{profile.location}</span>
            )}
          </div>

          {/* DOB */}
          <div style={{ marginBottom: "16px" }}>
            <label>DOB: </label>
            <span style={{ marginLeft: 10 }}>{profile.dob}</span>
          </div>

          {/* Gender */}
          <div style={{ marginBottom: "16px" }}>
            <label>Gender: </label>
            <span style={{ marginLeft: 10 }}>{profile.gender}</span>
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
                    console.log("Cancel button clicked, setting editing to false");
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
                  console.log("Edit button clicked, setting editing to true");
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

        {/* Consultation History */}
        <h2 style={{ marginTop: "32px" }}>Consultation History</h2>
        <table
          style={{
            width: "100%",
            background: "#F8FAFB",
            marginTop: "15px",
            borderCollapse: "collapse",
          }}
        >
          <thead style={{ background: "#E7F0FB" }}>
            <tr>
              <th style={{ padding: "10px" }}>Lawyer</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {cases.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No consultation history.
                </td>
              </tr>
            )}
            {cases.map((c) => (
              <tr key={c._id}>
                <td style={{ padding: "10px" }}>{c.lawyer?.name}</td>
                <td>{c.status}</td>
                <td>{new Date(c.updatedAt).toLocaleString()}</td>
                <td>
                  <a href={`/cases/${c._id}`} style={{ color: "#1268D3" }}>
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Profile;
