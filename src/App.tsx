import { lazy, Suspense, useEffect, useState } from 'react';
import { LazyMotion, MotionConfig } from 'framer-motion';

const loadFeatures = () => import('./lib/motionFeatures').then(r => r.default);
import { portfolio } from './data/portfolio';
import { useTheme } from './lib/theme';
import Header from './components/Header';
import Hero from './components/Hero';

const Below = lazy(() => import('./Below'));

export default function App() {
  const { theme, toggle } = useTheme();
  const [ready, setReady] = useState(false);

  // Paint the hero first, then mount the rest when the browser is idle
  useEffect(() => {
    const go = () => setReady(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(go, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(go, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <LazyMotion features={loadFeatures} strict>
    <MotionConfig reducedMotion="user">
      <Header name={portfolio.profile.name} theme={theme} onToggleTheme={toggle} />
      <main>
        <Hero profile={portfolio.profile} />
        {ready && (
          <Suspense fallback={<div className="min-h-screen" />}>
            <Below />
          </Suspense>
        )}
      </main>
    </MotionConfig>
    </LazyMotion>
  );
}
