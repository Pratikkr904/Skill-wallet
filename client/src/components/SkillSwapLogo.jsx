import React from 'react';

const SkillSwapLogo = ({ size = 40 }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: `${size}px`,
    fontWeight: 'bold',
    color: '#2563eb'
  }}>
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: `${size * 0.6}px`,
      fontWeight: 'bold'
    }}>
      S
    </div>
    <span style={{ fontSize: `${size * 0.8}px` }}>SkillSwap</span>
  </div>
);

export default SkillSwapLogo;
