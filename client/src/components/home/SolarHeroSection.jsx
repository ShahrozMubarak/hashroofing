import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUpRight, CheckCircle2, AlertTriangle, Play, Pause, Zap, ShieldCheck, Star, Users, Award, ChevronRight } from 'lucide-react';

export default function SolarHeroSection({ onNavigate, onAnchor }) {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const stateRef = useRef({
    direction: 1,
    pauseUntil: Date.now() + 1800,
    currentPos: 0
  });

  // Automated gentle transformation loop
  useEffect(() => {
    if (!isAutoPlaying || isDragging) return;

    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const state = stateRef.current;
      const now = Date.now();

      if (now >= state.pauseUntil) {
        const speed = 25; // percent per second
        state.currentPos += state.direction * speed * dt;

        if (state.currentPos >= 100) {
          state.currentPos = 100;
          state.direction = -1;
          state.pauseUntil = Date.now() + 2500; // Pause on pristine new roof
        } else if (state.currentPos <= 0) {
          state.currentPos = 0;
          state.direction = 1;
          state.pauseUntil = Date.now() + 2000; // Pause on damaged roof
        }

        setSliderPos(state.currentPos);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoPlaying, isDragging]);

  const updateFromPointer = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
    stateRef.current.currentPos = percent;
  }, []);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setIsAutoPlaying(false);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setTimeout(() => {
        stateRef.current.pauseUntil = Date.now() + 800;
        setIsAutoPlaying(true);
      }, 3000);
    }
  };

  return (
    <section className="solar-hero-root">
      {/* Background Lighting & Atmospheric Mist */}
      <div className="solar-hero-bg">
        <div className="solar-bg-glow-amber" />
        <div className="solar-bg-glow-cyan" />
        <div className="solar-bg-mist" />
      </div>

      <div className="solar-hero-content site-shell">
        {/* Left Side: Editorial & Actions (Matching Reference Image) */}
        <div className="solar-hero-left">
          {/* Upper Left Small Kicker */}
          <div className="solar-kicker-small">
            <span className="solar-kicker-dot" />
            <span>AUREN ARCHITECTURAL ROOFING</span>
          </div>

          {/* Main Headline */}
          <h1 className="solar-headline">
            Roofing
            <span className="solar-lightning-icon">
              <Zap size={32} fill="#FACC15" stroke="#FACC15" />
            </span>
            <br />
            Reimagined
          </h1>

          {/* Subtitle */}
          <p className="solar-subtitle">
            Smart residential roofing solutions engineered for a brighter, lifelong sustainable future.
          </p>

          {/* Buttons Row matching reference design */}
          <div className="solar-cta-row">
            <button
              type="button"
              className="solar-button-yellow"
              onClick={() => onNavigate('contact')}
            >
              Request an Estimate
            </button>

            <button
              type="button"
              className="solar-button-ghost"
              onClick={() => onAnchor('approach')}
            >
              <span>How it works?</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>

        {/* Right Side: The House with Integrated Before/After Transformation */}
        <div className="solar-hero-visual-area">
          <div
            ref={containerRef}
            className="solar-house-stage"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Base Layer: Before (Damaged Shingle Roof) */}
            <div className="solar-house-slide">
              <img
                src="/images/solar-house-before.jpg"
                alt="Modern alpine residence before roof restoration with damaged weathered shingles"
                className="solar-house-img"
                draggable={false}
              />
              <div className="solar-state-badge badge-before">
                <AlertTriangle size={12} />
                <span>BEFORE: WEATHERED SHINGLES</span>
              </div>
            </div>

            {/* Clipped Top Layer: After (Pristine Luxury Architectural Roof) */}
            <div
              className="solar-house-slide"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img
                src="/images/solar-house-after.jpg"
                alt="Same modern alpine residence with brand new pristine standing-seam charcoal roof"
                className="solar-house-img"
                draggable={false}
              />
              <div className="solar-state-badge badge-after">
                <CheckCircle2 size={12} />
                <span>AFTER: AUREN ARCHITECTURAL SLATE</span>
              </div>
            </div>

            {/* Glowing Divider Line and Handle */}
            <div
              className="solar-slider-line"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="solar-slider-knob">
                <span className="knob-arrow">‹</span>
                <span className="knob-arrow">›</span>
              </div>
            </div>

            {/* Floating Glassmorphism Badges (Matching Reference Image) */}
            <div className="solar-glass-card card-top-right">
              <div className="glass-icon-circle">
                <Zap size={16} fill="#FACC15" stroke="#FACC15" />
              </div>
              <div className="glass-card-text">
                <strong>Architectural Shield</strong>
                <p>Clean Protection, Always On</p>
              </div>
            </div>

            <div className="solar-glass-pill pill-mid-right">
              <span className="pill-val">50-YR</span>
              <span className="pill-desc">Lifetime Warranty</span>
            </div>

            {/* Loop Toggle */}
            <button
              type="button"
              className="solar-loop-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setIsAutoPlaying(!isAutoPlaying);
              }}
              title={isAutoPlaying ? 'Pause transformation loop' : 'Play transformation loop'}
            >
              {isAutoPlaying ? <Pause size={11} /> : <Play size={11} />}
              <span>{isAutoPlaying ? 'Live Loop' : 'Paused'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom 4-Column Metrics Bar (Matching Reference Image) */}
      <div className="solar-metrics-dock site-shell">
        <div className="metrics-col">
          <div className="metrics-icon-title">
            <Users size={16} className="text-amber-400" />
            <span>Our Partners</span>
          </div>
          <p className="metrics-sub">4.8/5 from happy homeowners</p>
          <button type="button" onClick={() => onAnchor('approach')} className="metrics-link">
            <span>SEE DETAILS</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="metrics-col">
          <div className="metrics-icon-title">
            <Star size={16} className="text-amber-400" fill="#FACC15" />
            <span>Top Rated</span>
          </div>
          <p className="metrics-sub">4.9/5 from 400+ reviews</p>
          <button type="button" onClick={() => onAnchor('reviews')} className="metrics-link">
            <span>ALL REVIEWS</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="metrics-col">
          <div className="metrics-icon-title">
            <ShieldCheck size={16} className="text-amber-400" />
            <span>Our Standards</span>
          </div>
          <p className="metrics-sub">Certified precision materials</p>
          <button type="button" onClick={() => onAnchor('services')} className="metrics-link">
            <span>VIEW ALL</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="metrics-col">
          <div className="metrics-icon-title">
            <Award size={16} className="text-amber-400" />
            <span>Most Trusted</span>
          </div>
          <p className="metrics-sub">100% Watertight guarantee</p>
          <button type="button" onClick={() => onNavigate('contact')} className="metrics-link">
            <span>SEE COVERAGE</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </section>
  );
}

