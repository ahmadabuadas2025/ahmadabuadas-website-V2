import { useEffect, useState } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import type { Profile } from '../data/types';
import PipelineBackground from './PipelineBackground';
import { ArrowIcon, GitHubIcon, LinkedInIcon, MailIcon } from './Icons';

function useTypewriter(words: string[], reduce: boolean) {
  const [text, setText] = useState(reduce ? words[0] : '');
  useEffect(() => {
    if (reduce) return;
    let w = 0, i = 0, deleting = false, t = 0;
    const loop = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      setText(word.slice(0, i));
      let delay = deleting ? 38 : 75;
      if (!deleting && i === word.length) { deleting = true; delay = 1700; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
      t = window.setTimeout(loop, delay);
    };
    t = window.setTimeout(loop, 500);
    return () => window.clearTimeout(t);
  }, [words, reduce]);
  return text;
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.55, ease: 'easeOut' as const } }),
};

export default function Hero({ profile }: { profile: Profile }) {
  const reduce = useReducedMotion() ?? false;
  const role = useTypewriter(profile.roles, reduce);

  return (
    <section id="top" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-16" aria-label="Introduction">
      <div className="absolute inset-0 -z-10">
        <PipelineBackground />
        {/* scrim keeps the text readable over the moving pipeline */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, var(--bg) 0%, var(--scrim) 38%, transparent 70%), linear-gradient(0deg, var(--bg) 0%, transparent 25%)' }}
        />
        <div className="absolute inset-0 max-md:bg-[var(--scrim)]" />
        <div className="absolute -left-40 top-1/4 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, var(--glow), transparent 70%)' }} />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-xl">
          <m.p custom={0} variants={item} initial="hidden" animate="show" className="eyebrow flex items-center gap-2">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {profile.location}
          </m.p>

          <m.div custom={1} variants={item} initial="hidden" animate="show" className="mt-5 flex items-center gap-5 sm:gap-7">
            {profile.photo && (
              <div className="relative shrink-0">
                <div
                  className="absolute -inset-1 rounded-full opacity-80 blur-md"
                  style={{ background: 'radial-gradient(circle, var(--glow), transparent 70%)' }}
                  aria-hidden="true"
                />
                <img
                  src={profile.photo}
                  alt={`Portrait of ${profile.name}`}
                  width={160}
                  height={160}
                  {...{ fetchpriority: 'high' }}
                  className="relative h-24 w-24 rounded-full border-2 border-accent object-cover shadow-lg ring-4 ring-[var(--bg)] sm:h-40 sm:w-40"
                />
              </div>
            )}
            <h1 className="font-display text-5xl font-bold tracking-tight text-ink sm:text-7xl">
              {profile.firstName}
              <br />
              <span className="text-gradient">{profile.lastName}.</span>
            </h1>
          </m.div>

          <m.p custom={2} variants={item} initial="hidden" animate="show" className="mt-5 h-7 font-mono text-lg text-accent-2">
            <span className="sr-only">{profile.roles.join(', ')}</span>
            <span aria-hidden="true">
              {'> '}
              {role}
              <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-1 animate-pulse bg-accent-2" />
            </span>
          </m.p>

          <m.p custom={3} variants={item} initial="hidden" animate="show" className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
            {profile.pitch}
          </m.p>

          <m.dl custom={4} variants={item} initial="hidden" animate="show" className="mt-8 grid grid-cols-3 gap-3">
            {profile.stats.map(s => (
              <div key={s.label} className="card px-3 py-3 sm:px-4">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-semibold text-ink sm:text-3xl">{s.value}</dd>
                <dd className="mt-1 text-[0.7rem] leading-snug text-muted sm:text-xs">{s.label}</dd>
              </div>
            ))}
          </m.dl>

          <m.div custom={5} variants={item} initial="hidden" animate="show" className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" className="btn btn-primary">
              See the architectures <ArrowIcon dir="down" />
            </a>
            <a href="#contact" className="btn btn-ghost">
              Get in touch <ArrowIcon />
            </a>
            {profile.resumeUrl && (
              <a href={profile.resumeUrl} className="btn btn-ghost" download>
                Résumé
              </a>
            )}
          </m.div>

          <m.ul custom={6} variants={item} initial="hidden" animate="show" className="mt-6 flex items-center gap-2" aria-label="Profiles">
            {[
              { href: profile.github, label: 'GitHub', icon: <GitHubIcon /> },
              { href: profile.linkedin, label: 'LinkedIn', icon: <LinkedInIcon /> },
              { href: `mailto:${profile.email}`, label: 'Email', icon: <MailIcon /> },
            ].map(l => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  aria-label={l.label}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card text-muted transition-colors hover:border-accent hover:text-ink"
                >
                  {l.icon}
                </a>
              </li>
            ))}
          </m.ul>
        </div>
      </div>
    </section>
  );
}
