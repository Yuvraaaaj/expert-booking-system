import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import ExpertListPage   from './pages/ExpertListPage';
import ExpertDetailPage from './pages/ExpertDetailPage';
import BookingPage      from './pages/BookingPage';
import MyBookingsPage   from './pages/MyBookingsPage';
import './styles/globals.css';

const NotFoundPage = () => (
  <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease forwards' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '5rem', color: 'var(--accent-gold)', marginBottom: '8px', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '16px' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" style={{
        display: 'inline-flex', padding: '12px 24px', background: 'var(--accent-gold)', color: '#0A0F1E',
        borderRadius: 'var(--radius-md)', fontWeight: 600, textDecoration: 'none', transition: 'all var(--transition)'
      }}>
        Return Home
      </Link>
    </div>
  </div>
);

const App = () => {
  return (
    <ToastProvider>
      <SocketProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/"                     element={<ExpertListPage />} />
              <Route path="/experts"              element={<Navigate to="/" replace />} />
              <Route path="/experts/:id"          element={<ExpertDetailPage />} />
              <Route path="/booking"              element={<BookingPage />} />
              <Route path="/my-bookings"          element={<MyBookingsPage />} />
              <Route path="*"                     element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </SocketProvider>
    </ToastProvider>
  );
};

export default App;
