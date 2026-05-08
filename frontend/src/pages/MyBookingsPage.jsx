import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../api/bookingApi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { FullPageSpinner } from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { BookingCardSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import { validateEmail } from '../utils/validators';

const EmptyIllustration = () => (
  <div style={{ padding: '64px 32px', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
    <div style={{ fontSize: '4rem', marginBottom: '16px', filter: 'drop-shadow(0 0 16px var(--accent-gold-glow))' }}>📅</div>
    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '8px' }}>View Your Schedule</h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto' }}>
      Enter your email address above to view your upcoming and past expert sessions.
    </p>
  </div>
);

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [emailErr, setEmailErr] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [searched, setSearched] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const addToast = useToast();

  const fetchBookings = useCallback(async (emailVal) => {
    const err = validateEmail(emailVal);
    if (err) { setEmailErr(err); return; }
    setEmailErr(null);
    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      const { data } = await getMyBookings(emailVal.trim());
      setBookings(data?.data || data || []);
    } catch (err) {
      setError(err.normalized?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    try {
      setCancelling(bookingId);
      await cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => b._id === bookingId ? { ...b, status: 'cancelled' } : b)
      );
      addToast('Booking cancelled successfully.', 'success');
    } catch (err) {
      addToast(err.normalized?.message || 'Failed to cancel booking.', 'error');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadgeProps = (status) => {
    switch (status) {
      case 'confirmed': return { label: 'Confirmed', bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', dot: '#3B82F6' }; // Blue
      case 'completed': return { label: 'Completed', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', dot: '#10B981' }; // Green
      case 'cancelled': return { label: 'Cancelled', bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', dot: '#EF4444' };   // Red
      case 'pending':
      default:          return { label: 'Pending', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', dot: '#F59E0B' };   // Amber
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '40px', animation: 'fadeIn 0.4s ease forwards' }}>
          <p className="label-text" style={{ marginBottom: '12px' }}>📅 Your Schedule</p>
          <h1 className="section-title">
            My <span className="gold-text">Sessions</span>
          </h1>
          <div style={{ height: '3px', width: '60px', background: 'var(--accent-gold)', marginTop: '12px', borderRadius: '4px' }} />
        </div>

        {/* Email Lookup */}
        <div className="card" style={{ maxWidth: 600, marginBottom: '40px', animation: 'fadeIn 0.4s ease 0.1s both', padding: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '8px' }}>
            Look up your bookings
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Enter the email address you used to book your sessions.
          </p>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px' }}>
              <Input
                id="lookup-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailErr(null); }}
                error={emailErr}
                onKeyDown={(e) => e.key === 'Enter' && fetchBookings(email)}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              loading={loading}
              onClick={() => fetchBookings(email)}
              style={{ marginTop: '0', flexShrink: 0, padding: '0 32px' }}
            >
              Search
            </Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.4s ease forwards' }}>
            {Array.from({ length: 3 }).map((_, i) => <BookingCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorState title="Failed to load bookings" message={error} onRetry={() => fetchBookings(email)} />
        ) : !searched ? (
          <div style={{ animation: 'fadeIn 0.4s ease 0.2s both' }}>
            <EmptyIllustration />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No bookings found"
            description={`We couldn't find any sessions associated with ${email}.`}
            action={<Button variant="primary" onClick={() => navigate('/experts')}>Browse Experts</Button>}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s ease forwards' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>
              Found <strong style={{ color: 'var(--text-primary)' }}>{bookings.length}</strong> session{bookings.length !== 1 ? 's' : ''} for {email}
            </p>
            {bookings.map((booking, i) => {
              const expert = booking.expert || {};
              const badgeProps = getStatusBadgeProps(booking.status);
              const displayDate = new Date(`${booking.date}T${booking.timeSlot}`).toLocaleString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
              });

              return (
                <div key={booking._id} className="card" style={{ padding: '24px', animation: `fadeIn 0.4s ease ${i * 0.05}s both`, border: booking.status === 'pending' ? '1px solid var(--accent-gold-glow)' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                    
                    {/* Left: Expert Info */}
                    <div style={{ display: 'flex', gap: '16px', flex: '1 1 300px' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0 }}>
                        {expert.avatar 
                          ? <img src={expert.avatar} alt={expert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{expert.name?.[0] || 'E'}</div>
                        }
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {expert.name || 'Expert Session'}
                        </h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{expert.category || 'General'}</span>
                        <div style={{ marginTop: '4px' }}>
                          <Badge {...badgeProps} />
                        </div>
                      </div>
                    </div>

                    {/* Middle: Booking Details */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', flex: '2 1 400px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 200px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Time</span>
                        <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>{displayDate}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hourly Rate</span>
                        <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(expert.hourlyRate)}</span>
                      </div>
                      {booking.notes && (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</span>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--bg-elevated)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                            "{booking.notes.length > 100 ? booking.notes.substring(0, 100) + '...' : booking.notes}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end', flex: '0 0 auto', minWidth: 120 }}>
                      <Button variant="outline" size="sm" fullWidth onClick={() => navigate(`/experts/${expert._id}`)}>
                        View Expert
                      </Button>
                      {booking.status === 'pending' && (
                        <Button variant="danger" size="sm" fullWidth loading={cancelling === booking._id} onClick={() => handleCancel(booking._id)}>
                          Cancel Session
                        </Button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
