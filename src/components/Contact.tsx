import { useState, type FormEvent } from 'react';
import type { Profile } from '../data/types';
import Section, { Reveal } from './Section';
import { GitHubIcon, LinkedInIcon, MailIcon } from './Icons';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function Contact({ profile }: { profile: Profile }) {
  const [status, setStatus] = useState<Status>('idle');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('sending');
    try {
      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  const rows = [
    { icon: <MailIcon />, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { icon: <LinkedInIcon />, label: 'LinkedIn', value: 'ahmad-abuadas', href: profile.linkedin },
    { icon: <GitHubIcon />, label: 'GitHub', value: 'ahmadabuadas2025', href: profile.github },
  ];

  const field = 'mt-1.5 w-full rounded-xl border border-line bg-card-2 px-3.5 py-3 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none';

  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title={
        <>
          Have messy data and a <span className="text-gradient">hard question?</span>
        </>
      }
      intro="I'm happy to talk about data platforms, AML analytics, LLM agents, or anything that has to be both fast and auditable."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <ul className="space-y-3">
            {rows.map(r => (
              <li key={r.label}>
                <a
                  href={r.href}
                  target={r.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="card flex items-center gap-4 p-4 transition-colors hover:border-accent"
                >
                  <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-line bg-card-2 text-accent">{r.icon}</span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[0.68rem] uppercase tracking-widest text-faint">{r.label}</span>
                    <span className="block truncate text-sm font-medium text-ink">{r.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08}>
          <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={submit} className="card space-y-4 p-5 sm:p-6">
            <input type="hidden" name="form-name" value="contact" />
            <p hidden>
              <label>
                Don't fill this in: <input name="bot-field" />
              </label>
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-muted">
                Name
                <input name="name" required autoComplete="name" className={field} placeholder="Your name" />
              </label>
              <label className="block text-sm text-muted">
                Email
                <input name="email" type="email" required autoComplete="email" className={field} placeholder="you@company.com" />
              </label>
            </div>
            <label className="block text-sm text-muted">
              Message
              <textarea name="message" required rows={5} className={`${field} resize-y`} placeholder="What are you working on?" />
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
              <p role="status" className="text-sm">
                {status === 'sent' && <span className="text-accent">Thanks! I'll get back to you soon.</span>}
                {status === 'error' && (
                  <span className="text-muted">
                    That didn't go through. Email me at{' '}
                    <a className="text-accent underline" href={`mailto:${profile.email}`}>
                      {profile.email}
                    </a>
                    .
                  </span>
                )}
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
