import React from 'react';

/**
 * Gold animated spinner.
 * @param {{ size?: number, color?: string }} props
 */
const Spinner = ({ size = 40, color = 'var(--accent-gold)', style: extraStyle }) => {
  return (
    <span
      role="status"
      aria-label="Loading…"
      style={{
        display:     'inline-block',
        width:       size,
        height:      size,
        border:      `${Math.max(2, size / 10)}px solid rgba(245, 158, 11, 0.2)`,
        borderTop:   `${Math.max(2, size / 10)}px solid ${color}`,
        borderRadius: '50%',
        animation:   'spin 0.7s linear infinite',
        flexShrink:  0,
        ...extraStyle,
      }}
    />
  );
};

/**
 * Full-page or section centered spinner.
 */
export const FullPageSpinner = ({ label = 'Loading…' }) => (
  <div style={{
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '20px',
    minHeight:      '300px',
    width:          '100%',
  }}>
    <Spinner size={48} />
    {label && (
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</p>
    )}
  </div>
);

export default Spinner;
