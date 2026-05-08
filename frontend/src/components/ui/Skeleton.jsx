import React from 'react';

export const ExpertCardSkeleton = () => (
  <div className="card skeleton-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton" style={{ width: '60%', height: 20 }} />
        <div className="skeleton" style={{ width: '40%', height: 16 }} />
      </div>
    </div>
    <div className="skeleton" style={{ width: '100%', height: 60 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
      <div className="skeleton" style={{ width: '30%', height: 24 }} />
      <div className="skeleton" style={{ width: '20%', height: 24 }} />
    </div>
  </div>
);

export const BookingCardSkeleton = () => (
  <div className="card skeleton-container" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: '1 1 250px' }}>
      <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div className="skeleton" style={{ width: '50%', height: 18 }} />
        <div className="skeleton" style={{ width: '30%', height: 14 }} />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 150px' }}>
      <div className="skeleton" style={{ width: '70%', height: 16 }} />
      <div className="skeleton" style={{ width: '60%', height: 16 }} />
    </div>
    <div style={{ flex: '0 0 auto' }}>
      <div className="skeleton" style={{ width: 100, height: 32, borderRadius: '99px' }} />
    </div>
  </div>
);
