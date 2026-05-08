import React from 'react';
import Button from './Button';

/**
 * ErrorState — displayed on API or network errors.
 */
const ErrorState = ({
  title       = 'Something went wrong',
  message     = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryLabel  = 'Try Again',
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
      {/* Icon */}
      <div style={{
        width:          72,
        height:         72,
        borderRadius:   '50%',
        background:     'var(--error-dim)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       '2rem',
        marginBottom:   '8px',
      }}>
        ⚠️
      </div>

      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize:   '1.3rem',
        fontWeight: 600,
        color:      'var(--text-primary)',
      }}>
        {title}
      </h3>

      <p style={{
        fontSize:   '0.9rem',
        color:      'var(--text-secondary)',
        maxWidth:   '360px',
        lineHeight: 1.6,
      }}>
        {message}
      </p>

      {onRetry && (
        <div style={{ marginTop: '8px' }}>
          <Button variant="outline" size="md" onClick={onRetry}>
            ↺ {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
