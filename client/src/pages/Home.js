import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <h1>Online Legal Advice and Case Navigator</h1>
        <p>Connect with experienced lawyers and manage your case securely and easily.</p>
        <div className="hero-buttons">
          <Link to="/register" className="btn">Get Started</Link>
          <Link to="/login" className="btn btn-secondary">Login</Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Expert Lawyers</h3>
            <p>Connect with verified and experienced legal professionals tailored to your needs.</p>
          </div>
          <div className="feature-card">
            <h3>Case Management</h3>
            <p>Easily upload documents, track case progress, and manage all your legal matters in one place.</p>
          </div>
          <div className="feature-card">
            <h3>Secure Communication</h3>
            <p>Communicate securely with your lawyer through our encrypted chat system.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Register and Verify</h4>
              <p>Create your account and verify your email to get started.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Access Your Dashboard</h4>
              <p>Login to your personalized dashboard to manage cases and consultations.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Get Connected</h4>
              <p>Book consultations, upload case details, and connect with lawyers instantly.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
