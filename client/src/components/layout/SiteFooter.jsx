import { SITE_CONFIG } from '../../config/siteConfig';

export default function SiteFooter({ onNavigate }) {
  const linkBtn = (id, label) => (
    <button
      key={id + label}
      type="button"
      onClick={() => onNavigate(id)}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        textAlign: 'left',
        fontSize: '0.9375rem',
        fontWeight: 500,
        color: 'var(--lavender-soft)',
        textDecoration: 'underline',
        textUnderlineOffset: 3,
      }}
    >
      {label}
    </button>
  );

  return (
    <footer
      style={{
        background: 'var(--bg-footer)',
        color: '#F8FAFC',
        borderTop: '1px solid rgba(203, 185, 255, 0.2)',
        paddingBlock: '3.5rem 2.25rem',
        marginTop: '2.5rem',
      }}
    >
      <div className="ar-container" style={{ display: 'grid', gap: '2.25rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
          }}
        >
          <div style={{ display: 'grid', gap: '0.6rem', alignContent: 'start' }}>
            <strong style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--volt)' }}>
              {SITE_CONFIG.brandName}
            </strong>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>{SITE_CONFIG.tagline}</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--lavender-base)' }}>{SITE_CONFIG.officeAddress}</p>
          </div>

          <div style={{ display: 'grid', gap: '0.5rem', alignContent: 'start' }}>
            <strong style={{ fontSize: '0.9375rem', marginBottom: '0.2rem' }}>Engineering &amp; Tools</strong>
            {linkBtn('estimate', 'ZIP & Scope Calculator')}
            {linkBtn('inspections', 'Book Hub Inspection')}
            {linkBtn('inspections', 'Emergency Storm Triage')}
            {linkBtn('projects', 'Architectural Case Studies')}
          </div>

          <div style={{ display: 'grid', gap: '0.5rem', alignContent: 'start' }}>
            <strong style={{ fontSize: '0.9375rem', marginBottom: '0.2rem' }}>Homeowners &amp; Ops</strong>
            {linkBtn('portal', 'Client Project Portal')}
            {linkBtn('portal', 'Verify Warranty Certificate')}
            {linkBtn('about', 'Standards & Territory')}
            {linkBtn('admin', 'Operations Command')}
          </div>

          <div
            style={{
              background: 'rgba(203, 185, 255, 0.08)',
              border: '1px solid rgba(203, 185, 255, 0.22)',
              borderRadius: '18px',
              padding: '1.15rem',
              display: 'grid',
              gap: '0.5rem',
              alignContent: 'start',
            }}
          >
            <strong style={{ fontSize: '0.95rem', color: '#FFFFFF' }}>Direct Dispatch Desk</strong>
            <a href={SITE_CONFIG.phoneHref}>{SITE_CONFIG.phone}</a>
            <a href={SITE_CONFIG.emailHref}>{SITE_CONFIG.email}</a>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: 6, minHeight: 38, fontSize: '0.875rem' }}
              onClick={() => onNavigate('portal')}
            >
              Open Client Portal
            </button>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(203, 185, 255, 0.14)',
            paddingTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '0.75rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>© {new Date().getFullYear()} {SITE_CONFIG.brandName}. {SITE_CONFIG.licenseDetails}</span>
          <span>60% Nocturne Navy · 30% Lavender Haze · 10% Solar Volt</span>
        </div>
      </div>
    </footer>
  );
}
