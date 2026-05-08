import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';

const navLinks = [
  { to: '/experts',     label: 'Experts'     },
  { to: '/my-bookings', label: 'My Bookings' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position:        'sticky',
        top:             0,
        zIndex:          100,
        height:          '72px',
        background:      scrolled
          ? 'rgba(10, 15, 30, 0.92)'
          : 'rgba(10, 15, 30, 0.75)',
        backdropFilter:  'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom:    `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        transition:      'all var(--transition-slow)',
        boxShadow:       scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div
        className="container"
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          height:         '100%',
        }}
      >
        {/* ── Logo ── */}
        <Link
          to="/"
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '10px',
            textDecoration: 'none',
          }}
        >
          <div style={{
            width:          38,
            height:         38,
            borderRadius:   '10px',
            background:     'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '1.1rem',
            fontWeight:     800,
            color:          '#0A0F1E',
            boxShadow:      '0 4px 15px rgba(245,158,11,0.35)',
            flexShrink:     0,
            fontFamily:     'var(--font-heading)',
          }}>
            E
          </div>
          <span style={{
            fontFamily:  'var(--font-heading)',
            fontSize:    '1.25rem',
            fontWeight:  700,
            color:       'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>
            Expert
            <span style={{
              background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:       'text',
            }}>
              Connect
            </span>
            <span style={{
              display:        'inline-block',
              width:          6,
              height:         6,
              borderRadius:   '50%',
              background:     'var(--accent-gold)',
              marginLeft:     '2px',
              verticalAlign:  'middle',
              marginBottom:   '2px',
              boxShadow:      '0 0 8px var(--accent-gold)',
            }} />
          </span>
        </Link>

        {/* ── Nav Links ── */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                position:       'relative',
                padding:        '8px 16px',
                fontSize:       '0.9rem',
                fontWeight:     isActive ? 600 : 500,
                color:          isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                borderRadius:   'var(--radius-sm)',
                background:     isActive ? 'var(--accent-gold-dim)' : 'transparent',
                transition:     'all var(--transition)',
                textDecoration: 'none',
              })}
            >
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && (
                    <span style={{
                      position:     'absolute',
                      bottom:       0,
                      left:         '50%',
                      transform:    'translateX(-50%)',
                      width:        '20px',
                      height:       '2px',
                      background:   'var(--accent-gold)',
                      borderRadius: '99px',
                    }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
