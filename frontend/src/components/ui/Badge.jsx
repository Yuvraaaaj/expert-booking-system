import React from 'react';

const statusConfig = {
  pending: {
    label: 'Pending',
    bg:    'rgba(245, 158, 11, 0.15)',
    color: '#F59E0B',
    dot:   '#F59E0B',
  },
  confirmed: {
    label: 'Confirmed',
    bg:    'rgba(16, 185, 129, 0.15)',
    color: '#10B981',
    dot:   '#10B981',
  },
  completed: {
    label: 'Completed',
    bg:    'rgba(99, 102, 241, 0.15)',
    color: '#818CF8',
    dot:   '#818CF8',
  },
  cancelled: {
    label: 'Cancelled',
    bg:    'rgba(239, 68, 68, 0.15)',
    color: '#EF4444',
    dot:   '#EF4444',
  },
  available: {
    label: 'Available',
    bg:    'rgba(16, 185, 129, 0.15)',
    color: '#10B981',
    dot:   '#10B981',
  },
  booked: {
    label: 'Booked',
    bg:    'rgba(239, 68, 68, 0.15)',
    color: '#EF4444',
    dot:   '#EF4444',
  },
};

const categoryColors = [
  { bg: 'rgba(99, 102, 241, 0.15)',  color: '#818CF8' },
  { bg: 'rgba(236, 72, 153, 0.15)', color: '#F472B6' },
  { bg: 'rgba(20, 184, 166, 0.15)', color: '#2DD4BF' },
  { bg: 'rgba(249, 115, 22, 0.15)', color: '#FB923C' },
  { bg: 'rgba(168, 85, 247, 0.15)', color: '#C084FC' },
];

const hashString = (str = '') =>
  str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

const Badge = ({
  status,
  label,
  category = false,
  size = 'md',
  showDot = true,
  style: extraStyle,
}) => {
  const key = status?.toLowerCase();
  let config = statusConfig[key];

  if (!config && category) {
    const idx = hashString(label || status) % categoryColors.length;
    config = {
      label: label || status,
      ...categoryColors[idx],
      dot:   categoryColors[idx].color,
    };
  }

  if (!config) {
    config = {
      label: label || status || '—',
      bg:    'var(--bg-elevated)',
      color: 'var(--text-secondary)',
      dot:   'var(--text-muted)',
    };
  }

  const displayLabel = label || config.label;

  const styles = {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            '6px',
    padding:        size === 'sm' ? '3px 10px' : '4px 12px',
    borderRadius:   '99px',
    fontSize:       size === 'sm' ? '0.7rem' : '0.75rem',
    fontWeight:     600,
    letterSpacing:  '0.04em',
    background:     config.bg,
    color:          config.color,
    whiteSpace:     'nowrap',
    ...extraStyle,
  };

  const dotStyles = {
    width:        size === 'sm' ? 6 : 7,
    height:       size === 'sm' ? 6 : 7,
    borderRadius: '50%',
    background:   config.dot,
    flexShrink:   0,
  };

  return (
    <span style={styles}>
      {showDot && <span style={dotStyles} />}
      {displayLabel}
    </span>
  );
};

export default Badge;
