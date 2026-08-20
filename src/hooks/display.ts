import { useState, useEffect } from 'react';

export const useMediaQuery = (minWidth: number): boolean => {
    const [matches, setMatches] = useState<boolean>(() =>
        typeof window !== 'undefined' ? window.innerWidth > minWidth : false
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia(`(min-width: ${minWidth + 1}px)`);

        // Set initial value
        setMatches(mediaQuery.matches);

        // Event listener for screen resizing
        const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, [minWidth]);

    return matches;
};