/**
 * Format a date string or Date object to a readable date.
 * @param {string|Date} date
 * @param {object} [options]
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';

  const defaults = {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  };
  return d.toLocaleDateString('en-US', { ...defaults, ...options });
};

/**
 * Format a date to a short form (e.g. "May 9").
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateShort = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format a time string or Date to 12-hour clock (e.g. "2:30 PM").
 * @param {string|Date} time
 * @returns {string}
 */
export const formatTime = (time) => {
  if (!time) return '—';
  const d = new Date(time);
  if (isNaN(d)) {
    // Try parsing "HH:MM" style
    const [h, m] = String(time).split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const period = h >= 12 ? 'PM' : 'AM';
      const hour   = h % 12 || 12;
      return `${hour}:${String(m).padStart(2, '0')} ${period}`;
    }
    return time;
  }
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

/**
 * Format a date + time together.
 * @param {string|Date} dateTime
 * @returns {string}
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return '—';
  const d = new Date(dateTime);
  if (isNaN(d)) return '—';
  return d.toLocaleString('en-US', {
    month:  'short',
    day:    'numeric',
    year:   'numeric',
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format a number as USD currency.
 * @param {number} amount
 * @param {string} [currency='USD']
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format experience years.
 * @param {number} years
 * @returns {string}
 */
export const formatExperience = (years) => {
  if (!years && years !== 0) return '—';
  return `${years}+ yr${years === 1 ? '' : 's'}`;
};

/**
 * Get relative time (e.g. "2 hours ago").
 * @param {string|Date} date
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return '—';
  const d     = new Date(date);
  const now   = new Date();
  const diff  = now - d;
  const secs  = Math.floor(diff / 1000);
  const mins  = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);

  if (secs < 60)   return 'just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days < 7)    return `${days}d ago`;
  return formatDateShort(date);
};
