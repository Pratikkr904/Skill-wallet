import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SkillSwapLogo from '../components/SkillSwapLogo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const requestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Unable to send reset code.');
        return;
      }

      setMessage(data.message || 'Reset code sent. Check your email.');
      setStep(2);
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Unable to reset password.');
        return;
      }

      localStorage.setItem('skillswap_token', data.token);
      localStorage.setItem('skillswap_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <SkillSwapLogo size={44} />
          <h1>Forgot Password</h1>
          <p>Enter your email to receive a reset code.</p>
        </div>

        <form className="auth-form" onSubmit={step === 1 ? requestReset : resetPassword}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {step === 2 && (
            <>
              <div className="form-group">
                <label htmlFor="code">Reset Code</label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter the code from email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </>
          )}

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button">
            {step === 1 ? 'Send Reset Code' : 'Update Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remembered it?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
