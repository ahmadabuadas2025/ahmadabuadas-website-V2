import type { ReactNode } from 'react';
import { m } from 'framer-motion';

interface Props {
  id: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Section({ id, eyebrow, title, intro, children, className = '' }: Props) {
  return (
    <section id={id} className={`relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 ${className}`} aria-labelledby={`${id}-title`}>
      <m.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-10 max-w-2xl sm:mb-14"
      >
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`} className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.1]">
          {title}
        </h2>
        {intro && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{intro}</p>}
      </m.header>
      {children}
    </section>
  );
}

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </m.div>
  );
}
