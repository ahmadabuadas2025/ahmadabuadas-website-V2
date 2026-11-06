import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import type { Project } from '../data/types';
import ArchitectureDiagram from './ArchitectureDiagram';
import { ExternalIcon, GitHubIcon } from './Icons';

const STATUS: Record<Project['status'], { label: string; color: string }> = {
  live: { label: 'Live', color: 'var(--k-ui)' },
  production: { label: 'In production', color: 'var(--k-ui)' },
  shipped: { label: 'Shipped', color: 'var(--k-store)' },
  draft: { label: 'Overview', color: 'var(--k-rules)' },
};

interface Props {
  project: Project;
  compact?: boolean;
  highlight?: string | null;
}

export default function ProjectCard({ project: p, compact = false, highlight }: Props) {
  const [open, setOpen] = useState(!compact);
  const st = STATUS[p.status];

  return (
    <m.article
      layout="position"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-6% 0px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="card relative h-full overflow-hidden"
      aria-labelledby={`${p.id}-title`}
    >
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} aria-hidden="true" />
      <div className={compact ? 'p-5 sm:p-6' : 'p-5 sm:p-8'}>
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-faint">
              {p.employer ?? 'Side project'} · {p.timeframe}
            </p>
            <h3 id={`${p.id}-title`} className={`mt-1.5 font-display font-semibold tracking-tight text-ink ${compact ? 'text-xl' : 'text-2xl sm:text-[1.75rem]'}`}>
              {p.title}
            </h3>
            <p className="mt-1 font-mono text-xs text-accent">{p.role}</p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-wider"
            style={{ borderColor: `color-mix(in srgb, ${st.color} 45%, transparent)`, color: st.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.color }} aria-hidden="true" />
            {st.label}
          </span>
        </div>

        <p className={`mt-4 leading-relaxed text-ink/90 ${compact ? 'text-sm' : 'text-base sm:text-[1.05rem]'}`}>{p.summary}</p>
        {!compact && (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            <span className="font-semibold text-ink">The problem: </span>
            {p.problem}
          </p>
        )}

        {/* diagram */}
        {compact && (
          <button type="button" className="chip mt-4" aria-expanded={open} aria-controls={`${p.id}-arch`} onClick={() => setOpen(o => !o)}>
            {open ? 'Hide architecture' : 'Show architecture'}
            <span aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
          </button>
        )}
        <AnimatePresence initial={false}>
          {open && (
            <m.div
              id={`${p.id}-arch`}
              initial={compact ? { height: 0, opacity: 0 } : false}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-5">
                {compact && <p className="mb-3 text-sm leading-relaxed text-muted"><span className="font-semibold text-ink">The problem: </span>{p.problem}</p>}
                <ArchitectureDiagram arch={p.architecture} title={p.title} />
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* impact */}
        <div className="mt-6">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-faint">Impact</p>
          <dl className={`mt-2 grid gap-3 ${p.impact.length >= 4 ? 'grid-cols-2 lg:grid-cols-4' : p.impact.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
            {p.impact.map(m => (
              <div key={m.label} className="rounded-xl border border-line bg-card-2 px-3.5 py-3">
                <dt className="sr-only">{m.label}</dt>
                <dd className="font-display text-xl font-semibold text-gradient">{m.value}</dd>
                <dd className="mt-1 text-xs leading-snug text-muted">{m.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* stack */}
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {p.stack.map(s => {
            const hit = highlight && s.toLowerCase().includes(highlight.toLowerCase());
            return (
              <li key={s} className="chip" style={hit ? { borderColor: 'var(--accent)', color: 'var(--text)' } : undefined}>
                {s}
              </li>
            );
          })}
        </ul>

        {(p.links?.github || p.links?.demo || p.note) && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <div className="flex flex-wrap gap-2">
              {p.links?.github && (
                <a href={p.links.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-muted transition-colors hover:text-ink">
                  <GitHubIcon /> Code
                </a>
              )}
              {p.links?.demo && (
                <a href={p.links.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-accent hover:underline">
                  Live demo <ExternalIcon />
                </a>
              )}
            </div>
            {p.note && <p className="font-mono text-[0.68rem] text-faint">{p.note}</p>}
          </div>
        )}
      </div>
    </m.article>
  );
}
