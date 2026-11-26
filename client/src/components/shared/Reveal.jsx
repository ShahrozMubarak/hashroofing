import React, { useEffect, useRef, useState } from 'react';

/** Lightweight scroll reveal using IntersectionObserver; no animation library required. */
export default function Reveal({ children, className = '', delay = 0, direction = 'up', as: Tag = 'div', image = false, once = true }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        if (once) observer.unobserve(node);
      } else if (!once) {
        setVisible(false);
      }
    }, { threshold: 0.14, rootMargin: '0px 0px -56px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag ref={ref} className={`reveal ${image ? 'reveal-image' : ''} reveal-${direction} ${visible ? 'is-visible' : ''} ${className}`} style={{ '--reveal-delay': `${delay}ms` }}>
      {children}
    </Tag>
  );
}
