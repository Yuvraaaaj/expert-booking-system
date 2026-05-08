import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getExpertById } from '../api/expertApi';
import { createBooking } from '../api/bookingApi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { FullPageSpinner } from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { validateBookingForm } from '../utils/validators';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const expertId = searchParams.get('expertId');
  const dateStr  = searchParams.get('date');
  const timeStr  = searchParams.get('time');

  const [expert,  setExpert]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]  = useState(false);
  const [bookingRef, setBookingRef] = useState(null);
  const addToast = useToast();

  const [form, setForm] = useState({ userName: '', email: '', phone: '', notes: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!expertId || !dateStr || !timeStr) {
      setError('Missing booking details. Please select a slot first.');
      setLoading(false);
      return;
    }

    const fetchExpert = async () => {
      try {
        setLoading(true);
        const { data } = await getExpertById(expertId);
        setExpert(data?.data || data);
      } catch (err) {
        setError(err.normalized?.message || 'Failed to load expert details.');
      } finally {
        setLoading(false);
      }
    };
    fetchExpert();
  }, [expertId, dateStr, timeStr]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateBookingForm({ ...form, slot: 'selected' });
    if (!isValid) { setFormErrors(errors); return; }

    try {
      setSubmitting(true);
      const { data } = await createBooking({
        expertId: expertId,
        userName: form.userName.trim(),
        email:    form.email.trim(),
        phone:    form.phone.trim(),
        date:     dateStr,
        timeSlot: timeStr,
        notes:    form.notes.trim(),
      });
      setBookingRef(data?.data?._id || data?._id);
      setSuccess(true);
      addToast('Booking confirmed successfully!', 'success');
    } catch (err) {
      const status = err.normalized?.status;
      if (status === 409) {
        addToast('This slot was just booked by someone else. Please choose another slot.', 'error');
        navigate(`/experts/${expertId}`);
      } else {
        const errorMsg = err.normalized?.message || 'Booking failed. Please try again.';
        setFormErrors({ submit: errorMsg });
        addToast(errorMsg, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <FullPageSpinner label="Preparing booking…" />;
  if (error) return (
    <div className="page-wrapper"><div className="container">
      <ErrorState title="Cannot load booking" message={error} onRetry={() => navigate('/experts')} retryLabel="Back to Experts" />
    </div></div>
  );

  const displayDateTime = new Date(`${dateStr}T${timeStr}`).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  });

  if (success) return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '24px' }}>
        <div style={{ animation: 'fadeInScale 0.4s ease forwards' }} className="card">
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--success-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', margin: '0 auto 24px', color: 'var(--success)',
            boxShadow: '0 0 30px var(--success-dim)'
          }}>✓</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', marginBottom: '16px' }}>
            Booking Confirmed!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Your session with <strong style={{ color: 'var(--accent-gold)' }}>{expert?.name}</strong> has been successfully booked for:<br/>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{displayDateTime}</span>
          </p>
          {bookingRef && (
            <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '32px', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Booking Reference</span>
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '4px' }}>{bookingRef}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Button variant="primary" size="lg" onClick={() => navigate('/my-bookings')}>View My Bookings</Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/experts')}>Browse More</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const name       = expert?.name || 'Expert';
  const category   = expert?.category || 'General';
  const hourlyRate = expert?.hourlyRate || 0;
  const avatar     = expert?.avatar;

  return (
    <div className="page-wrapper">
      <div className="container">
        <button onClick={() => navigate(`/experts/${expertId}`)}
          style={{ display:'flex', alignItems:'center', gap:'6px', color:'var(--text-secondary)', fontSize:'0.85rem',
            background:'none', border:'none', cursor:'pointer', marginBottom:'32px', padding:0, fontFamily:'var(--font-body)' }}
          onMouseEnter={(e)=>e.currentTarget.style.color='var(--accent-gold)'}
          onMouseLeave={(e)=>e.currentTarget.style.color='var(--text-secondary)'}
        >← Back to Expert Profile</button>

        <div style={{ display: 'grid', gridTemplateColumns: '360px minmax(0,1fr)', gap: '40px', alignItems: 'start' }}>

          {/* Left: Summary Sidebar */}
          <div style={{ position:'sticky', top:'90px', animation:'fadeIn 0.5s ease both' }}>
            <div className="card" style={{ border: '2px solid var(--accent-gold)', boxShadow: '0 0 24px var(--accent-gold-glow)' }}>
              <h3 style={{ fontFamily:'var(--font-heading)', fontSize:'1.2rem', marginBottom:'24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                Booking Summary
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0 }}>
                  {avatar 
                    ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#0A0F1E', fontFamily: 'var(--font-heading)' }}>{name[0]}</div>
                  }
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>{name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{category}</span>
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color:'var(--text-muted)', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Date</span>
                  <span style={{ color:'var(--text-primary)', fontSize:'0.95rem', fontWeight: 500 }}>
                    {new Date(dateStr).toLocaleString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color:'var(--text-muted)', fontSize:'0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Time</span>
                  <span style={{ color:'var(--text-primary)', fontSize:'0.95rem', fontWeight: 500 }}>
                    {new Date(`1970-01-01T${timeStr}`).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </span>
                </div>
                <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems: 'center' }}>
                  <span style={{ color:'var(--text-secondary)', fontWeight:600 }}>Hourly Rate</span>
                  <span style={{
                    fontSize:'1.4rem', fontWeight:800, fontFamily: 'var(--font-heading)',
                    background:'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))',
                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                  }}>
                    {formatCurrency(hourlyRate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="card" style={{ animation: 'fadeIn 0.4s ease 0.1s both' }}>
            <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'1.8rem', marginBottom:'6px' }}>
              Your Details
            </h2>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.95rem', marginBottom:'32px' }}>
              Please provide your information to confirm the session.
            </p>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
              <Input id="userName" label="Full Name" placeholder="e.g. Jane Doe"
                value={form.userName} onChange={handleChange('userName')}
                error={formErrors.userName} />

              <Input id="email" label="Email Address" type="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange('email')}
                error={formErrors.email} />

              <Input id="phone" label="Phone Number" placeholder="+1 234 567 8900"
                value={form.phone} onChange={handleChange('phone')}
                error={formErrors.phone} />

              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label htmlFor="notes" style={{ fontSize:'0.8rem', fontWeight:600, textTransform:'uppercase',
                  letterSpacing:'0.06em', color:'var(--text-secondary)' }}>
                  Notes for Expert (Optional)
                </label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={handleChange('notes')}
                  placeholder="What would you like to discuss during this session?"
                  rows={4}
                  style={{
                    width:'100%', padding:'16px', fontFamily:'var(--font-body)', fontSize:'0.95rem',
                    color:'var(--text-primary)', background:'var(--bg-card)',
                    border:'1px solid var(--border)', borderRadius:'var(--radius-md)',
                    outline:'none', resize:'vertical', transition:'all var(--transition)',
                  }}
                  onFocus={(e)=>{ e.target.style.borderColor='var(--accent-gold)'; e.target.style.boxShadow='0 0 0 3px var(--accent-gold-dim)'; e.target.style.background='var(--bg-elevated)'; }}
                  onBlur={(e)=>{ e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; e.target.style.background='var(--bg-card)'; }}
                />
              </div>

              {formErrors.submit && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color:'var(--error)', background:'var(--error-dim)', padding:'16px', borderRadius:'var(--radius-md)', border:'1px solid var(--error)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <span style={{ fontSize:'0.9rem', fontWeight: 500 }}>{formErrors.submit}</span>
                </div>
              )}

              <div style={{ marginTop: '16px' }}>
                <Button type="submit" variant="primary" size="lg" loading={submitting} style={{ padding: '16px 40px', fontSize: '1.05rem' }}>
                  {submitting ? 'Confirming...' : '⚡ Confirm Booking'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
