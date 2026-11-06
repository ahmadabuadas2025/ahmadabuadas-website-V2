import type { Project, SkillGroup } from '../data/types';
import Section, { Reveal } from './Section';
import { matchesStack } from './Projects';

const GROUP_COLOR: Record<string, string> = {
  ai: 'var(--k-ai)',
  data: 'var(--k-process)',
  store: 'var(--k-store)',
  backend: 'var(--k-ingest)',
  frontend: 'var(--k-ui)',
  cloud: 'var(--k-infra)',
  fintech: 'var(--k-rules)',
  ot: 'var(--k-output)',
};

interface Props {
  groups: SkillGroup[];
  projects: Project[];
  onPick: (skill: string) => void;
}

export default function Skills({ groups, projects, onPick }: Props) {
  return (
    <Section
      id="skills"
      eyebrow="Skills matrix"
      title="From PLC triggers to LLM agents."
      intro="Eight groups, one through-line: getting data from where it's made to where it's useful. Highlighted skills link to the projects that use them."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((g, i) => {
          const color = GROUP_COLOR[g.id] ?? 'var(--accent)';
          return (
            <Reveal key={g.id} delay={(i % 4) * 0.06}>
              <div className="card group h-full p-5 transition-colors hover:border-line-strong">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color, boxShadow: `0 0 12px ${color}` }} aria-hidden="true" />
                  <h3 className="font-display text-base font-semibold text-ink">{g.label}</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{g.blurb}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {g.skills.map(s => {
                    const n = projects.filter(p => matchesStack(p, s)).length;
                    return (
                      <li key={s}>
                        {n > 0 ? (
                          <button
                            type="button"
                            className="chip"
                            onClick={() => onPick(s)}
                            style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)`, color: 'var(--text)' }}
                            aria-label={`${s}: show ${n} project${n > 1 ? 's' : ''}`}
                          >
                            {s}
                            <span className="text-faint">{n}</span>
                          </button>
                        ) : (
                          <span className="chip">{s}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
