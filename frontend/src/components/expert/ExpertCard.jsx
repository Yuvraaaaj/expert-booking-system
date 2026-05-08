import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

/* ── Star Rating ─────────────────────────────────────────── */
const StarRating = ({ rating = 0, max = 5 }) => {
  const filled  = Math.floor(rating);
  const partial = rating % 1;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {Array.from({ length: max }).map((_, i) => {
        let color = 'var(--text-muted)';
        let opacity = 0.3;

        if (i < filled) {
          color   = 'var(--accent-gold)';
          opacity = 1;
        } else if (i === filled && partial >= 0.5) {
          color   = 'var(--accent-gold)';
          opacity = 0.6;
        }

        return (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={color} style={{ opacity }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      })}
      <span style={{
        fontSize:   '0.78rem',
        color:      'var(--text-secondary)',
        marginLeft: '4px',
        fontWeight: 500,
      }}>
        {rating?.toFixed(1)}
      </span>
    </div>
  );
};

/* ── Avatar ──────────────────────────────────────────────── */
const Avatar = ({ name = '', avatar, size = 72 }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors   = ['#F59E0B', '#10B981', '#818CF8', '#F472B6', '#2DD4BF'];
  const bg       = colors[initials.charCodeAt(0) % colors.length];

  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImgError(true)}
        style={{
          width:        size,
          height:       size,
          borderRadius: '50%',
          objectFit:    'cover',
          border:       '2px solid var(--border)',
          transition:   'border-color var(--transition), box-shadow var(--transition)',
          flexShrink:   0,
        }}
      />
    );
  }

  return (
    <div style={{
      width:          size,
      height:         size,
      borderRadius:   '50%',
      background:     `linear-gradient(135deg, ${bg}, ${bg}99)`,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      fontSize:       size * 0.35,
      fontWeight:     700,
      color:          '#0A0F1E',
      fontFamily:     'var(--font-heading)',
      border:         '2px solid var(--border)',
      flexShrink:     0,
    }}>
      {initials}
    </div>
  );
};

/* ── ExpertCard ──────────────────────────────────────────── */
const ExpertCard = ({ expert }) => {
  const navigate  = useNavigate();
  const [hovered, setHovered] = useState(false);

  const {
    _id,
    name        = 'Expert',
    category    = 'General',
    avatar,
    rating      = 0,
    reviewCount = 0,
    experience  = 0,
    hourlyRate  = 0,
    bio         = '',
    isAvailable = true,
  } = expert || {};

  const handleBook = (e) => {
    e.stopPropagation();
    navigate(`/experts/${_id}/book`);
  };

  const handleView = () => navigate(`/experts/${_id}`);

  return (
    <article
      onClick={handleView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    'var(--bg-card)',
        border:        `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius:  'var(--radius-lg)',
        padding:       '24px',
        cursor:        'pointer',
        transition:    'all var(--transition)',
        transform:     hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow:     hovered ? 'var(--shadow-gold)' : 'var(--shadow-card)',
        display:       'flex',
        flexDirection: 'column',
        gap:           '16px',
        animation:     'fadeIn 0.4s ease forwards',
        position:      'relative',
        overflow:      'hidden',
      }}
    >
      {/* Availability indicator */}
      <div style={{
        position:     'absolute',
        top:          16,
        right:        16,
        width:        10,
        height:       10,
        borderRadius: '50%',
        background:   isAvailable ? 'var(--success)' : 'var(--text-muted)',
        boxShadow:    isAvailable ? '0 0 10px var(--success)' : 'none',
        animation:    isAvailable ? 'pulse 2s ease infinite' : 'none',
      }} title={isAvailable ? 'Available' : 'Unavailable'} />

      {/* Header: Avatar + Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          borderRadius: '50%',
          padding:      '3px',
          background:   hovered
            ? 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))'
            : 'var(--border)',
          transition:   'background var(--transition)',
          flexShrink:   0,
        }}>
          <Avatar name={name} avatar={avatar} size={64} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily:   'var(--font-heading)',
            fontSize:     '1.1rem',
            fontWeight:   700,
            color:        'var(--text-primary)',
            marginBottom: '6px',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {name}
          </h3>
          <Badge status={category} label={category} category size="sm" />
          <div style={{ marginTop: '8px' }}>
            <StarRating rating={rating} />
            {reviewCount > 0 && (
              <span style={{
                fontSize: '0.72rem',
                color:    'var(--text-muted)',
                marginTop: '2px',
                display:  'block',
              }}>
                {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p style={{
          fontSize:   '0.85rem',
          color:      'var(--text-secondary)',
          lineHeight: 1.6,
          display:    '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow:    'hidden',
        }}>
          {bio}
        </p>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* Stats Row */}
      <div style={{
        display:       'flex',
        alignItems:    'center',
        justifyContent: 'space-between',
        gap:           '12px',
      }}>
        {/* Experience */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Experience
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {experience}+ yrs
          </span>
        </div>

        {/* Rate */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Per Hour
          </span>
          <span style={{
            fontSize:   '1.05rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip: 'text',
          }}>
            ${hourlyRate}
          </span>
        </div>
      </div>

      {/* Book Button */}
      <Button
        variant={isAvailable ? 'primary' : 'ghost'}
        size="md"
        fullWidth
        disabled={!isAvailable}
        onClick={handleBook}
        style={{ marginTop: '4px' }}
      >
        {isAvailable ? '⚡ Book Session' : 'Currently Unavailable'}
      </Button>
    </article>
  );
};

export default ExpertCard;
