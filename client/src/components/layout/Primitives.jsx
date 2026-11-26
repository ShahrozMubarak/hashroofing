import { motion, useReducedMotion } from 'framer-motion';

const SURFACE_STYLES = {
  nocturne: {
    bg: 'var(--surface-nocturne-glass)',
    color: 'var(--text-on-nocturne)',
    mutedColor: 'var(--muted-on-nocturne)',
    tagColor: 'var(--tag-on-nocturne)',
    border: '1px solid var(--border-navy)',
    shadow: 'var(--shadow-navy)',
    mediaBorder: '1px solid var(--border-navy)',
    orbBg: 'var(--icon-orb-bg)',
    orbColor: 'var(--icon-orb-color)',
    chipBg: 'var(--pill-bg)',
    crystalClass: 'ar-crystal-card',
  },
  lavender: {
    bg: 'var(--surface-lavender-haze)',
    color: '#0B1021',
    mutedColor: '#1E2747',
    tagColor: '#0B1021',
    border: '1px solid rgba(255, 255, 255, 0.85)',
    shadow: 'var(--crystal-shadow-light)',
    mediaBorder: '1px solid rgba(11, 16, 33, 0.14)',
    orbBg: '#0B1021',
    orbColor: '#EBE4FF',
    chipBg: 'rgba(11, 16, 33, 0.08)',
    crystalClass: 'ar-crystal-light',
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
      transition={{ duration: 0.55, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={`ar-hover-card ${s.crystalClass} ${isHorizontal ? 'ar-split-asym' : ''} ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-card)',
        background: s.bg,
        backdropFilter: 'var(--crystal-blur)',
        WebkitBackdropFilter: 'var(--crystal-blur)',
        color: s.color,
        border: s.border,
        boxShadow: s.shadow,
        padding: 'clamp(1.75rem, 3.2vw, 2.65rem)',
        display: isHorizontal ? undefined : 'flex',
        flexDirection: isHorizontal ? undefined : 'column',
        justifyContent: isHorizontal ? undefined : 'space-between',
        gap: '1.5rem',
        ...style,
      }}
    >
      {!isHorizontal && mediaNode && (
        <div
          style={{
            borderRadius: 'var(--radius-tile)',
            overflow: 'hidden',
            aspectRatio: variant === 'tall' ? '16 / 10' : '16 / 9',
            border: s.mediaBorder,
          }}
        >
          {mediaNode}
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.85rem', alignContent: 'start' }}>
        {tag && (
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: s.tagColor }}>
            {tag}
          </span>
        )}
        <h3 style={{ fontSize: variant === 'panoramic' ? 'clamp(1.75rem, 3vw, 2.45rem)' : 'clamp(1.45rem, 2.5vw, 2.05rem)', lineHeight: 1.08 }}>
          {headline}
        </h3>
        {body && (
          <p style={{ color: s.mutedColor, lineHeight: 1.65 }}>
            {body}
          </p>
        )}
        {cta && <div style={{ marginTop: '0.6rem' }}>{cta}</div>}
      </div>

      {isHorizontal && mediaNode && (
        <div
          style={{
            borderRadius: 'var(--radius-tile)',
            overflow: 'hidden',
            aspectRatio: '16 / 10',
            border: s.mediaBorder,
          }}
        >
          {mediaNode}
        </div>
      )}
    </motion.div>
  );
}

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
      transition={{ duration: 0.55, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={`ar-hover-card ar-arch-card ${s.crystalClass} ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-card)',
        background: s.bg,
        backdropFilter: 'var(--crystal-blur)',
        WebkitBackdropFilter: 'var(--crystal-blur)',
        color: s.color,
        border: s.border,
        boxShadow: s.shadow,
        padding: 'clamp(1.75rem, 3vw, 2.5rem)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1.35rem',
      }}
    >
      {badge && (
        <span
          style={{
            position: 'absolute',
            top: 22,
            right: 22,
            zIndex: 3,
            padding: '0.36rem 0.9rem',
            borderRadius: '999px',
            background: 'rgba(11, 16, 33, 0.88)',
            backdropFilter: 'blur(10px)',
            color: '#EBE4FF',
            border: '1px solid rgba(203, 185, 255, 0.4)',
            fontSize: '0.82rem',
            fontWeight: 800,
          }}
        >
          {badge}
        </span>
      )}

      {imageSrc && (
        <div
          className="ar-arch-aperture"
          style={{ border: '2px solid rgba(255,255,255,0.88)' }}
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

      <div style={{ display: 'grid', gap: '0.7rem' }}>
        {tag && (
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: s.tagColor }}>
            {tag}
          </span>
        )}
        <h3 style={{ fontSize: 'clamp(1.45rem, 2.4vw, 1.95rem)', lineHeight: 1.08 }}>{headline}</h3>
        {body && <p style={{ color: s.mutedColor, lineHeight: 1.6 }}>{body}</p>}
      </div>

      {metrics.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {metrics.map((m) => (
            <span
              key={m}
              style={{
                padding: '0.35rem 0.78rem',
                borderRadius: '999px',
                background: s.chipBg,
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

export function CrystalSpecCard({
  tone = 'nocturne',
  icon,
  code,
  title,
  summary,
  specs = [],
  action,
  delay = 0,
}) {
  const prefersReduced = useReducedMotion();
  const s = SURFACE_STYLES[tone] || SURFACE_STYLES.nocturne;

  return (
    <motion.article
      initial={prefersReduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.55, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={`ar-hover-card ${s.crystalClass}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-card)',
        background: s.bg,
        backdropFilter: 'var(--crystal-blur)',
        WebkitBackdropFilter: 'var(--crystal-blur)',
        color: s.color,
        border: s.border,
        boxShadow: s.shadow,
        padding: 'clamp(1.75rem, 3vw, 2.4rem)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1.35rem',
      }}
    >
      <div style={{ display: 'grid', gap: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              display: 'grid',
              placeItems: 'center',
              background: s.orbBg,
              border: s.border,
              color: s.orbColor,
            }}
          >
            {icon}
          </span>
          {code && (
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                padding: '0.32rem 0.78rem',
                borderRadius: '999px',
                background: s.chipBg,
                border: s.border,
              }}
            >
              {code}
            </span>
          )}
        </div>

        <h3 style={{ fontSize: '1.45rem', lineHeight: 1.15 }}>{title}</h3>
        <p style={{ color: s.mutedColor, lineHeight: 1.6 }}>{summary}</p>

        {specs.length > 0 && (
          <div style={{ display: 'grid', gap: '0.55rem', paddingTop: '0.5rem', borderTop: `1px solid ${s.chipBg}` }}>
            {specs.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: s.mutedColor }}>{k}</span>
                <strong style={{ color: s.color }}>{v}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {action && <div>{action}</div>}
    </motion.article>
  );
}

export function FloatingTelemetryStripCard({ eyebrow, title, stats = [], actions }) {
  return (
    <div className="ar-telemetry-strip ar-crystal-card">
      <div style={{ display: 'grid', gap: '0.45rem', maxWidth: 420 }}>
        {eyebrow && (
          <span style={{ color: 'var(--tag-on-nocturne)', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.03em' }}>
            {eyebrow}
          </span>
        )}
        <strong style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.6rem)', lineHeight: 1.18, color: 'var(--text-on-nocturne)' }}>{title}</strong>
      </div>

      <div className="ar-telemetry-metrics">
        {stats.map(([val, lbl]) => (
          <div key={lbl} className="ar-telemetry-cell">
            <strong>{val}</strong>
            <span>{lbl}</span>
          </div>
        ))}
      </div>

      {actions && <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>{actions}</div>}
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
      className="ar-crystal-light"
      style={{
        width: '100%',
        maxWidth,
        marginInline: 'auto',
        background: 'var(--surface-lavender-haze)',
        backdropFilter: 'var(--crystal-blur)',
        WebkitBackdropFilter: 'var(--crystal-blur)',
        color: '#0B1021',
        borderRadius: 'var(--radius-card)',
        padding: 'clamp(1.85rem, 3.6vw, 2.85rem)',
        border: '1px solid rgba(255, 255, 255, 0.84)',
        boxShadow: 'var(--shadow-haze)',
        display: 'grid',
        gap: '1.35rem',
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
                color: '#EBE4FF',
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
        <div style={{ borderTop: '1px solid rgba(11,16,33,0.14)', paddingTop: '0.85rem', fontSize: '0.875rem', fontWeight: 700, color: '#0B1021' }}>
          {footerNote}
        </div>
      )}
    </motion.div>
  );
}
