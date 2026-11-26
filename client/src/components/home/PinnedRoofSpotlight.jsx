import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function PinnedRoofSpotlight({ onNavigate }) {
  const containerRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const imgScale = useTransform(scrollYProgress, [0.15, 0.5, 0.85], [0.94, 1.04, 0.98]);

  return (
    <section
      ref={containerRef}
      className="ar-section"
      style={{ paddingBlock: 'clamp(3rem, 5.5vw, 5rem)' }}
    >
      <div className="ar-container">
        <div className="ar-bento-12" style={{ alignItems: 'center' }}>
          {/* Left 7 cols: Scaling Architectural Elevation Photo */}
          <div className="ar-col-7">
            <motion.div
              style={
                prefersReduced
                  ? {
                      borderRadius: 'var(--radius-card)',
                      overflow: 'hidden',
                      border: '1px solid rgba(203, 185, 255, 0.26)',
                      boxShadow: 'var(--shadow-navy)',
                    }
                  : {
                      scale: imgScale,
                      borderRadius: 'var(--radius-card)',
                      overflow: 'hidden',
                      border: '1px solid rgba(203, 185, 255, 0.26)',
                      boxShadow: 'var(--shadow-navy)',
                    }
              }
            >
              <img
                src="/images/house-roof-after.jpg"
                alt="Completed residence with matte standing seam steel roof"
                style={{ width: '100%', aspectRatio: '16 / 11', objectFit: 'cover', display: 'block' }}
              />
            </motion.div>
          </div>

          {/* Right 5 cols: Stacked Spec Metrics & Story in Liquid Crystal */}
          <div
            className="ar-col-5 ar-crystal-light"
            style={{
              background: 'var(--surface-lavender-haze)',
              backdropFilter: 'var(--crystal-blur)',
              WebkitBackdropFilter: 'var(--crystal-blur)',
              color: '#0B1021',
              borderRadius: 'var(--radius-card)',
              padding: 'clamp(1.85rem, 3.6vw, 2.75rem)',
              border: '1px solid rgba(255, 255, 255, 0.84)',
              boxShadow: 'var(--shadow-haze)',
              display: 'grid',
              gap: '1.35rem',
            }}
          >
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>PNW Envelope Telemetry</span>
            <h2>
              Engineered for coastal gusts.
            </h2>
            <p style={{ color: '#0B1021', lineHeight: 1.65 }}>
              Every roof specification pairs regional uplift multipliers, continuous ice-shield valleys, and vented ridge airflow.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                ['140 mph', 'Wind uplift'],
                ['Class A', 'Fire shield'],
                ['50 yrs', 'Seam rating'],
              ].map(([val, lbl]) => (
                <div
                  key={lbl}
                  style={{
                    background: 'rgba(11, 16, 33, 0.86)',
                    backdropFilter: 'blur(12px)',
                    color: '#F8FAFC',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    padding: '0.85rem 0.65rem',
                    textAlign: 'center',
                  }}
                >
                  <strong style={{ color: 'var(--lavender-base)', display: 'block', fontSize: '1.05rem' }}>{val}</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--lavender-soft)' }}>{lbl}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <button type="button" className="btn-secondary" onClick={() => onNavigate('estimate')}>
                Calculate Price
              </button>
              <button type="button" className="btn-crystal" onClick={() => onNavigate('portal')} style={{ background: 'rgba(11,16,33,0.08)', color: '#0B1021', borderColor: 'rgba(11,16,33,0.22)' }}>
                Explore Client Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
