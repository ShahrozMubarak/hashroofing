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

        {/* Moving Luminous Wipe Beam */}
        <div className="arch-transition-line" aria-hidden="true">
          <div className="transition-line-glow" />
          <div className="transition-line-beam" />
          <span className="transition-line-tag">Envelope Filter</span>
        </div>
      </div>

      {/* Soft Nocturne Atmospheric Gradient Leaving Generous Air Around House */}
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

      {/* Spacious Minimal Editorial Headline & Action Pills (No Small Text Clutter) */}
      <div
        className="arch-hero-inner ar-container"
        style={{
          transform: `translate3d(0, ${textShift}px, 0)`,
          opacity: textOpacity,
        }}
      >
        <div className="arch-hero-copy">
          <h1 className="arch-hero-headline arch-entrance-1">
            Roofing under <span className="ar-kw-lavender">night-sky</span> precision.
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
