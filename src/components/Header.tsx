import { useEffect, useState } from 'react';
import { AnimatePresence, m, useScroll, useSpring } from 'framer-motion';
import { MenuIcon, MoonIcon, SunIcon } from './Icons';
import type { Theme } from '../lib/theme';

export const NAV = [
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
];

interface Props {
  name: string;
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Header({ name, theme, onToggleTheme }: Props) {
  const [active, setActive] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    // Sections mount lazily, so look them up on every (throttled) scroll instead of observing once
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 12);
      const line = window.innerHeight * 0.45;
      let current = '';
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top <= line) current = n.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const initials = name.split(' ').map(p => p[0]).join('');

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open ? 'border-b border-line bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <m.div className="absolute inset-x-0 top-0 h-[2px] origin-left" style={{ scaleX: progress, background: 'linear-gradient(90deg, var(--accent), var(--accent-3), var(--accent-2))' }} />
      <a href="#projects" className="sr-only-focusable absolute left-4 top-3 rounded-md bg-card px-3 py-2 text-sm">
        Skip to projects
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5" aria-label={`${name}, back to top`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-line-strong bg-card font-display text-sm font-bold text-accent">{initials}</span>
          <span className="hidden font-display text-sm font-semibold text-ink sm:block">{name}</span>
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1 rounded-full border border-line bg-card/70 p-1 backdrop-blur">
            {NAV.map(n => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  aria-current={active === n.id ? 'true' : undefined}
                  className={`relative block rounded-full px-3.5 py-1.5 text-sm transition-colors ${active === n.id ? 'text-ink' : 'text-muted hover:text-ink'}`}
                >
                  {active === n.id && (
                    <m.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-surface ring-1 ring-line-strong" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                  )}
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card text-muted transition-colors hover:text-ink"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card text-muted md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Menu"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden md:hidden"
          >
            <ul className="space-y-1 px-4 pb-4">
              {NAV.map(n => (
                <li key={n.id}>
                  <a href={`#${n.id}`} onClick={() => setOpen(false)} className={`block rounded-xl px-3 py-3 text-base ${active === n.id ? 'bg-surface text-ink' : 'text-muted'}`}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
