import { motion, useReducedMotion } from 'framer-motion';

const SURFACE_STYLES = {
  nocturne: {
    bg: 'var(--surface-nocturne-glass)',
    color: '#F8FAFC',
    border: '1px solid var(--border-navy)',
    shadow: 'inset 0 1px 1px rgba(203, 185, 255, 0.22), var(--shadow-navy)',
    dark: true,
  },
  lavender: {
    bg: 'var(--surface-lavender-haze)',
    color: '#0B1021',
    border: '1px solid rgba(255, 255, 255, 0.72)',
    shadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.92), var(--shadow-haze)',
    dark: false,
  },
  volt: {
    bg: 'radial-gradient(ellipse 80% 65% at 85% 15%, rgba(255, 255, 255, 0.35) 0%, transparent 55%), linear-gradient(145deg, #E3FF47 0%, #D9FF00 58%, #BEE600 100%)',
    color: '#0B1021',
    border: '1px solid rgba(11, 16, 33, 0.16)',
    shadow: '0 16px 36px rgba(217, 255, 0, 0.18)',
    dark: false,
  },
};

export function ArchitecturalBentoCard({
  tone = 'nocturne',
  variant = 'horizontal',
  tag,
  headline,
  body,
  cta,
  imageSrc,
  imageAlt,
  videoSrc,
  posterSrc,
  className = '',
  style,
  delay = 0,
}) {
  const prefersReduced = useReducedMotion();
  const s = SURFACE_STYLES[tone] || SURFACE_STYLES.nocturne;
  const isHorizontal = variant === 'horizontal';

  const mediaNode = videoSrc ? (
    <video
      src={videoSrc}
      poster={posterSrc}
      autoPlay
      loop
      muted
      playsInline
      className="ar-zoom-media"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  ) : imageSrc ? (
    <img
      src={imageSrc}
      alt={imageAlt}
      className="ar-zoom-media"
      loading="lazy"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  ) : null;

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={`ar-hover-card ${isHorizontal ? 'ar-split-asym' : ''} ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-card)',
        background: s.bg,
        color: s.color,
        border: s.border,
        boxShadow: s.shadow,
        padding: 'clamp(1.5rem, 3vw, 2.45rem)',
        display: isHorizontal ? undefined : 'flex',
        flexDirection: isHorizontal ? undefined : 'column',
        justifyContent: isHorizontal ? undefined : 'space-between',
        gap: '1.35rem',
        ...style,
      }}
    >
      {!isHorizontal && mediaNode && (
        <div
          style={{
            borderRadius: 'var(--radius-tile)',
            overflow: 'hidden',
            aspectRatio: variant === 'tall' ? '16 / 10' : '16 / 8.5',
            border: s.dark ? '1px solid rgba(203,185,255,0.2)' : '1px solid rgba(11,16,33,0.14)',
          }}
        >
          {mediaNode}
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.75rem', alignContent: 'start' }}>
        {tag && (
          <span
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: s.dark ? 'var(--lavender-base)' : '#0B1021',
            }}
          >
            {tag}
          </span>
        )}
        <h3 style={{ fontSize: variant === 'panoramic' ? 'clamp(1.75rem, 3vw, 2.5rem)' : 'clamp(1.45rem, 2.5vw, 2.05rem)', lineHeight: 1.08 }}>
          {headline}
        </h3>
        {body && (
          <p style={{ color: s.dark ? 'var(--text-muted)' : '#0B1021', lineHeight: 1.6 }}>
            {body}
          </p>
        )}
        {cta && <div style={{ marginTop: '0.5rem' }}>{cta}</div>}
      </div>

      {isHorizontal && mediaNode && (
        <div
          style={{
            borderRadius: 'var(--radius-tile)',
            overflow: 'hidden',
            aspectRatio: '16 / 10',
            border: s.dark ? '1px solid rgba(203,185,255,0.2)' : '1px solid rgba(11,16,33,0.14)',
          }}
        >
          {mediaNode}
        </div>
      )}
    </motion.div>
  );
}

/** Cathedral / Gable Arch-Cropped Showcase Card — Distinct Architectural Silhouette */
export function ArchFramedCard({
  tone = 'lavender',
  badge,
  tag,
  headline,
  body,
  imageSrc,
  imageAlt,
  metrics = [],
  cta,
  className = '',
  delay = 0.06,
}) {
  const prefersReduced = useReducedMotion();
  const s = SURFACE_STYLES[tone] || SURFACE_STYLES.lavender;

  return (
    <motion.article
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={`ar-hover-card ar-arch-card ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-card)',
        background: s.bg,
        color: s.color,
        border: s.border,
        boxShadow: s.shadow,
        padding: 'clamp(1.5rem, 2.8vw, 2.25rem)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1.25rem',
      }}
    >
      {badge && (
        <span
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 3,
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            background: '#0B1021',
            color: 'var(--volt)',
            fontSize: '0.82rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
          }}
        >
          {badge}
        </span>
      )}

      {imageSrc && (
        <div
          className="ar-arch-aperture"
          style={{
            border: s.dark ? '2px solid rgba(203,185,255,0.3)' : '2px solid rgba(11,16,33,0.16)',
          }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className="ar-zoom-media"
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.65rem' }}>
        {tag && (
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: s.dark ? 'var(--lavender-base)' : '#0B1021' }}>
            {tag}
          </span>
        )}
        <h3 style={{ fontSize: 'clamp(1.45rem, 2.4vw, 1.95rem)', lineHeight: 1.08 }}>{headline}</h3>
        {body && <p style={{ color: s.dark ? 'var(--text-muted)' : '#0B1021', lineHeight: 1.55 }}>{body}</p>}
      </div>

      {metrics.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          {metrics.map((m) => (
            <span
              key={m}
              style={{
                padding: '0.32rem 0.72rem',
                borderRadius: '999px',
                background: s.dark ? 'rgba(203,185,255,0.14)' : 'rgba(11,16,33,0.09)',
                fontSize: '0.84rem',
                fontWeight: 700,
              }}
            >
              {m}
            </span>
          ))}
        </div>
      )}

      {cta && <div>{cta}</div>}
    </motion.article>
  );
}

/** Floating Frosted Glass Telemetry Strip Card */
export function FloatingTelemetryStripCard({ eyebrow, title, stats = [], actions }) {
  return (
    <div className="ar-telemetry-strip">
      <div style={{ display: 'grid', gap: '0.35rem', maxWidth: 420 }}>
        {eyebrow && (
          <span style={{ color: 'var(--volt)', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.03em' }}>
            {eyebrow}
          </span>
        )}
        <strong style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.6rem)', lineHeight: 1.15 }}>{title}</strong>
      </div>

      <div className="ar-telemetry-metrics">
        {stats.map(([val, lbl]) => (
          <div key={lbl} className="ar-telemetry-cell">
            <strong>{val}</strong>
            <span>{lbl}</span>
          </div>
        ))}
      </div>

      {actions && <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

export function LavenderStagePanel({
  icon,
  title,
  subtitle,
  children,
  footerNote,
  maxWidth = 860,
}) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      style={{
        width: '100%',
        maxWidth,
        marginInline: 'auto',
        background: 'var(--surface-lavender-haze)',
        color: '#0B1021',
        borderRadius: 'var(--radius-card)',
        padding: 'clamp(1.65rem, 3.2vw, 2.65rem)',
        border: '1px solid rgba(255, 255, 255, 0.76)',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.92), var(--shadow-haze)',
        display: 'grid',
        gap: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {icon && (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                backgroundColor: '#0B1021',
                color: 'var(--volt)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <h2 style={{ fontSize: 'clamp(1.45rem, 2.6vw, 2rem)', letterSpacing: '-0.025em', color: '#0B1021' }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: '0.95rem', color: '#0B1021', marginTop: 2 }}>{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {children}

      {footerNote && (
        <div style={{ borderTop: '1px solid rgba(11,16,33,0.14)', paddingTop: '0.8rem', fontSize: '0.875rem', fontWeight: 700, color: '#0B1021' }}>
          {footerNote}
        </div>
      )}
    </motion.div>
  );
}
