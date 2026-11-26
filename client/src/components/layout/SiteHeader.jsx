import { Menu, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SITE_CONFIG } from '../../config/siteConfig';

function BrandMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M5 29.5 24 9l19 20.5" stroke="#CBB9FF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 28.5v11h24v-11" stroke="#F8FAFC" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 39.5V27h8v12.5" stroke="#D9FF00" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const LINKS = [
  ['estimate', 'Estimator'],
  ['inspections', 'Inspections'],
  ['projects', 'Projects'],
  ['portal', 'Portal'],
  ['about', 'About'],
  ['contact', 'Contact'],
  ['admin', 'Admin'],
];

export default function SiteHeader({ currentView, onNavigate, onOpenMenu }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-nav)',
        backgroundColor: scrolled ? 'rgba(11, 16, 33, 0.9)' : '#0B1021',
        backdropFilter: scrolled ? 'blur(18px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(160%)' : 'none',
        borderBottom: '1px solid rgba(203, 185, 255, 0.16)',
        transition: 'background-color 220ms ease',
      }}
    >
      <div
        className="ar-container"
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="ar-plain-link"
          style={{
            background: 'rgba(203, 185, 255, 0.08)',
            border: '1px solid rgba(203, 185, 255, 0.22)',
            borderRadius: '999px',
            padding: '0.38rem 0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 800,
            fontSize: '0.98rem',
            letterSpacing: '-0.02em',
            color: '#F8FAFC',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <BrandMark />
          <span>{SITE_CONFIG.brandName}</span>
        </button>

        <nav aria-label="Main navigation" className="ar-desktop-nav">
          {LINKS.map(([id, label]) => {
            const active = currentView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                style={{
                  background: active ? 'rgba(203, 185, 255, 0.14)' : 'transparent',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--volt)' : '#F8FAFC',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <a
            href={SITE_CONFIG.phoneHref}
            className="ar-plain-link ar-desktop-nav"
            style={{
              gap: '0.35rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--lavender-soft)',
              whiteSpace: 'nowrap',
            }}
          >
            <Phone size={14} />
            <span>{SITE_CONFIG.phone}</span>
          </a>

          <button
            type="button"
            className="btn-primary ar-desktop-nav"
            style={{ minHeight: 38, padding: '0.45rem 1.05rem', fontSize: '0.88rem' }}
            onClick={() => onNavigate('estimate')}
          >
            Estimate Roof
          </button>

          <button
            type="button"
            className="ar-mobile-only"
            onClick={onOpenMenu}
            aria-label="Open menu"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--volt)',
              color: '#0B1021',
              border: 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
