import React, { useState, forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon,
  iconRight,
  id,
  disabled = false,
  fullWidth = true,
  containerStyle,
  inputStyle,
  type = 'text',
  ...rest
}, ref) => {
  const [focused, setFocused] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '_') : undefined);

  const containerStyles = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '6px',
    width:         fullWidth ? '100%' : 'auto',
    ...containerStyle,
  };

  const labelStyles = {
    fontSize:      '0.8rem',
    fontWeight:    600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color:         error ? 'var(--error)' : 'var(--text-secondary)',
    transition:    'color var(--transition)',
  };

  const wrapperStyles = {
    position:     'relative',
    display:      'flex',
    alignItems:   'center',
  };

  const inputBaseStyles = {
    width:           '100%',
    height:          '46px',
    padding:         icon ? '0 16px 0 44px' : iconRight ? '0 44px 0 16px' : '0 16px',
    fontFamily:      'var(--font-body)',
    fontSize:        '0.93rem',
    color:           'var(--text-primary)',
    background:      focused ? 'var(--bg-elevated)' : 'var(--bg-card)',
    border:          `1px solid ${error ? 'var(--error)' : focused ? 'var(--accent-gold)' : 'var(--border)'}`,
    borderRadius:    'var(--radius-md)',
    outline:         'none',
    transition:      'all var(--transition)',
    boxShadow:       focused && !error
      ? '0 0 0 3px var(--accent-gold-dim)'
      : error && focused
      ? '0 0 0 3px var(--error-dim)'
      : 'none',
    cursor:          disabled ? 'not-allowed' : 'text',
    opacity:         disabled ? 0.6 : 1,
    ...inputStyle,
  };

  const iconStyles = {
    position:   'absolute',
    display:    'flex',
    alignItems: 'center',
    color:      error ? 'var(--error)' : focused ? 'var(--accent-gold)' : 'var(--text-muted)',
    transition: 'color var(--transition)',
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyles}>
      {label && (
        <label htmlFor={inputId} style={labelStyles}>
          {label}
        </label>
      )}

      <div style={wrapperStyles}>
        {icon && (
          <span style={{ ...iconStyles, left: 14 }}>
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          style={inputBaseStyles}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />

        {iconRight && (
          <span style={{ ...iconStyles, right: 14 }}>
            {iconRight}
          </span>
        )}
      </div>

      {(error || hint) && (
        <p style={{
          fontSize:  '0.78rem',
          color:     error ? 'var(--error)' : 'var(--text-muted)',
          marginTop: '2px',
          display:   'flex',
          alignItems: 'center',
          gap:       '4px',
        }}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
