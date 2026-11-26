import { Check, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { LavenderStagePanel } from '../components/layout/Primitives';
import { useToast } from '../components/toast/ToastViewport';

function BeforeAfterFrame({ item, height = 340 }) {
  const [split, setSplit] = useState(52);
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <div
        style={{
          position: 'relative',
          height,
          borderRadius: 'var(--radius-tile)',
          overflow: 'hidden',
          border: '1px solid rgba(203, 185, 255, 0.25)',
        }}
      >
        <img src={item.afterImage} alt={`${item.title} completed`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, width: `${split}%`, overflow: 'hidden', borderRight: '3px solid var(--volt)' }}>
          <img src={item.beforeImage} alt={`${item.title} before`} style={{ width: 920, maxWidth: 'none', height: '100%', objectFit: 'cover' }} />
        </div>
        <span style={{ position: 'absolute', top: 14, left: 14, padding: '0.35rem 0.85rem', borderRadius: '999px', background: '#0B1021', color: '#F8FAFC', fontSize: '0.875rem', fontWeight: 700 }}>
          Before
        </span>
        <span style={{ position: 'absolute', top: 14, right: 14, padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'var(--volt)', color: '#0B1021', fontSize: '0.875rem', fontWeight: 800 }}>
          After · {item.durationDays}d
        </span>
      </div>
      <input aria-label={`Before/after reveal slider for ${item.title}`} type="range" min={12} max={88} value={split} onChange={(e) => setSplit(Number(e.target.value))} />
    </div>
  );
}

export default function ProjectsPage({ onNavigate }) {
  const { notify } = useToast();
  const [filter, setFilter] = useState('All');
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    homeownerName: '',
    city: 'Seattle, WA',
    service: 'Roof replacement',
    rating: 5,
    comment: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const q = filter === 'All' ? '' : `?service=${encodeURIComponent(filter)}`;
    apiFetch(`/showcase${q}`).then(setItems).catch(() => {});
  }, [filter]);

  useEffect(() => {
    apiFetch('/reviews').then(setReviews).catch(() => {});
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/reviews', { method: 'POST', body: JSON.stringify(reviewForm) });
      setSubmitted(true);
      notify('Review queued for moderation', 'Thank you for sharing feedback.', 'success');
      setReviewForm({ homeownerName: '', city: 'Seattle, WA', service: 'Roof replacement', rating: 5, comment: '' });
    } catch (error) {
      notify(error?.message || 'Unable to submit review right now.', 'error');
    }
  };

  return (
    <div style={{ paddingBottom: '4.5rem' }}>
      <section className="ar-section">
        <div className="ar-container" style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'end' }}>
            <div>
              <span style={{ color: 'var(--lavender-base)', fontWeight: 700 }}>Architectural Case Studies</span>
              <h1 style={{ marginTop: 4 }}>
                Tear-off to <span className="ar-kw-volt">finish.</span>
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
              {['All', 'Roof replacement', 'Roof installation', 'Roof repair'].map((s) => (
                <button key={s} type="button" className={filter === s ? 'btn-primary' : 'btn-lavender'} onClick={() => setFilter(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Alternating Asymmetric Span-12 Hero Case + 6:6 Secondary Cases */}
          <div className="ar-bento-12">
            {items.map((item, idx) => (
              <article
                key={item._id}
                className={idx === 0 ? 'ar-col-12 ar-hover-card' : 'ar-col-6 ar-hover-card'}
                style={{
                  borderRadius: 'var(--radius-card)',
                  background: idx % 2 === 1 ? 'var(--surface-lavender-haze)' : 'var(--surface-nocturne-glass)',
                  color: idx % 2 === 1 ? '#0B1021' : '#F8FAFC',
                  border: idx % 2 === 1 ? '1px solid rgba(255,255,255,0.75)' : '1px solid var(--border-navy)',
                  padding: 'clamp(1.5rem, 3vw, 2.25rem)',
                  display: 'grid',
                  gap: '1.1rem',
                }}
              >
                <BeforeAfterFrame item={item} height={idx === 0 ? 410 : 300} />
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: idx % 2 === 1 ? '#0B1021' : 'var(--volt)' }}>
                    {item.city}, {item.state} · {item.roofSqFt.toLocaleString()} sq ft · {item.materialName}
                  </span>
                  <h3 style={{ marginTop: 4 }}>{item.title}</h3>
                  <p style={{ marginTop: 6, color: idx % 2 === 1 ? '#0B1021' : 'var(--text-muted)' }}>{item.summary}</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {item.highlights.map((h) => (
                    <span key={h} style={{ fontSize: '0.875rem', fontWeight: 700, padding: '0.32rem 0.75rem', borderRadius: '999px', background: idx % 2 === 1 ? '#0B1021' : 'rgba(203,185,255,0.14)', color: idx % 2 === 1 ? 'var(--volt)' : '#F8FAFC' }}>
                      <Check size={13} style={{ display: 'inline', marginRight: 4 }} /> {h}
                    </span>
                  ))}
                  {idx === 0 && (
                    <button type="button" className="btn-primary" style={{ marginLeft: 'auto', minHeight: 38 }} onClick={() => onNavigate('estimate')}>
                      Scope Similar System
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {reviews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginTop: '0.75rem' }}>
              {reviews.map((r) => (
                <div key={r._id} style={{ background: 'var(--surface-nocturne-glass)', border: '1px solid var(--border-navy)', borderRadius: 'var(--radius-tile)', padding: '1.4rem' }}>
                  <strong style={{ color: 'var(--volt)' }}>{'★'.repeat(r.rating)}</strong>
                  <p style={{ marginTop: '0.45rem', color: 'var(--text-muted)' }}>{r.comment}</p>
                  <strong style={{ display: 'block', marginTop: '0.6rem' }}>{r.homeownerName} · {r.city}</strong>
                </div>
              ))}
            </div>
          )}

          <LavenderStagePanel
            maxWidth={820}
            icon={<MessageSquare size={20} />}
            title="Submit Homeowner Review"
            subtitle="Verified reviews appear across Auren showcase panels after approval."
          >
            <form onSubmit={submitReview} className="ar-form-box">
              <div className="ar-form-row">
                <div>
                  <label className="ar-label" htmlFor="rev-name">Your Name *</label>
                  <input id="rev-name" className="ar-input" required value={reviewForm.homeownerName} onChange={(e) => setReviewForm((f) => ({ ...f, homeownerName: e.target.value }))} />
                </div>
                <div>
                  <label className="ar-label" htmlFor="rev-city">City, State *</label>
                  <input id="rev-city" className="ar-input" required value={reviewForm.city} onChange={(e) => setReviewForm((f) => ({ ...f, city: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="ar-label" htmlFor="rev-srv">Completed Service</label>
                <select id="rev-srv" className="ar-input" value={reviewForm.service} onChange={(e) => setReviewForm((f) => ({ ...f, service: e.target.value }))}>
                  <option value="Roof replacement">Roof replacement</option>
                  <option value="Roof installation">Roof installation</option>
                  <option value="Roof repair">Roof repair</option>
                  <option value="Roof inspections">Roof inspections</option>
                </select>
              </div>
              <div>
                <label className="ar-label" htmlFor="rev-comment">Your Experience *</label>
                <textarea id="rev-comment" rows={3} required minLength={10} className="ar-input" style={{ minHeight: 88 }} value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} />
              </div>
              <button type="submit" className="btn-secondary" style={{ width: '100%' }}>Submit Review for Moderation</button>
              {submitted && <strong style={{ color: '#0B1021' }}>Thank you — queued for approval in Operations Console.</strong>}
            </form>
          </LavenderStagePanel>
        </div>
      </section>
    </div>
  );
}
