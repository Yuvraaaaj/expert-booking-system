import React, { useState, useEffect, useCallback } from 'react';
import ExpertCard from '../components/expert/ExpertCard';
import Input from '../components/ui/Input';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { getAllExperts } from '../api/expertApi';
import useDebounce from '../hooks/useDebounce';
import { ExpertCardSkeleton } from '../components/ui/Skeleton';

const CATEGORIES = ['All', 'Technology', 'Business', 'Design', 'Marketing', 'Finance', 'Health', 'Legal'];

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);


const ExpertListPage = () => {
  const [experts,  setExperts]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [page,     setPage]     = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const fetchExperts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 9 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category !== 'All') params.category = category;

      const { data } = await getAllExperts(params);
      setExperts(data?.data?.experts || data?.data || data || []);
      setTotalPages(data?.data?.totalPages || 1);
    } catch (err) {
      setError(err.normalized?.message || 'Failed to load experts.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, page]);

  // Reset page when search or category changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  useEffect(() => { fetchExperts(); }, [fetchExperts]);

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* ── Hero Header ── */}
        <div style={{ marginBottom: '40px', animation: 'fadeIn 0.5s ease forwards' }}>
          <p className="label-text" style={{ marginBottom: '12px' }}>🌟 Discover Expertise</p>
          <h1 className="section-title">
            Find Your{' '}
            <span className="gold-text">Expert</span>
          </h1>
          <div style={{ height: '3px', width: '60px', background: 'var(--accent-gold)', marginTop: '8px', borderRadius: '4px' }} />
          <p className="section-subtitle" style={{ marginTop: '16px' }}>
            Book real-time sessions with world-class professionals across every domain.
          </p>
        </div>

        {/* ── Controls ── */}
        <div style={{
          display:        'flex',
          flexWrap:       'wrap',
          gap:            '16px',
          alignItems:     'flex-start',
          marginBottom:   '32px',
        }}>
          <div style={{ flex: '1 1 100%' }}>
            <Input
              id="expert-search"
              placeholder="Search by name, skill, or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<SearchIcon />}
            />
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '8px', flex: '1 1 100%' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding:      '8px 16px',
                  borderRadius: '99px',
                  border:       `1px solid ${category === cat ? 'var(--accent-gold)' : 'var(--border)'}`,
                  background:   category === cat ? 'var(--accent-gold)' : 'var(--bg-elevated)',
                  color:        category === cat ? '#0A0F1E' : 'var(--text-secondary)',
                  fontSize:     '0.82rem',
                  fontWeight:   600,
                  cursor:       'pointer',
                  transition:   'all var(--transition)',
                  fontFamily:   'var(--font-body)',
                  whiteSpace:   'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid-auto">
            {Array.from({ length: 9 }).map((_, i) => <ExpertCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load experts"
            message={error}
            onRetry={fetchExperts}
          />
        ) : experts.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No experts found"
            description="Try adjusting your search terms or selecting a different category."
          />
        ) : (
          <>
            <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {experts.map((expert) => (
                <ExpertCard key={expert._id} expert={expert} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px' }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    style={{
                      padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                      background: page === i + 1 ? 'var(--accent-gold)' : 'var(--bg-elevated)',
                      border: `1px solid ${page === i + 1 ? 'var(--accent-gold)' : 'var(--border)'}`,
                      color: page === i + 1 ? '#0A0F1E' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExpertListPage;
