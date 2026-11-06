import { useMemo } from 'react';
import { LayoutGroup, m } from 'framer-motion';
import type { Project } from '../data/types';
import Section from './Section';
import ProjectCard from './ProjectCard';
import Defer from './Defer';

export type Tab = 'work' | 'side';

interface Props {
  projects: Project[];
  tab: Tab;
  onTab: (t: Tab) => void;
  stackFilter: string | null;
  onStackFilter: (s: string | null) => void;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').trim();
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** True when `a` appears in `b` as whole word(s), e.g. "Snowflake" in "S3 → Snowflake". */
function wordIn(a: string, b: string) {
  if (a === b) return true;
  if (a.length < 3) return false;
  return new RegExp(`(^| )${esc(a)}( |$)`).test(b);
}

/** Does project `p` use tool `s`? Matches whole words in either direction ("AWS" ↔ "AWS EC2 / S3 / IAM"). */
export function matchesStack(p: Project, s: string) {
  const q = norm(s);
  return p.stack.some(x => {
    const t = norm(x);
    return wordIn(q, t) || wordIn(t, q);
  });
}

export default function Projects({ projects, tab, onTab, stackFilter, onStackFilter }: Props) {
  const counts = { work: projects.filter(p => p.category === 'work').length, side: projects.filter(p => p.category === 'side').length };
  const inTab = projects.filter(p => p.category === tab);

  // Filter chips: tools used by 2+ projects in this tab
  const tools = useMemo(() => {
    const c = new Map<string, number>();
    inTab.forEach(p => p.stack.forEach(s => c.set(s, (c.get(s) ?? 0) + 1)));
    return [...c.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([s]) => s);
  }, [inTab]);

  const shown = stackFilter ? inTab.filter(p => matchesStack(p, stackFilter)) : inTab;
  const featured = shown.filter(p => p.featured);
  const rest = shown.filter(p => !p.featured);
  const chips = stackFilter && !tools.includes(stackFilter) ? [stackFilter, ...tools] : tools;

  return (
    <Section
      id="projects"
      eyebrow="Projects · architecture first"
      title={
        <>
          Every project, drawn as the <span className="text-gradient">system it really is.</span>
        </>
      }
      intro="Each card opens with a live map of the architecture. Press Play to follow the data, highlight where AI, testing or security sit, or tap any component for details."
    >
      <div className="sticky top-16 z-30 -mx-4 mb-8 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <div role="tablist" aria-label="Project type" className="inline-flex rounded-2xl border border-line bg-card p-1">
          {(
            [
              ['work', 'At work'],
              ['side', 'Side projects'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              type="button"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls="project-panel"
              onClick={() => {
                onTab(id);
                onStackFilter(null);
              }}
              className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-colors sm:px-5 ${tab === id ? 'text-accent-ink' : 'text-muted hover:text-ink'}`}
            >
              {tab === id && (
                <m.span layoutId="tab-pill" className="absolute inset-0 -z-0 rounded-xl" style={{ background: 'var(--accent)' }} transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
              )}
              <span className="relative">
                {label} <span className="font-mono text-xs opacity-75">{counts[id]}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible" aria-label="Filter by tool">
          <button type="button" className="chip" aria-pressed={!stackFilter} onClick={() => onStackFilter(null)}>
            All
          </button>
          {chips.map(t => (
            <button key={t} type="button" className="chip" aria-pressed={stackFilter === t} onClick={() => onStackFilter(stackFilter === t ? null : t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div id="project-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'work' && (
          <p className="mb-6 rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted">
            Citi projects are shown as generic overviews. Internal system names, data and figures are withheld.
          </p>
        )}
        <LayoutGroup>
          <div className="space-y-8">
            {featured.map(p => (
              <Defer key={p.id} minHeight={1000}>
                <ProjectCard project={p} highlight={stackFilter} />
              </Defer>
            ))}
          </div>
          {rest.length > 0 && (
            <>
              {featured.length > 0 && <h3 className="mb-5 mt-14 font-display text-xl font-semibold text-ink">{tab === 'work' ? 'Earlier roles' : 'More builds'}</h3>}
              <div className="grid gap-6 md:grid-cols-2">
                {rest.map(p => (
                  <Defer key={p.id} minHeight={420} className="span-when-open">
                    <ProjectCard project={p} compact highlight={stackFilter} />
                  </Defer>
                ))}
              </div>
            </>
          )}
          {shown.length === 0 && <p className="text-muted">No projects in this tab use {stackFilter}.</p>}
        </LayoutGroup>
      </div>
    </Section>
  );
}
