import React from 'react';

const sizeStyles = {
  sm: { padding: '8px 16px', fontSize: '0.8rem', height: '36px' },
  md: { padding: '11px 24px', fontSize: '0.9rem', height: '44px' },
  lg: { padding: '14px 32px', fontSize: '1rem',   height: '52px' },
};

const baseStyle = {
  display:        'inline-flex',
  alignItems:     'center',
  justifyContent: 'center',
  gap:            '8px',
  fontFamily:     'var(--font-body)',
  fontWeight:     600,
  letterSpacing:  '0.02em',
  borderRadius:   'var(--radius-md)',
  border:         '1px solid transparent',
  cursor:         'pointer',
  transition:     'all var(--transition)',
  userSelect:     'none',
  whiteSpace:     'nowrap',
  position:       'relative',
  overflow:       'hidden',
  textDecoration: 'none',
};

const variantStyles = {
  primary: {
    background:  'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-light) 100%)',
    color:       '#0A0F1E',
    borderColor: 'transparent',
    boxShadow:   '0 4px 15px rgba(245, 158, 11, 0.3)',
  },
  ghost: {
    background:  'transparent',
    color:       'var(--text-primary)',
    borderColor: 'var(--border)',
  },
  danger: {
    background:  'var(--error-dim)',
    color:       'var(--error)',
    borderColor: 'var(--error)',
  },
  success: {
    background:  'var(--success-dim)',
    color:       'var(--success)',
    borderColor: 'var(--success)',
  },
  outline: {
    background:  'transparent',
    color:       'var(--accent-gold)',
    borderColor: 'var(--accent-gold)',
  },
};

const Spinner = ({ size = 16 }) => (
  <span
    style={{
      width:        size,
      height:       size,
      border:       '2px solid rgba(255,255,255,0.3)',
      borderTop:    '2px solid currentColor',
      borderRadius: '50%',
      animation:    'spin 0.7s linear infinite',
      display:      'block',
      flexShrink:   0,
    }}
  />
);

const Button = ({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  onClick,
  type     = 'button',
  as: Tag  = 'button',
  style: extraStyle,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const styles = {
    ...baseStyle,
    ...sizeStyles[size] || sizeStyles.md,
    ...variantStyles[variant] || variantStyles.primary,
    width:   fullWidth ? '100%' : undefined,
    opacity: isDisabled ? 0.6 : 1,
    cursor:  isDisabled ? 'not-allowed' : 'pointer',
    ...extraStyle,
  };

  const handleMouseEnter = (e) => {
    if (isDisabled) return;
    if (variant === 'primary') {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 25px rgba(245,158,11,0.45)';
    } else if (variant === 'ghost') {
      e.currentTarget.style.borderColor    = 'var(--accent-gold)';
      e.currentTarget.style.color          = 'var(--accent-gold)';
      e.currentTarget.style.backgroundColor = 'var(--accent-gold-dim)';
    } else if (variant === 'danger') {
      e.currentTarget.style.backgroundColor = 'var(--error)';
      e.currentTarget.style.color           = '#fff';
    }
  };

  const handleMouseLeave = (e) => {
    const v = variantStyles[variant] || variantStyles.primary;
    e.currentTarget.style.transform       = 'none';
    e.currentTarget.style.boxShadow       = v.boxShadow || 'none';
    e.currentTarget.style.borderColor     = v.borderColor;
    e.currentTarget.style.color           = v.color;
    e.currentTarget.style.backgroundColor = '';
  };

  return (
    <Tag
      type={Tag === 'button' ? type : undefined}
      style={styles}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {loading ? <Spinner size={size === 'sm' ? 13 : 16} /> : icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
      {!loading && iconRight && <span style={{ display: 'flex' }}>{iconRight}</span>}
    </Tag>
  );
};

export default Button;
