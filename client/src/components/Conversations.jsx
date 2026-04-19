import React, { useState, useEffect } from 'react';
import Chat from './Chat';
import { useNotification } from './NotificationProvider';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();
  const token = localStorage.getItem('skillswap_token');

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setConversations(data);
      } else {
        showError(data.message || 'Failed to fetch conversations');
      }
    } catch (error) {
      showError('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="page-section">
        <h2>💬 Messages</h2>
        <div className="loading">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <h2>💬 Messages</h2>
      <p>Chat with your skill exchange connections</p>

      {conversations.length === 0 ? (
        <div className="no-conversations">
          <div className="no-conversations-content">
            <h3>👋 No conversations yet</h3>
            <p>Accept some skill exchange requests to start chatting with other users!</p>
            <p>Once you and another user have accepted each other's requests, you'll be able to chat here.</p>
          </div>
        </div>
      ) : (
        <div className="conversations-grid">
          {conversations.map((conversation) => (
            <div
              key={conversation.connectionId}
              className="conversation-card"
              onClick={() => setSelectedChat(conversation.user)}
            >
              <div className="conversation-avatar">
                <span>{conversation.user.name.charAt(0).toUpperCase()}</span>
              </div>

              <div className="conversation-info">
                <div className="conversation-header">
                  <h4>{conversation.user.name}</h4>
                  {conversation.unreadCount > 0 && (
                    <span className="unread-badge">{conversation.unreadCount}</span>
                  )}
                </div>

                <div className="conversation-preview">
                  {conversation.latestMessage ? (
                    <p className={conversation.unreadCount > 0 ? 'unread' : ''}>
                      {conversation.latestMessage.content.length > 50
                        ? `${conversation.latestMessage.content.substring(0, 50)}...`
                        : conversation.latestMessage.content
                      }
                    </p>
                  ) : (
                    <p className="no-messages">No messages yet</p>
                  )}
                </div>

                <div className="conversation-time">
                  {conversation.latestMessage
                    ? formatTime(conversation.latestMessage.timestamp)
                    : 'New connection'
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedChat && (
        <Chat
          otherUser={selectedChat}
          onClose={() => {
            setSelectedChat(null);
            fetchConversations(); // Refresh conversations when closing chat
          }}
        />
      )}
    </div>
  );
};

export default Conversations;