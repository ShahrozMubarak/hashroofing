import { motion, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import { useEffect } from 'react';

/**
 * Inertial desktop smooth scrolling (Lenis); disabled on coarse touch devices and reduced motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (reduced || isCoarse) return undefined;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    function raf(time) {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    }
    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
}

export function RevealSection({ children, className = '', style, delay = 0 }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function PageFade({ viewKey, children }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      key={viewKey}
      initial={prefersReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

