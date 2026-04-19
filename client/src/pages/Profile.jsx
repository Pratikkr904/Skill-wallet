import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [skillsOffered, setSkillsOffered] = useState('');
  const [skillsWanted, setSkillsWanted] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('skillswap_token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || 'Unable to load profile.');
          return;
        }

        setName(data.name || '');
        setBio(data.bio || '');
        setSkillsOffered((data.skillsOffered || []).join(', '));
        setSkillsWanted((data.skillsWanted || []).join(', '));
      } catch (err) {
        setError('Server error. Please try again later.');
      }
    };

    fetchProfile();
  }, [navigate, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          bio,
          skillsOffered,
          skillsWanted,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Unable to save profile.');
        return;
      }
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="page-section">
      <h2>Edit Profile</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Bio
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows="4" />
        </label>
        <label>
          Skills Offered
          <input
            type="text"
            value={skillsOffered}
            onChange={(e) => setSkillsOffered(e.target.value)}
            placeholder="React, Java, UI Design"
          />
        </label>
        <label>
          Skills Wanted
          <input
            type="text"
            value={skillsWanted}
            onChange={(e) => setSkillsWanted(e.target.value)}
            placeholder="DSA, Python, SQL"
          />
        </label>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}
