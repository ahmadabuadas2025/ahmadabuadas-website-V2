import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Mounts its children only when they come within `margin` of the viewport.
 * Keeps first load light: the page holds dozens of animated diagrams.
 */
export default function Defer({ children, minHeight, margin = '900px', className = '', id }: { children: ReactNode; minHeight: number; margin?: string; className?: string; /** anchor id while the real section isn't mounted yet */ id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    // deep links (#contact) need everything above the target to exist
    if (location.hash) {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { rootMargin: `${margin} 0px ${margin} 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [show, margin]);

  return (
    <div ref={ref} id={show ? undefined : id} className={className} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}
