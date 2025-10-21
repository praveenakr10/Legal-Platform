import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import LawyerNavBar from '../../components/LawyerNavBar';
import '../client/Chat.css'; // Reuse CSS

function LawyerChat() {
  const [lawyerName, setLawyerName] = useState('');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(0);

  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('token');

  // Get lawyer info and list cases on mount
  useEffect(() => {
    async function fetchLawyerAndCases() {
      try {
        const profileRes = await axios.get('/lawyer/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLawyerName(profileRes.data.name);
        setUser(profileRes.data);

        const casesRes = await axios.get('/lawyer/cases', { // Changed endpoint from /lawyer/cases to /cases
          headers: { Authorization: `Bearer ${token}` }
        });
        setCases(casesRes.data);

        // Check for case ID from URL and select it
        const caseIdFromUrl = searchParams.get('case');
        if (caseIdFromUrl && casesRes.data.some(c => c._id === caseIdFromUrl)) {
          setSelectedCaseId(caseIdFromUrl);
        }
      } catch (err) {
        console.error("Error fetching lawyer data", err);
      }
    }
    if (token) fetchLawyerAndCases();
  }, [token]);

  // When a case is selected, load its messages
  useEffect(() => {
    async function fetchMessages() {
      if (!selectedCaseId) return;
      try {
        const res = await axios.get(`/messages/${selectedCaseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        setMessages([]);
      }
    }
    fetchMessages();
  }, [selectedCaseId, token]);

  // Auto-scroll to the bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message handler
  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCaseId) return;
    setSending(true);
    try {
      await axios.post(`/messages/${selectedCaseId}/send`, {
        text: newMessage,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Optimistic UI update
      const tempMessage = {
        _id: Date.now(),
        text: newMessage,
        sender: { _id: user._id, name: user.name, role: 'lawyer' },
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

    } catch (err) {
      alert("Failed to send message.");
    }
    setSending(false);
  }

  return (
    <div>
      <LawyerNavBar lawyerName={lawyerName} notifications={notifications} />
      <div className="chat-page">
        {/* Sidebar with list of conversations */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>Conversations</h2>
          </div>
          <div className="conversations-list">
            {cases.map(c => (
              <div
                key={c._id}
                className={`conversation-item ${selectedCaseId === c._id ? 'selected' : ''}`}
                onClick={() => setSelectedCaseId(c._id)}
              >
                <div className="conversation-item-name">{c.client?.name || 'Unknown Client'}</div>
                <div className="conversation-item-status">Case Status: {c.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main chat window */}
        <div className="chat-window" key={selectedCaseId}>
        {selectedCaseId ? (
          <>
            <div className="chat-header">
              <h3>{cases.find(c => c._id === selectedCaseId)?.client?.name}</h3>
            </div>
            <div className="messages-area">
              {messages.map((msg) => (
                <div key={msg._id} className={`message-container ${msg.sender.role === 'lawyer' ? 'sent' : 'received'}`}>
                  <div className="message-avatar">
                    {msg.sender.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={`message-bubble ${msg.sender.role === 'lawyer' ? 'sent' : 'received'}`}>
                      {msg.text}
                    </div>
                    <div className="message-info">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              {messages.length === 0 && <div className="chat-placeholder">No messages yet. Start the conversation!</div>}
            </div>
            <form onSubmit={handleSendMessage} className="message-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
                disabled={sending}
              />
              <button type="submit" className="send-button" disabled={sending || !newMessage.trim()}>
                &#10148;
              </button>
            </form>
          </>
        ) : (
          <div className="chat-placeholder">
            <div className="chat-placeholder-icon">💬</div>
            <h2>Select a conversation</h2>
            <p>Choose a case from the left panel to start chatting.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default LawyerChat;
