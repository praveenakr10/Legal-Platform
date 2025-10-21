import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuthForm.css"; // Import your CSS

export default function Register() {
  const [form, setForm] = useState({
    role: "client",
    name: "",
    email: "",
    phone: "",
    password: "",
    dob: "",
    gender: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await axios.post("/register", form);
      setSuccess("Registered! Please login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Registration failed.");
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <select name="role" required value={form.role} onChange={handleChange}>
              <option value="client">Client</option>
              <option value="lawyer">Lawyer</option>
            </select>
          </div>
          <div className="form-group">
            <input name="name" type="text" placeholder="Name" required value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input name="phone" type="text" placeholder="Phone" required value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input name="password" type="password" placeholder="Password" required value={form.password} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input name="dob" type="date" placeholder="Date of Birth" required value={form.dob} onChange={handleChange} />
          </div>
          <div className="form-group">
            <select name="gender" required value={form.gender} onChange={handleChange}>
              <option value="" disabled>Select Gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <input name="location" type="text" placeholder="Location" value={form.location} onChange={handleChange} />
          </div>
          <button className="auth-btn" type="submit">Register</button>
        </form>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <p className="auth-link">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
