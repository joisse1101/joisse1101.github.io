import { useState, useLayoutEffect } from 'react';

export function useCanSideScroll(ref: React.RefObject<HTMLElement | null>) {
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = ref.current;
        if (!el) return;

        // 1px buffer handles fractional rounding issues on high-DPI screens
        const isAtStart = el.scrollLeft <= 1;
        const isAtEnd = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth - 3;
        const isOverflowing = el.scrollWidth > el.clientWidth;

        setCanScrollLeft(isOverflowing && !isAtStart);
        setCanScrollRight(isOverflowing && !isAtEnd);
    };

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        checkScroll();

        // Attach event listener for active scroll position changes
        el.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);

        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, []);

    return { canScrollLeft, canScrollRight };
}