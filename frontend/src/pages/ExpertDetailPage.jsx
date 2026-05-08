import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExpertById, getExpertSlots } from '../api/expertApi';
import { FullPageSpinner } from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SlotPicker from '../components/expert/SlotPicker';
import useSocket from '../hooks/useSocket';
import { formatCurrency, formatExperience } from '../utils/formatters';

const StarRating = ({ rating = 0, count = 0 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} width="18" height="18" viewBox="0 0 24 24"
        fill={i < Math.round(rating) ? 'var(--accent-gold)' : 'var(--border)'}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ))}
    <span style={{ color: 'var(--text-secondary)', marginLeft: '6px', fontWeight: 600 }}>
      {rating?.toFixed(1)} {count > 0 && `(${count})`}
    </span>
  </div>
);

const ExpertDetailPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [expert,  setExpert]  = useState(null);
  const [slots,   setSlots]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [expertRes, slotsRes] = await Promise.all([
          getExpertById(id),
          getExpertSlots(id).catch(() => ({ data: [] }))
        ]);
        setExpert(expertRes.data?.data || expertRes.data);
        const rawSlots = slotsRes.data?.data || slotsRes.data || [];
        setSlots(Array.isArray(rawSlots) ? rawSlots : []);
      } catch (err) {
        setError(err.normalized?.message || 'Failed to load expert profile.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  useSocket(`expert_${id}`, {
    slotBooked: (data) => {
      setBookedSlots((prev) => [...prev, { date: data.date, time: data.timeSlot }]);
      if (selectedDate === data.date && selectedTime === data.timeSlot) {
        setSelectedDate(null);
        setSelectedTime(null);
      }
    }
  });

  const handleBook = () => {
    if (!selectedDate || !selectedTime) return;
    navigate(`/booking?expertId=${id}&date=${selectedDate}&time=${selectedTime}`);
  };

  if (loading) return <FullPageSpinner label="Loading expert profile…" />;
  if (error) return (
    <div className="page-wrapper"><div className="container">
      <ErrorState title="Expert not found" message={error} onRetry={() => navigate('/experts')} retryLabel="Back to Experts" />
    </div></div>
  );
  if (!expert) return null;

  const { name='Expert', category='General', avatar, rating=0, reviewCount=0, experience=0, hourlyRate=0, bio='' } = expert;

  return (
    <div className="page-wrapper">
      <div className="container">
        <button onClick={() => navigate('/experts')}
          style={{ display:'flex', alignItems:'center', gap:'6px', color:'var(--text-secondary)', fontSize:'0.85rem',
            background:'none', border:'none', cursor:'pointer', marginBottom:'32px', padding:0, fontFamily:'var(--font-body)' }}
          onMouseEnter={(e) => e.currentTarget.style.color='var(--accent-gold)'}
          onMouseLeave={(e) => e.currentTarget.style.color='var(--text-secondary)'}
        >← Back to Experts</button>

        {/* Hero Section */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', textAlign: 'center', marginBottom: '40px', padding: '48px 24px', animation: 'fadeIn 0.5s ease forwards' }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            border: '4px solid var(--accent-gold)', boxShadow: '0 0 24px var(--accent-gold-glow)',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {avatar
              ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{
                  width: '100%', height: '100%',
                  background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem', fontWeight: 700, color: '#0A0F1E', fontFamily: 'var(--font-heading)',
                }}>{name[0]?.toUpperCase()}</div>
            }
          </div>

          <div style={{ maxWidth: 600 }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 700, marginBottom: '12px' }}>{name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <Badge status={category} label={category} category />
              <Badge label={`${formatExperience(experience)} exp`} bg="var(--bg-elevated)" color="var(--text-secondary)" showDot={false} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <StarRating rating={rating} count={reviewCount} />
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '24px' }}>{bio}</p>
            <div style={{
              display: 'inline-flex', flexDirection: 'column',
              padding: '16px 32px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Hourly Rate</span>
              <span style={{
                fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)',
                background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{formatCurrency(hourlyRate)}</span>
            </div>
          </div>
        </div>

        {/* Available Sessions */}
        <div style={{ animation: 'fadeIn 0.5s ease 0.2s both' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '24px' }}>Available Sessions</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 500px' }}>
              <div className="card">
                <SlotPicker 
                  slots={slots} 
                  selectedDate={selectedDate} 
                  selectedTime={selectedTime}
                  onSelect={(d, t) => { setSelectedDate(d); setSelectedTime(t); }}
                  bookedSlots={bookedSlots}
                />
              </div>
            </div>
            <div style={{ flex: '1 1 300px', position: 'sticky', top: '90px' }}>
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '16px' }}>Ready to Connect?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                  {selectedDate && selectedTime
                    ? `You have selected ${new Date(`${selectedDate}T${selectedTime}`).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}.` 
                    : 'Please select an available time slot from the calendar to proceed with your booking.'}
                </p>
                <Button 
                  fullWidth 
                  size="lg" 
                  variant={selectedDate && selectedTime ? 'primary' : 'ghost'} 
                  disabled={!(selectedDate && selectedTime)}
                  onClick={handleBook}
                >
                  {selectedDate && selectedTime ? '⚡ Book This Slot' : 'Select a slot'}
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExpertDetailPage;
