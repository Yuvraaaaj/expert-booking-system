import React from 'react';

/**
 * EmptyState — shown when a list has no items.
 */
const EmptyState = ({
  icon,
  title       = 'Nothing here yet',
  description = 'There is no data to display at the moment.',
  action,
  style: extraStyle,
}) => {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        textAlign:      'center',
        padding:        '64px 32px',
        gap:            '16px',
        animation:      'fadeIn 0.4s ease forwards',
        ...extraStyle,
      }}
    >
      {icon && (
        <div style={{
          width:          72,
          height:         72,
          borderRadius:   '50%',
          background:     'var(--accent-gold-dim)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          color:          'var(--accent-gold)',
          fontSize:       '2rem',
          marginBottom:   '8px',
        }}>
          {icon}
        </div>
      )}

      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize:   '1.3rem',
        fontWeight: 600,
        color:      'var(--text-primary)',
      }}>
        {title}
      </h3>

      <p style={{
        fontSize:  '0.9rem',
        color:     'var(--text-secondary)',
        maxWidth:  '340px',
        lineHeight: 1.6,
      }}>
        {description}
      </p>

      {action && (
        <div style={{ marginTop: '8px' }}>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
