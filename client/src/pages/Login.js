import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuthForm.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/login", form);
      localStorage.setItem("token", res.data.token);
      const role = res.data.user.role;
      if (role === 'lawyer') {
        window.location.href = "/lawyer/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input name="password" type="password" placeholder="Password" required value={form.password} onChange={handleChange} />
          </div>
          <button className="auth-btn" type="submit">Login</button>
        </form>
        {error && <div className="auth-error">{error}</div>}
        <p className="auth-link">Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
