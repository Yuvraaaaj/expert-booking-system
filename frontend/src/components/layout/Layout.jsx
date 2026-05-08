import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop:   '1px solid var(--border)',
        padding:     '24px 0',
        textAlign:   'center',
        color:       'var(--text-muted)',
        fontSize:    '0.8rem',
        background:  'var(--bg-card)',
      }}>
        <div className="container">
          <p>
            © {new Date().getFullYear()}{' '}
            <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
              ExpertConnect
            </span>
            . All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
