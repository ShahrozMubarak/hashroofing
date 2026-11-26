import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { SITE_CONFIG } from '../../config/siteConfig';

const ITEMS = [
  ['home', 'Home'],
  ['estimate', 'Scope Estimator'],
  ['inspections', 'Inspections & Storm'],
  ['projects', 'Case Studies'],
  ['portal', 'Client Portal'],
  ['about', 'About Auren'],
  ['contact', 'Contact'],
  ['admin', 'Operations Console'],
];

export default function MobileDrawer({ isOpen, onClose, onNavigate, theme = 'dark', onToggleTheme }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
          data-lenis-prevent="true"
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-drawer)',
            background: '#0B1021',
            color: '#F8FAFC',
            padding: '1.5rem',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            gap: '1.5rem',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--volt)' }}>{SITE_CONFIG.brandName}</strong>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1px solid rgba(203,185,255,0.28)',
                background: 'rgba(203,185,255,0.12)',
                color: '#F8FAFC',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <nav style={{ display: 'grid', gap: '0.6rem', alignContent: 'start' }}>
            {ITEMS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onNavigate(id);
                  onClose();
                }}
                style={{
                  textAlign: 'left',
                  padding: '0.9rem 1rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(203,185,255,0.2)',
                  background: 'rgba(22, 31, 66, 0.8)',
                  color: '#F8FAFC',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          <div style={{ display: 'grid', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn-crystal"
              style={{ width: '100%' }}
              onClick={onToggleTheme}
            >
              {theme === 'light' ? 'Switch to Nocturne Dark Mode' : 'Switch to Porcelain Light Mode'}
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={() => {
                onNavigate('estimate');
                onClose();
              }}
            >
              Estimate Roof
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
