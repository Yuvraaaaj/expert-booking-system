import React from 'react';
import { formatTime } from '../../utils/formatters';

const SlotPicker = ({
  slots = [],
  selectedDate,
  selectedTime,
  onSelect,
  bookedSlots = [],
}) => {
  // 1. Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  // 2. Get unique dates, sorted, max 7
  const uniqueDates = Object.keys(groupedSlots)
    .sort()
    .slice(0, 7);

  // Helper to check if a slot is booked
  const isSlotBooked = (slot) => {
    if (slot.isBooked) return true;
    return bookedSlots.some(
      (b) => b.date === slot.date && b.time === slot.time
    );
  };

  if (uniqueDates.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No available slots found.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {uniqueDates.map((date) => {
        const daySlots = groupedSlots[date].sort((a, b) => a.time.localeCompare(b.time));
        const displayDate = new Date(`${date}T00:00:00`).toLocaleString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric'
        });

        return (
          <div key={date}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
              {displayDate}
            </h4>
            <div className="slot-picker-dates" style={{ display: 'flex', gap: '12px' }}>
              {daySlots.map((slot) => {
                const booked = isSlotBooked(slot);
                const selected = selectedDate === slot.date && selectedTime === slot.time;
                
                // Visual states
                let bg = 'var(--bg-elevated)';
                let border = '1px solid var(--border)';
                let color = 'var(--text-primary)';
                let dotColor = 'var(--success)';
                let textDecoration = 'none';
                let opacity = 1;
                let cursor = 'pointer';

                if (booked) {
                  textDecoration = 'line-through';
                  dotColor = 'var(--error)';
                  cursor = 'not-allowed';
                  opacity = 0.5;
                } else if (selected) {
                  bg = 'var(--accent-gold-dim)';
                  border = '1px solid var(--accent-gold)';
                  dotColor = 'var(--accent-gold)';
                  color = 'var(--accent-gold)';
                }

                return (
                  <button
                    key={`${slot.date}-${slot.time}`}
                    onClick={() => {
                      if (!booked && onSelect) {
                        onSelect(slot.date, slot.time);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      borderRadius: 'var(--radius-sm)',
                      background: bg,
                      border: border,
                      color: color,
                      textDecoration: textDecoration,
                      opacity: opacity,
                      cursor: cursor,
                      transition: 'all var(--transition)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9rem',
                      fontWeight: selected ? 700 : 500,
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!booked && !selected) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'var(--border-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!booked && !selected) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor }} />
                    {formatTime(slot.time)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SlotPicker;
