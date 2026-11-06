/**
 * Content schema. All site content lives in `portfolio.ts`; the UI only reads it.
 * Adding a project = adding one `Project` object. No component changes needed.
 */

/** What a node does. Drives its colour and the legend. */
export type NodeKind =
  | 'source'   // where data comes from
  | 'ingest'   // moving / landing data
  | 'process'  // transforms, compute
  | 'store'    // warehouses, databases
  | 'ai'       // models, LLMs, agents
  | 'rules'    // detection logic, business rules, validation
  | 'output'   // reports, alerts, dashboards
  | 'ui'       // user-facing apps
  | 'infra';   // orchestration, CI/CD, cloud

/** Cross-cutting tags the "Highlight" chips filter on. */
export type NodeFlag = 'ai' | 'security' | 'test' | 'automation';

export interface ArchNode {
  id: string;
  /** Short label, about 22 characters max, shown in the box. */
  label: string;
  /** Lane id this node sits in (lanes are the columns of the diagram). */
  lane: string;
  kind: NodeKind;
  /** Optional second line: the main tech, about 24 characters max. */
  tech?: string;
  /** Shown in the detail panel when the node is selected. */
  detail?: string;
  flags?: NodeFlag[];
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ArchStep {
  nodes: string[];
  caption: string;
}

export interface Architecture {
  /** Ordered left → right (stacked top → bottom on phones). */
  lanes: { id: string; label: string }[];
  nodes: ArchNode[];
  edges: ArchEdge[];
  /** "Play the pipeline" walkthrough. Optional. */
  steps?: ArchStep[];
}

export interface Impact {
  /** Big figure or short word, e.g. "88", "L1–L5", "Real-time". */
  value: string;
  label: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  role: string;
  timeframe: string;
  category: 'work' | 'side';
  /** draft = placeholder; details still to come from Ahmad. */
  status: 'live' | 'shipped' | 'production' | 'draft';
  employer?: string;
  /** Featured projects show the diagram open; others start collapsed. */
  featured?: boolean;
  problem: string;
  stack: string[];
  impact: Impact[];
  links?: { github?: string; demo?: string; caseStudy?: string };
  architecture: Architecture;
  /** Shown under the card, e.g. confidentiality note. */
  note?: string;
}

export interface Experience {
  company: string;
  role: string;
  location?: string;
  start: string;
  end: string;
  highlights: string[];
  stack: string[];
  /** Company logo, path under /public. */
  logo?: string;
}

export interface Education {
  school: string;
  degree: string;
  year: string;
  status?: string;
  detail?: string;
  /** School logo, path under /public. */
  logo?: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  blurb: string;
  skills: string[];
}

export interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  roles: string[];
  location: string;
  pitch: string;
  email: string;
  github: string;
  linkedin: string;
  resumeUrl?: string;
  /** Headshot shown next to the name in the hero (path under /public). */
  photo?: string;
  stats: Impact[];
}

export interface Portfolio {
  profile: Profile;
  skills: SkillGroup[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
}
