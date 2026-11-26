import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { ArchitecturalBentoCard } from '../components/layout/Primitives';
import { SITE_CONFIG } from '../config/siteConfig';

export default function AboutPage({ onNavigate }) {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    apiFetch('/coverage').then(setZones).catch(() => {});
  }, []);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <section className="ar-section">
        <div className="ar-container ar-bento-12">
          <div className="ar-col-5" style={{ display: 'grid', gap: '1rem', alignContent: 'center' }}>
            <span style={{ color: 'var(--volt)', fontWeight: 700 }}>Architecture &amp; Standards</span>
            <h1>
              Built around <span className="ar-kw-lavender">geometry</span>, not hype.
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Headquartered at {SITE_CONFIG.officeAddress}, pairing Pacific Northwest structural spec engineering with homeowner transparency.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn-primary" onClick={() => onNavigate('estimate')}>
                Launch Calculator
              </button>
              <button type="button" className="btn-lavender" onClick={() => onNavigate('projects')}>
                Case Studies
              </button>
            </div>
          </div>

          <ArchitecturalBentoCard
            className="ar-col-7"
            tone="lavender"
            variant="tall"
            tag="01 · Quantified Pre-Work"
            headline="Every deck measured before one shingle lifts."
            body="Attic moisture checks, flashing diagrams, itemized cost brackets, and live job logs inside the Homeowner Portal."
            imageSrc="/images/about-home.webp"
            imageAlt="Contemporary Pacific Northwest residence"
          />
        </div>
      </section>

      {zones.length > 0 && (
        <section className="ar-section">
          <div className="ar-container" style={{ display: 'grid', gap: '1.5rem' }}>
            <h2>
              Active Territory <span className="ar-kw-volt">Hubs</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.15rem' }}>
              {zones.map((z, i) => (
                <div
                  key={z._id}
                  style={{
                    background: i % 2 === 0 ? 'var(--surface-nocturne-glass)' : 'var(--surface-lavender-haze)',
                    color: i % 2 === 0 ? '#F8FAFC' : '#0B1021',
                    border: i % 2 === 0 ? '1px solid var(--border-navy)' : '1px solid rgba(255,255,255,0.75)',
                    borderRadius: 'var(--radius-tile)',
                    padding: '1.4rem',
                    display: 'grid',
                    gap: '0.45rem',
                  }}
                >
                  <strong style={{ fontSize: '1.08rem' }}>{z.hubName}</strong>
                  <span style={{ color: i % 2 === 0 ? 'var(--volt)' : '#0B1021', fontWeight: 700, fontSize: '0.92rem' }}>
                    {z.climateZone}
                  </span>
                  <span style={{ fontSize: '0.9rem' }}>
                    {z.windRatingMph} mph wind · {z.snowLoadPsf} psf snow · {z.inspectionLeadDays}d lead
                  </span>
                  <span style={{ fontSize: '0.875rem', opacity: 0.85 }}>{z.notes}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
