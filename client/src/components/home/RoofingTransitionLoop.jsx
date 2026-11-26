import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeftRight, CheckCircle2, AlertTriangle, Play, Pause, Sparkles } from 'lucide-react';

export default function RoofingTransitionLoop() {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isUserDragging, setIsUserDragging] = useState(false);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const stateRef = useRef({
    direction: 1, // 1 = moving towards 'after' (0 -> 100), -1 = moving towards 'before'
    pauseUntil: Date.now() + 1800,
    currentPos: 0
  });

  // Smooth continuous animation loop
  useEffect(() => {
    if (!isAutoPlaying || isUserDragging) return;

    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const state = stateRef.current;
      const now = Date.now();

      if (now >= state.pauseUntil) {
        const speed = 28; // percent per second
        state.currentPos += state.direction * speed * dt;

        if (state.currentPos >= 100) {
          state.currentPos = 100;
          state.direction = -1;
          state.pauseUntil = Date.now() + 2400; // Pause on pristine roof to admire
        } else if (state.currentPos <= 0) {
          state.currentPos = 0;
          state.direction = 1;
          state.pauseUntil = Date.now() + 2000; // Pause on old roof
        }

        setSliderPos(state.currentPos);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoPlaying, isUserDragging]);

  const updateFromPointer = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
    stateRef.current.currentPos = percent;
  }, []);

  const handlePointerDown = (e) => {
    setIsUserDragging(true);
    setIsAutoPlaying(false);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isUserDragging) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = () => {
    if (isUserDragging) {
      setIsUserDragging(false);
      // Auto-resume after 3.5 seconds of inactivity
      setTimeout(() => {
        stateRef.current.pauseUntil = Date.now() + 600;
        setIsAutoPlaying(true);
      }, 3500);
    }
  };

  return (
    <div className="roof-transition-outer">
      {/* Seamless submerged container */}
      <div
        ref={containerRef}
        className="roof-transition-card"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="region"
        aria-label="Interactive before and after roof replacement visual"
      >
        {/* Background Layer: "Before" - Weathered & Damaged Roof */}
        <div className="roof-slide roof-slide-before">
          <img
            src="/images/house-roof-before.jpg"
            alt="Estate home with aged, weathered and discolored shingle roof"
            className="roof-img"
            loading="eager"
            draggable={false}
          />
          <div className="roof-label roof-label-before">
            <span className="roof-label-icon warning"><AlertTriangle size={13} /></span>
            <span>BEFORE: AGED & WEATHERED</span>
          </div>
        </div>

        {/* Foreground Layer (Clipped): "After" - Brand New Luxury Architectural Slate Roof */}
        <div
          className="roof-slide roof-slide-after"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src="/images/house-roof-after.jpg"
            alt="Identical estate home with brand new pristine architectural charcoal roof"
            className="roof-img"
            loading="eager"
            draggable={false}
          />
          <div className="roof-label roof-label-after">
            <span className="roof-label-icon success"><CheckCircle2 size={13} /></span>
            <span>AFTER: AUREN ARCHITECTURAL ROOF</span>
          </div>
        </div>

        {/* The Divider Line & Draggable Handle */}
        <div
          className="roof-divider-line"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="roof-divider-handle" title="Drag or slide to compare">
            <ArrowLeftRight size={15} />
          </div>
        </div>

        {/* Floating Top Header Badges */}
        <div className="roof-card-header">
          <div className="roof-live-badge">
            <span className="pulse-dot" />
            <Sparkles size={13} className="text-blue-500" />
            <span>LIVE RESTORATION TRANSITION</span>
          </div>

          <button
            type="button"
            className="roof-play-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoPlaying(!isAutoPlaying);
            }}
            title={isAutoPlaying ? 'Pause loop' : 'Play loop'}
            aria-label={isAutoPlaying ? 'Pause transformation loop' : 'Play transformation loop'}
          >
            {isAutoPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isAutoPlaying ? 'Looping' : 'Paused'}</span>
          </button>
        </div>

        {/* Bottom Timeline Progress Bar */}
        <div className="roof-loop-timeline">
          <div className="roof-loop-progress" style={{ width: `${sliderPos}%` }} />
        </div>
      </div>

      <div className="roof-caption-bar">
        <span>Slide to inspect any detail</span>
        <span className="divider">•</span>
        <span>Seamless 100% white studio isolation</span>
        <span className="divider">•</span>
        <span>Auren Certified Materials</span>
      </div>
    </div>
  );
}

