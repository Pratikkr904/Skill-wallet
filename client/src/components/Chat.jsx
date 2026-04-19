import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from './NotificationProvider';

const Chat = ({ otherUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { showError } = useNotification();
  const token = localStorage.getItem('skillswap_token');
  const currentUser = JSON.parse(localStorage.getItem('skillswap_user') || 'null');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [otherUser._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${otherUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: otherUser._id,
          content: newMessage.trim(),
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, data]);
        setNewMessage('');
        // Mark messages as read when sending a new message
        await markAsRead();
      } else {
        showError(data.message || 'Failed to send message');
      }
    } catch (error) {
      showError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/messages/${otherUser._id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal">
        <div className="chat-header">
          <div className="chat-user-info">
            <h3>💬 Chat with {otherUser.name}</h3>
            <p>Connected for skill exchange</p>
          </div>
          <button className="chat-close" onClick={onClose}>×</button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>👋 Start a conversation with {otherUser.name}!</p>
              <p>Share your thoughts about skill exchange or ask questions.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`message ${message.sender._id === currentUser.id ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={sendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${otherUser.name}...`}
            disabled={loading}
            maxLength={500}
          />
          <button type="submit" disabled={loading || !newMessage.trim()}>
            {loading ? '...' : '📤'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;