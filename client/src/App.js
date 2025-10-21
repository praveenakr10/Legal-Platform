import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/client/Dashboard";
import MyCases from "./pages/client/MyCases";
import CaseDetails from "./pages/client/CaseDetails";
import FindLawyers from "./pages/client/FindLawyers";
import Chat from "./pages/client/Chat";
import DocumentUpload from "./pages/client/DocumentUpload";
import FeedbackReviews from "./pages/FeedbackReviews";
import Profile from "./pages/Profile";

// Lawyer pages
import LawyerDashboard from "./pages/lawyer/LawyerDashboard";
import Consultations from "./pages/lawyer/Consultations";
import LawyerCases from "./pages/lawyer/LawyerCases";
import LawyerCaseDetails from "./pages/lawyer/LawyerCaseDetails";
import LawyerChat from "./pages/lawyer/LawyerChat";
import LawyerFeedback from "./pages/lawyer/LawyerFeedback";
import LawyerProfile from "./pages/lawyer/LawyerProfile";

// Function to get user role from token
function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    // Decode JWT (handle base64url)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload.role;
  } catch (err) {
    return null;
  }
}

// Wrap all routes in <Router>
function App() {
  const role = getUserRole();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Client routes - redirect if not client */}
        {role === 'client' ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cases" element={<MyCases />} />
            <Route path="/cases/:id" element={<CaseDetails />} />
            <Route path="/find-lawyers" element={<FindLawyers />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/documents" element={<DocumentUpload />} />
            <Route path="/reviews" element={<FeedbackReviews />} />
            <Route path="/profile" element={<Profile />} />
          </>
        ) : (
          <Route path="/dashboard" element={<Navigate to="/" />} />
        )}

        {/* Lawyer routes - redirect if not lawyer */}
        {role === 'lawyer' ? (
          <>
            <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
            <Route path="/lawyer/consultations" element={<Consultations />} />
            <Route path="/lawyer/cases" element={<LawyerCases />} />
            <Route path="/lawyer/cases/:id" element={<LawyerCaseDetails />} />
            <Route path="/lawyer/chat" element={<LawyerChat />} />
            <Route path="/lawyer/feedback" element={<LawyerFeedback />} />
            <Route path="/lawyer/profile" element={<LawyerProfile />} />
          </>
        ) : (
          <Route path="/lawyer/*" element={<Navigate to="/" />} />
        )}

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
