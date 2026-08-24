import { useState, useLayoutEffect, useCallback } from 'react';

export function useCanSideScroll(ref: React.RefObject<HTMLElement | null>) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    // 1px buffer handles fractional rounding issues on high-DPI screens
    const isAtStart = el.scrollLeft <= 1;
    const isAtEnd = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth - 3;
    const isOverflowing = el.scrollWidth > el.clientWidth;

    setCanScrollLeft(isOverflowing && !isAtStart);
    setCanScrollRight(isOverflowing && !isAtEnd);
  }, [ref]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 1. Defer execution until Android WebView completes the next paint cycle
    let rafId: number;
    const initialCheck = () => {
      rafId = requestAnimationFrame(() => {
        checkScroll();
      });
    };

    initialCheck();

    // 2. ResizeObserver catches dimension changes, layout shifts, or content updates
    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });

    resizeObserver.observe(el);
    // Observe children in case inner content loads asynchronously (e.g. images, dynamic lists)
    Array.from(el.children).forEach((child) => resizeObserver.observe(child));

    // 3. Attach scroll and window resize listeners
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [ref, checkScroll]);

  return { canScrollLeft, canScrollRight };
}