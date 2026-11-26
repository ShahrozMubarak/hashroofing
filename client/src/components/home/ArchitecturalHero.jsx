import { ArrowUpRight, Compass, Hammer, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ArchitecturalHero({ onNavigate, onAnchor }) {
  const [scrollY, setScrollY] = useState(0);
  const [isAfter, setIsAfter] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerTransition = (targetState) => {
    setIsTransitioning(true);
    setIsAfter(targetState);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 1750);
  };

  useEffect(() => {
    if (isPaused) return undefined;
    const interval = setInterval(() => {
      triggerTransition(!isAfter);
    }, 5200);
    return () => clearInterval(interval);
  }, [isAfter, isPaused]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  const imageParallax = Math.min(scrollY * 0.14, 84);
  const imageScale = 1 + Math.min(scrollY * 0.00018, 0.04);
  const textShift = Math.min(scrollY * 0.14, 56);
  const textOpacity = Math.max(1 - scrollY / 720, 0);

  return (
    <section
      className={`arch-hero-section ${isAfter ? 'roof-state-after' : 'roof-state-before'} ${
        isTransitioning ? 'roof-state-transitioning' : ''
      }`}
      aria-label="Auren Roofing Architecture Hero with Live Before and After Wipe"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Full-Hero Animated Broken-to-Finished Roof Wipe Layer */}
      <div
        className="arch-hero-media"
        style={{
          transform: `translate3d(0, ${imageParallax}px, 0) scale(${imageScale})`,
        }}
      >
        <img
          src="/images/solar-house-before.jpg"
          alt="Original estate with weathered, broken shingle roof prior to Auren restoration"
          className="arch-hero-img arch-img-before"
          loading="eager"
        />

        <div className="arch-wipe-container">
          <img
            src="/images/solar-house-after.jpg"
            alt="Completed home featuring Auren standing-seam architectural roof system"
            className="arch-hero-img arch-img-after"
            fetchPriority="high"
            loading="eager"
          />
        </div>

        {/* Moving Luminous Solar Volt + Lavender Wipe Line */}
        <div className="arch-transition-line" aria-hidden="true">
          <div className="transition-line-glow" />
          <div className="transition-line-beam" />
          <span className="transition-line-tag">Envelope Filter</span>
        </div>
      </div>

      {/* Nocturne Navy & Lavender Atmospheric Gradient Overlays */}
      <div className="arch-hero-gradient-overlay" aria-hidden="true" />
      <div className="arch-hero-top-vignette" aria-hidden="true" />

      {/* Interactive Filter State Toggle Pill */}
      <button
        type="button"
        className="arch-transition-pill"
        onClick={() => triggerTransition(!isAfter)}
        title="Click to toggle between weathered damaged roof and completed Auren roof system"
      >
        <span className={`transition-pulse-dot ${isAfter ? 'is-after' : 'is-before'}`} />
        <span className="transition-pill-title">
          {isAfter ? 'New Architectural Roof Active' : 'Broken / Weathered Roof View'}
        </span>
        <span className="transition-pill-switch">
          <RefreshCw size={12} className="spin-slow" />
          <span>Switch Filter</span>
        </span>
      </button>

      {/* Hero Editorial Foreground & 4-Pillar Strip */}
      <div
        className="arch-hero-inner ar-container"
        style={{
          transform: `translate3d(0, ${textShift}px, 0)`,
          opacity: textOpacity,
        }}
      >
        <div className="arch-hero-copy">
          <div className="arch-eyebrow-pill arch-entrance-1">
            Seattle · Bellevue · Tacoma · Spokane · Portland
          </div>
          <h1 className="arch-hero-headline arch-entrance-1">
            Roofing under <span className="ar-kw-volt">night-sky</span> engineering.
          </h1>
          <p className="arch-hero-supporting arch-entrance-2">
            Standing seam steel, composite slate, and storm-rated envelopes engineered cleanly — watch weathered sheathing transform in real time.
          </p>

          <div className="arch-hero-actions arch-entrance-3">
            <button type="button" className="btn-primary arch-btn-hero" onClick={() => onNavigate('estimate')}>
              <span>Launch Scope Calculator</span>
              <ArrowUpRight size={17} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              className="arch-cta-secondary"
              onClick={() => {
                if (onAnchor) onAnchor('disciplines');
                else onNavigate('projects');
              }}
            >
              <span>Explore Our Systems</span>
              <ArrowUpRight size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Nocturne Glass 4-Pillar Strip */}
        <div className="arch-pillars-strip arch-entrance-4">
          <div className="arch-pillar-item">
            <span className="arch-pillar-icon"><ShieldCheck size={16} strokeWidth={2.2} /></span>
            <div>
              <strong>140 mph Wind Rating</strong>
              <p>Marine coastal &amp; foothill specs</p>
            </div>
          </div>

          <div className="arch-pillar-item">
            <span className="arch-pillar-icon"><Sparkles size={16} strokeWidth={2.2} /></span>
            <div>
              <strong>Considered Geometry</strong>
              <p>Slate, metal &amp; Class-4 composites</p>
            </div>
          </div>

          <div className="arch-pillar-item">
            <span className="arch-pillar-icon"><Hammer size={16} strokeWidth={2.2} /></span>
            <div>
              <strong>4h Storm Dispatch</strong>
              <p>Emergency tarping &amp; claim packets</p>
            </div>
          </div>

          <div className="arch-pillar-item">
            <span className="arch-pillar-icon"><Compass size={16} strokeWidth={2.2} /></span>
            <div>
              <strong>8-Stage Client Portal</strong>
              <p>Live crew logs &amp; PDF warranties</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
