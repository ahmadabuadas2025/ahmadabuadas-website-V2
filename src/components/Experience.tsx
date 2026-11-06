import { useRef } from 'react';
import { m, useScroll, useSpring } from 'framer-motion';
import type { Education as Edu, Experience as Exp } from '../data/types';
import Section, { Reveal } from './Section';

function Logo({ src, name, size = 'h-11 w-11' }: { src?: string; name: string; size?: string }) {
  if (!src) return null;
  return (
    <span className={`grid ${size} flex-none place-items-center overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-sm`}>
      <img src={src} alt={`${name} logo`} loading="lazy" className="max-h-full max-w-full object-contain" />
    </span>
  );
}

export function Experience({ items }: { items: Exp[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <Section id="experience" eyebrow="Experience" title="Ten years of moving data closer to decisions." intro="From factory-floor controllers to bank-scale Spark clusters. Every step added one layer of the stack.">
      <ol ref={ref} className="relative ml-2 space-y-10 border-l border-line pl-7 sm:ml-4 sm:pl-10">
        <m.span
          className="absolute -left-px top-0 h-full w-[2px] origin-top"
          style={{ scaleY, background: 'linear-gradient(180deg, var(--accent), var(--accent-3), var(--accent-2))' }}
          aria-hidden="true"
        />
        {items.map((e, i) => (
          <li key={e.company + e.start} className="relative">
            <span
              className="absolute -left-[35px] top-1.5 grid h-4 w-4 place-items-center rounded-full border-2 bg-bg sm:-left-[47px]"
              style={{ borderColor: i === 0 ? 'var(--accent)' : 'var(--border-strong)' }}
              aria-hidden="true"
            >
              {i === 0 && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />}
            </span>
            <Reveal>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <div className="flex items-center gap-3">
                  <Logo src={e.logo} name={e.company} />
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {e.role} <span className="text-muted">· {e.company}</span>
                  </h3>
                </div>
                <p className="font-mono text-xs text-faint">
                  {e.start} – {e.end}
                  {e.location ? ` · ${e.location}` : ''}
                </p>
              </div>
              <ul className="mt-3 space-y-2">
                {e.highlights.map(h => (
                  <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                    <span className="mt-2 h-1 w-1 flex-none rounded-full bg-accent" aria-hidden="true" />
                    {h}
                  </li>
                ))}
              </ul>
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tools">
                {e.stack.map(s => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Education({ items }: { items: Edu[] }) {
  return (
    <Section id="education" eyebrow="Education" title="Engineering, then data, then finance.">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((ed, i) => (
          <Reveal key={ed.school} delay={i * 0.08}>
            <div className="card h-full p-6">
              <div className="flex min-h-6 items-center justify-between gap-3">
                <p className="font-mono text-xs text-faint">{ed.year}</p>
                {ed.status && (
                  <span className="rounded-full border px-2.5 py-0.5 font-mono text-[0.66rem] uppercase tracking-wider" style={{ borderColor: 'var(--accent-2)', color: 'var(--accent-2)' }}>
                    {ed.status}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <Logo src={ed.logo} name={ed.school} size="h-14 w-14" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">{ed.degree}</h3>
              <p className="mt-1 text-sm text-accent">{ed.school}</p>
              {ed.detail && <p className="mt-3 text-sm leading-relaxed text-muted">{ed.detail}</p>}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
