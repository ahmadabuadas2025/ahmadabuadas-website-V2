# Ahmad Abuadas: portfolio

Personal portfolio where every project is shown as a live, animated architecture map.
Vite + React 18 + TypeScript + Tailwind CSS 4 + Framer Motion. Static output, deployed on Netlify.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + build to dist/
npm run preview   # serve the build
```

## Editing content

All content lives in **`src/data/portfolio.ts`** (types in `src/data/types.ts`). The UI only reads it.

### Add a project

Add one object to `projects`. No component changes are needed.

```ts
{
  id: 'my-project',
  title: 'My Project',
  summary: 'One line.',
  role: 'What I did',
  timeframe: '2026',
  category: 'work',            // 'work' → "At work" tab, 'side' → "Side projects"
  employer: 'Citi',            // optional
  status: 'draft',             // 'live' | 'production' | 'shipped' | 'draft' (shown as "Overview")
  featured: true,              // true = diagram open; false = compact card with "Show architecture"
  problem: 'Why it existed.',
  stack: ['PySpark', 'Snowflake'],
  impact: [{ value: '40%', label: 'faster month-end close' }],
  links: { github: 'https://…', demo: 'https://…' },
  note: 'Generic overview. Internal names withheld.',   // optional footer note
  architecture: {
    lanes: [{ id: 'src', label: 'Sources' }, { id: 'proc', label: 'Processing' }],
    nodes: [
      { id: 'a', label: 'Feeds', lane: 'src', kind: 'source', tech: 'Kafka', detail: 'Shown when tapped.' },
      { id: 'b', label: 'Engine', lane: 'proc', kind: 'process', tech: 'PySpark', flags: ['test'] },
    ],
    edges: [{ from: 'a', to: 'b', label: 'optional' }],
    steps: [ /* optional "Play the pipeline" captions; defaults to one step per lane */ ],
  },
}
```

- **`kind`** sets the node colour: `source · ingest · process · store · ai · rules · output · ui · infra`.
- **`flags`** feed the Highlight chips: `ai · security · test · automation`.
- Keep `label` under about 22 characters and `tech` under about 24, so they fit in a box.

### Résumé download

Put a PDF in `public/` and set `profile.resumeUrl` (e.g. `'/Ahmad_Abuadas_Resume.pdf'`). The button appears automatically.

## Deploy (Netlify)

`netlify.toml` already sets the build command and publish dir. The contact form uses Netlify Forms
(static copy in `index.html`), so form submissions appear in the Netlify dashboard under **Forms**.

## Docs

- `docs/reference-analysis.md`: breakdown of the reference site and design decisions.
- `docs/content-outline.md`: content plan and open questions.
