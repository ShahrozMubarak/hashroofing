import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext({
  notify: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const prefersReduced = useReducedMotion();

  const dismiss = useCallback((id) => {
    const t = timersRef.current.get(id);
    if (t) window.clearTimeout(t);
    timersRef.current.delete(id);
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (title, descriptionOrVariant = 'info', explicitVariant) => {
      let variant = 'info';
      let description;
      if (explicitVariant) {
        variant = explicitVariant;
        description = descriptionOrVariant;
      } else if (['page', 'error', 'success', 'info'].includes(descriptionOrVariant)) {
        variant = descriptionOrVariant;
      } else {
        description = descriptionOrVariant;
      }

      const isTopPill = variant === 'page' || variant === 'error';
      const id = isTopPill ? 'ar-top-pill' : `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      setToasts((prev) => {
        if (isTopPill) {
          const rest = prev.filter((t) => t.id !== 'ar-top-pill');
          return [...rest, { id, title, description, variant }];
        }
        return [...prev.slice(-2), { id, title, description, variant }];
      });

      const old = timersRef.current.get(id);
      if (old) window.clearTimeout(old);
      timersRef.current.set(
        id,
        window.setTimeout(() => dismiss(id), isTopPill ? 2400 : 3800),
      );
    },
    [dismiss],
  );

  const activeTopPill = [...toasts].reverse().find((t) => t.id === 'ar-top-pill');
  const cardToasts = toasts.filter((t) => t.id !== 'ar-top-pill');

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          top: '4.1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 'var(--z-toast)',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence mode="wait">
          {activeTopPill && (
            <motion.div
              key={activeTopPill.title}
              role="status"
              onClick={() => dismiss(activeTopPill.id)}
              initial={prefersReduced ? false : { opacity: 0, y: -5, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 1rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: activeTopPill.variant === 'error' ? '#D9FF00' : 'rgba(203, 185, 255, 0.96)',
                color: '#0B1021',
                fontSize: '0.875rem',
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(4, 7, 18, 0.45)',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  backgroundColor: '#0B1021',
                }}
              />
              <span>{activeTopPill.title}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div aria-live="polite" className="ar-toast-cards">
        <AnimatePresence>
          {cardToasts.map((t) => (
            <motion.div
              key={t.id}
              role="status"
              onClick={() => dismiss(t.id)}
              initial={prefersReduced ? false : { opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.78rem 1rem',
                borderRadius: '16px',
                background: '#EBE4FF',
                color: '#0B1021',
                border: '1px solid rgba(11, 16, 33, 0.14)',
                boxShadow: 'var(--shadow-navy)',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 24,
                  borderRadius: 3,
                  background: t.variant === 'success' ? '#D9FF00' : '#0B1021',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800 }}>{t.title}</div>
                {t.description && (
                  <div style={{ fontSize: '0.875rem', color: '#0B1021', marginTop: 2 }}>{t.description}</div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
