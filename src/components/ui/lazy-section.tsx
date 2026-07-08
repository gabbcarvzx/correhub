"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
}

export function LazySection({ children, className, threshold = 0.1 }: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : null}
    </div>
  );
}
