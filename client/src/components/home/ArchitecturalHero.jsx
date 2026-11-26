import { ArrowUpRight, RefreshCw } from 'lucide-react';
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
    }, 620);
  };

  useEffect(() => {
    if (isPaused) return undefined;
    const interval = setInterval(() => {
      triggerTransition(!isAfter);
    }, 3400);
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

        {/* Fast Luminous Wipe Beam */}
        <div className="arch-transition-line" aria-hidden="true">
          <div className="transition-line-glow" />
          <div className="transition-line-beam" />
        </div>
      </div>

      {/* Soft Gradient Overlay Preserving House Clarity */}
      <div className="arch-hero-gradient-overlay" aria-hidden="true" />
      <div className="arch-hero-top-vignette" aria-hidden="true" />

      {/* Compact Fast Filter Toggle Pill */}
      <button
        type="button"
        className="arch-transition-pill"
        onClick={() => triggerTransition(!isAfter)}
        title="Click to switch between broken weathered roof and finished roof filter"
      >
        <span className={`transition-pulse-dot ${isAfter ? 'is-after' : 'is-before'}`} />
        <span className="transition-pill-title">{isAfter ? 'New Roof' : 'Old Roof'}</span>
        <span className="transition-pill-switch">
          <RefreshCw size={10} />
          <span>Switch</span>
        </span>
      </button>

      {/* Spacious Minimal Editorial Headline & Action Pills */}
      <div
        className="arch-hero-inner ar-container"
        style={{
          transform: `translate3d(0, ${textShift}px, 0)`,
          opacity: textOpacity,
        }}
      >
        <div className="arch-hero-copy">
          <h1 className="arch-hero-headline arch-entrance-1">
            Roofing under <span className="arch-hero-accent">night-sky</span> precision.
          </h1>

          <div className="arch-hero-actions arch-entrance-2">
            <button type="button" className="btn-primary arch-btn-hero" onClick={() => onNavigate('estimate')}>
              <span>Estimate Your Roof</span>
              <ArrowUpRight size={17} strokeWidth={2.4} />
            </button>

            <button
              type="button"
              className="arch-cta-secondary"
              onClick={() => {
                if (onAnchor) onAnchor('disciplines');
                else onNavigate('projects');
              }}
            >
              <span>Explore Systems</span>
              <ArrowUpRight size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
