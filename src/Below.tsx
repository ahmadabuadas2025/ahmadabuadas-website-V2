import { useEffect, useState } from 'react';
import { portfolio } from './data/portfolio';
import Projects, { matchesStack, type Tab } from './components/Projects';
import Skills from './components/Skills';
import { Education, Experience } from './components/Experience';
import Contact from './components/Contact';
import { ArrowIcon } from './components/Icons';
import Defer from './components/Defer';

/** Everything below the hero. Loaded as a separate chunk after first paint. */
export default function Below() {
  const [tab, setTab] = useState<Tab>('work');
  const [stackFilter, setStackFilter] = useState<string | null>(null);
  const { profile, projects } = portfolio;

  // Honour deep links like /#experience once the sections exist
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  // Clicking a skill jumps to the projects that use it (switching tabs if needed)
  const pickSkill = (skill: string) => {
    const inWork = projects.some(p => p.category === 'work' && matchesStack(p, skill));
    setTab(inWork ? 'work' : 'side');
    setStackFilter(skill);
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Projects projects={projects} tab={tab} onTab={setTab} stackFilter={stackFilter} onStackFilter={setStackFilter} />
      <Defer id="skills" minHeight={1100}>
        <Skills groups={portfolio.skills} projects={projects} onPick={pickSkill} />
      </Defer>
      <Defer id="experience" minHeight={1500}>
        <Experience items={portfolio.experience} />
      </Defer>
      <Defer id="education" minHeight={500}>
        <Education items={portfolio.education} />
      </Defer>
      <Defer id="contact" minHeight={800}>
        <Contact profile={profile} />
      </Defer>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-faint sm:px-6">
          <p>
            © {new Date().getFullYear()} {profile.name}. Built with React, TypeScript and Framer Motion.
          </p>
          <a href="#top" className="inline-flex items-center gap-2 text-muted hover:text-ink">
            Back to top <ArrowIcon dir="up" />
          </a>
        </div>
      </footer>
    </>
  );
}
