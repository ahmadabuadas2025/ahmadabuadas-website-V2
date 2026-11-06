import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

function current(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

/** Theme is bootstrapped in index.html (no flash); this hook only toggles and persists it. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0B1020' : '#F5F6FB');
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* storage blocked: theme still works for this visit */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggle };
}

/** Reads a CSS custom property from :root (used by the canvas). */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
