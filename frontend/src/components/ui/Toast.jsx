import React, { useEffect, useState } from 'react';

const Toast = ({ id, message, type = 'info', onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - (100 / 40))); // 40 steps over 4s = 100ms per step
    }, 100);

    const closeTimer = setTimeout(() => {
      onClose(id);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearTimeout(closeTimer);
    };
  }, [id, onClose]);

  const bgColors = {
    success: 'var(--success)',
    error: 'var(--error)',
    warning: 'var(--warning)',
    info: 'var(--accent-gold)'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'i'
  };

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      background: 'var(--bg-elevated)',
      border: `1px solid var(--border)`,
      borderLeft: `4px solid ${bgColors[type]}`,
      padding: '16px',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-elevated)',
      minWidth: '300px',
      maxWidth: '400px',
      animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    }}>
      {/* Icon */}
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: `${bgColors[type]}22`,
        color: bgColors[type],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0
      }}>
        {icons[type]}
      </div>
      
      {/* Message */}
      <div style={{ flex: 1, paddingTop: '2px' }}>
        <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.4 }}>
          {message}
        </p>
      </div>

      {/* Close button */}
      <button onClick={() => onClose(id)} style={{
        color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1, padding: '0 4px',
        opacity: 0.7, cursor: 'pointer', flexShrink: 0
      }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.7}>
        &times;
      </button>

      {/* Progress Bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: '3px',
        background: bgColors[type], width: `${progress}%`,
        transition: 'width 0.1s linear'
      }} />

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
