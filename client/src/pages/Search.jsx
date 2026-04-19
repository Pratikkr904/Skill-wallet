import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/NotificationProvider';

export default function Search() {
  const [skill, setSkill] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const token = localStorage.getItem('skillswap_token');
  const currentUser = JSON.parse(localStorage.getItem('skillswap_user') || 'null');

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Failed to fetch users.');
        return;
      }

      // Filter out current user
      const otherUsers = data.filter((user) => user._id !== currentUser?.id);
      setAllUsers(otherUsers);
      setFilteredUsers(otherUsers);
    } catch (err) {
      showError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!skill.trim()) {
      setFilteredUsers(allUsers);
      return;
    }

    const filtered = allUsers.filter(user =>
      user.skillsOffered.some(userSkill =>
        userSkill.toLowerCase().includes(skill.toLowerCase())
      ) ||
      user.skillsWanted.some(userSkill =>
        userSkill.toLowerCase().includes(skill.toLowerCase())
      ) ||
      user.name.toLowerCase().includes(skill.toLowerCase()) ||
      user.email.toLowerCase().includes(skill.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const sendRequest = async (receiverId, requestedSkill) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId, skill: requestedSkill }),
      });
      const data = await response.json();
      if (!response.ok) {
        showError(data.message || 'Request failed.');
        return;
      }
      showSuccess(`Request sent successfully to learn ${requestedSkill}!`);
    } catch (err) {
      showError('Server error. Please try again later.');
    }
  };

  return (
    <div className="page-section">
      <h2>🔍 Find Skill Partners</h2>
      <p>Search for users by skill, name, or browse all users to send learning requests.</p>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by skill, name, email, or leave empty to see all users"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
        <button type="submit">🔍 Search</button>
        <button type="button" onClick={() => { setSkill(''); setFilteredUsers(allUsers); }}>
          Show All Users
        </button>
      </form>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <>
          <div className="search-stats">
            <p>Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</p>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="result-grid">
              {filteredUsers.map((user) => (
                <div className="card user-card" key={user._id}>
                  <div className="user-header">
                    <h3>{user.name}</h3>
                    <p className="user-email">{user.email}</p>
                  </div>

                  <div className="user-bio">
                    {user.bio && <p>"{user.bio}"</p>}
                  </div>

                  <div className="skills-section">
                    <div className="skills-offered">
                      <strong>🎓 Can Teach:</strong>
                      <div className="skill-tags">
                        {user.skillsOffered.length > 0 ? (
                          user.skillsOffered.map((skill, index) => (
                            <span key={index} className="skill-tag offered">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="no-skills">None listed</span>
                        )}
                      </div>
                    </div>

                    <div className="skills-wanted">
                      <strong>📚 Wants to Learn:</strong>
                      <div className="skill-tags">
                        {user.skillsWanted.length > 0 ? (
                          user.skillsWanted.map((skill, index) => (
                            <span key={index} className="skill-tag wanted">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="no-skills">None listed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="request-actions">
                    {user.skillsOffered.length > 0 ? (
                      <div className="request-buttons">
                        <p><strong>Send a learning request:</strong></p>
                        {user.skillsOffered.slice(0, 3).map((skill, index) => (
                          <button
                            key={index}
                            onClick={() => sendRequest(user._id, skill)}
                            className="request-btn"
                          >
                            Learn {skill}
                          </button>
                        ))}
                        {user.skillsOffered.length > 3 && (
                          <button
                            onClick={() => sendRequest(user._id, user.skillsOffered[0])}
                            className="request-btn more-btn"
                          >
                            +{user.skillsOffered.length - 3} more skills
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="no-offer">This user hasn't listed any skills to teach yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No users found matching your search.</p>
              <button onClick={() => { setSkill(''); setFilteredUsers(allUsers); }}>
                Show All Users
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
