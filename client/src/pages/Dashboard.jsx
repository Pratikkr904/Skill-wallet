import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../components/NotificationProvider';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showInfo } = useNotification();
  const token = localStorage.getItem('skillswap_token');
  const currentUser = JSON.parse(localStorage.getItem('skillswap_user') || 'null');
  const lastRequestCountRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [profileResponse, requestsResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/requests`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const profileData = await profileResponse.json();
        const requestsData = await requestsResponse.json();

        if (!profileResponse.ok) {
          setError(profileData.message || 'Unable to fetch profile.');
          return;
        }
        if (!requestsResponse.ok) {
          setError(requestsData.message || 'Unable to fetch requests.');
          return;
        }

        setUser(profileData);
        setRequests(requestsData);

        // Check for new incoming requests
        const receivedRequests = requestsData.filter((req) => String(req.receiver._id) === String(currentUser?.id));
        if (receivedRequests.length > lastRequestCountRef.current) {
          const newRequests = receivedRequests.slice(lastRequestCountRef.current);
          newRequests.forEach((request) => {
            if (request.status === 'pending') {
              showInfo(`📨 New request from ${request.sender.name} to learn ${request.skill}!`, 5000);
            }
          });
        }
        lastRequestCountRef.current = receivedRequests.length;

      } catch (err) {
        setError('Server error. Please try again later.');
      }
    };

    fetchData();

    // Set up periodic checking for new requests every 30 seconds
    intervalRef.current = setInterval(fetchData, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [navigate, token, currentUser?.id, showInfo]);

  const receivedRequests = requests.filter((req) => String(req.receiver._id) === String(currentUser?.id));
  const sentRequests = requests.filter((req) => String(req.sender._id) === String(currentUser?.id));

  const handleLogout = () => {
    localStorage.removeItem('skillswap_token');
    localStorage.removeItem('skillswap_user');
    navigate('/login');
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'accepted' }),
      });
      const data = await response.json();

      if (response.ok) {
        showSuccess('Request accepted! You can now chat with the sender. Check the Messages page!');
        // Refresh requests
        const requestsResponse = await fetch(`${import.meta.env.VITE_API_URL}/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const requestsData = await requestsResponse.json();
        if (requestsResponse.ok) {
          setRequests(requestsData);
        }
      } else {
        showError(data.message || 'Failed to accept request');
      }
    } catch (error) {
      showError('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    const confirmReject = window.confirm('Are you sure you want to reject this request?');
    if (!confirmReject) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'rejected' }),
      });
      const data = await response.json();

      if (response.ok) {
        showSuccess('Request rejected.');
        // Refresh requests
        const requestsResponse = await fetch(`${import.meta.env.VITE_API_URL}/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const requestsData = await requestsResponse.json();
        if (requestsResponse.ok) {
          setRequests(requestsData);
        }
      } else {
        showError(data.message || 'Failed to reject request');
      }
    } catch (error) {
      showError('Failed to reject request');
    }
  };

  if (error) {
    return (
      <div className="dashboard-page">
        <h2>Dashboard</h2>
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h2>Welcome back, {user?.name || 'SkillSwap User'}! 👋</h2>
          <p>Ready to learn and share skills today?</p>
        </div>
        <button onClick={handleLogout} style={{ background: '#dc2626' }}>
          Logout
        </button>
      </div>

      {user ? (
        <>
          <div className="card">
            <h3>👤 Your Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Bio:</strong> {user.bio || 'No bio yet'}</p>
              </div>
              <div>
                <p><strong>Skills Offered:</strong></p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {user.skillsOffered.length > 0 ? (
                    user.skillsOffered.map((skill, index) => (
                      <span key={index} style={{
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem'
                      }}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#6b7280' }}>None added yet</span>
                  )}
                </div>
                <p><strong>Skills Wanted:</strong></p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {user.skillsWanted.length > 0 ? (
                    user.skillsWanted.map((skill, index) => (
                      <span key={index} style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem'
                      }}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#6b7280' }}>None added yet</span>
                  )}
                </div>
              </div>
            </div>
            <Link to="/profile" className="button-link">✏️ Edit Profile</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card">
              <h3>📨 Requests Received ({receivedRequests.length})</h3>
              {receivedRequests.length === 0 ? (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No requests received yet.</p>
              ) : (
                receivedRequests.map((request) => (
                  <div key={request._id} className={`request-item ${request.status}`}>
                    <p><strong>{request.sender.name}</strong> wants to learn <strong>{request.skill}</strong></p>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      "{request.message}"
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '8px',
                      fontSize: '0.8rem',
                      color: request.status === 'accepted' ? '#059669' :
                             request.status === 'rejected' ? '#dc2626' : '#d97706'
                    }}>
                      Status: <strong>{request.status}</strong>
                    </div>
                    {request.status === 'pending' && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '12px'
                      }}>
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            transition: 'transform 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        >
                          ✅ Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          style={{
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            transition: 'transform 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="card">
              <h3>📤 Requests Sent ({sentRequests.length})</h3>
              {sentRequests.length === 0 ? (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No requests sent yet.</p>
              ) : (
                sentRequests.map((request) => (
                  <div key={request._id} className={`request-item ${request.status}`}>
                    <p>Request to <strong>{request.receiver.name}</strong> for <strong>{request.skill}</strong></p>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      "{request.message}"
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '8px',
                      fontSize: '0.8rem',
                      color: request.status === 'accepted' ? '#059669' :
                             request.status === 'rejected' ? '#dc2626' : '#d97706'
                    }}>
                      Status: <strong>{request.status}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
            <h3>🚀 Ready to Connect?</h3>
            <p>Find people to learn from or teach your skills!</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
              <Link to="/search" className="button-link">🔍 Search Users</Link>
              <Link to="/messages" className="button-link" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
                💬 Messages
              </Link>
              <Link to="/profile" className="button-link" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                ✏️ Update Skills
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>Loading your dashboard...</p>
        </div>
      )}
    </div>
  );
}
