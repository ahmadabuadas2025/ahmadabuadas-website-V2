# Reference analysis: sangthai.dev

Analyzed 2026-11-06 from the live site (DOM, computed styles, `assets/explorer.js`,
`assets/explorer.css`, `data/trees/*.json`). Used for **structure and UX patterns only**.
None of his text, images, palette or branding is reused.

## 1. Tech stack

| Layer | What he uses |
|---|---|
| Build | Hand-written static HTML (one ~130 KB `index.html`) + two assets (`explorer.js` 27 KB, `explorer.css` 19 KB). No framework, no bundler runtime. |
| Fonts | Google Fonts: Plus Jakarta Sans (300–700) for text, DM Mono for labels, chips and "terminal" text. |
| Animation | Vanilla JS: `requestAnimationFrame`, `IntersectionObserver` reveal-on-scroll, one `<canvas>` for the hero background. Respects `prefers-reduced-motion`. |
| Diagrams | Custom "architecture explorer" (no library). Each project loads `data/trees/<id>.json` and renders it as HTML boxes plus SVG arrows with animated pulses. |
| Analytics | GoatCounter (privacy-friendly, cookie-less). |
| Theme | CSS custom properties on `:root` (dark default) and `html[data-theme="light"]`. Toggle stored in `localStorage`. |
| Contact | Plain HTML form (name, phone, email, message) with a status line. |

Takeaway: the "wow" comes from **data-driven diagrams and one background canvas**, not from a heavy
stack. That's why it stays fast.

## 2. Page structure (top → bottom)

| Section id | Height | Content pattern |
|---|---|---|
| `scroll-progress` | 3 px | Gradient progress bar fixed at the top. |
| `arch-bg` canvas | full viewport, fixed | Animated "data pipeline" backdrop: tech labels (Kafka, Airflow, Postgres…) as glowing pills, linked by dashed bezier curves with particles flowing along them. Sits behind all content. |
| header | 63 px | Avatar monogram + name + subtitle (left), pill nav (centre, active item highlighted), theme toggle (right). Sticky with a blurred translucent background. |
| `home` | ~700 px | Big name with a two-tone accent, a **typewriter** role line in mono, 3–4 sentence bio, a "Business impact" row of **3 stat blocks** (big number + mono label), round social icon buttons, two CTAs (gradient primary + ghost). |
| `portfolio` | ~7600 px | Section heading + one-line instruction, then large **project cards** (detailed below). |
| `field` | ~1200 px | Writing / explainer cards with image, tag, title, summary. |
| `resume` | ~1200 px | Experience list: company, date, title, description. |
| `toolkit` | ~2100 px | Skills grouped into 5 categories, icon + name tool cards in a grid. |
| `education` | ~870 px | Degree cards with badge and links. |
| `about` | ~1060 px | Personal text + skill chips grid. |
| `contact` | ~950 px | Big headline, contact rows (icon, label, value), form. |
| `tab-bar` | mobile only | Bottom tab bar replaces the top nav on phones. |
| `back-to-top` | floating | Round button, bottom-right. |
| `lightbox` | overlay | Click a screenshot to zoom it. |

## 3. The project card (the part to beat)

```
┌─ project-card ─────────────────────────────────────────────┐
│ Name                                    [STATUS BADGE]      │
│ Role — one-line positioning (mono, accent)                  │
│ ┌─ architecture explorer ───────────────────────────────┐  │
│ │ crumbs › path                 [Diagram|Tree] [⛶ full] │  │
│ │ HIGHLIGHT: [AI & agents 39] [Testing 24] [Security 41]│  │
│ │            ┌──────── root (gradient) ────────┐        │  │
│ │  [INPUT box] ── [PROCESSING box] ── [INFRA box]       │  │
│ │        ╲ animated arrows with labels + pulses ╱       │  │
│ │  footer: total node count, note                       │  │
│ └───────────────────────────────────────────────────────┘  │
│ screenshot gallery (click → lightbox)                       │
│ description paragraph                                       │
│ impact row: big number + label × 3–4                        │
│ tags (tech stack chips)                                     │
│ links: GitHub / live demo                                   │
└────────────────────────────────────────────────────────────┘
```

### Explorer data model (from `explorer.js` + `atlas.json`)

```jsonc
{
  "id": "atlas", "name": "…", "tagline": "…",
  "views": [{ "id": "today", "label": "Today" }, { "id": "proposal", "label": "Proposal" }],
  "children": [                       // top-level branches = the boxes in the diagram
    { "id": "inputs", "title": "Inputs", "kind": "input", "summary": "…",
      "flags": ["security"], "status": "coming", "flow": true,
      "children": [ { "id": "in-payments", "title": "…", "kind": "input", "summary": "…" } ] }
  ]
}
```

- **`kind`** colours each node: input, process, ai, agent, store, output, test, security, tool, infra, ui.
- **`flags`** feed the "Highlight" chips. Clicking a chip dims every node that doesn't match. Counts are computed.
- **`status: coming|proposal`** marks roadmap nodes. **`views`** toggles "today vs proposal".
- **Interaction:** click a branch to zoom in (breadcrumbs update, `aria-live`). Escape leaves full screen.
  Diagram/Tree toggle shows the same data as boxes or as an indented tree. `ResizeObserver` redraws arrows.

## 4. Visual system (his, for reference; we will NOT reuse it)

- Dark base `#0F0E17`, surface `#1C1B29`, card `#252438`, muted text `#8B89A8`.
- Accent gradient pink `#FF6B9D` → orange `#FF8C42`. Borders are `rgba(255,255,255,.08)`.
- H1 57.6 px / 700. Mono labels in caps with wide letter spacing.
- Cards have a 16–20 px radius, a 1 px border, and no shadows in dark mode (shadows only in light mode).

## 5. What works and what to improve for Ahmad's version

**Keep (patterns):**
1. One data file per project architecture, so adding a project needs no UI changes.
2. Kind-coloured nodes, highlight filters, and drill-down in the diagram.
3. Impact numbers directly on each card.
4. Animated tech-pipeline background in the hero, matched to his own stack.
5. Reduced-motion support, a mobile tab bar, and a light/dark theme.

**Do differently / better:**
1. **Own identity:** a different palette, type pairing and hero motif. Ahmad's story is "data flowing through
   pipelines into AI", so the backdrop shows streaming records moving through
   Ingest → Spark → Snowflake → Model → Alert lanes instead of a scattered constellation.
2. **Animated flow by default:** his diagrams are mostly static boxes. Ahmad's draw edges on scroll (Framer Motion
   `pathLength`), and data packets travel along each edge in order, so a viewer can *see* the pipeline run.
3. **"Step through" mode:** a play button highlights each stage in order with a one-line caption.
4. **Work vs side split:** tabs for "At work" (Citi, J&J Vision, Kelvin, Fibertex) and "Side projects"
   (GitHub), plus a stack filter ("show me everything with Snowflake").
5. **Lighter page:** his single page is ~15,700 px tall. Ahmad's project cards collapse to a summary card and
   open the full explorer in-place, so the page stays scannable.
6. **Confidentiality:** Citi entries use generic component names (e.g. "Reconciliation engine") with a
   `draft` flag until Ahmad provides approved details.

## 6. Proposed stack for Ahmad's site

Vite + React 18 + TypeScript + Tailwind CSS + Framer Motion, deployed as a static site on Netlify.
The diagrams are a custom SVG + Framer Motion component, not React Flow: React Flow adds ~150 KB and is built for
editing, while this site only needs animated viewing. That keeps the Lighthouse 90+ target realistic.
