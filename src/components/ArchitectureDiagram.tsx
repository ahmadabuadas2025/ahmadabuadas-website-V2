import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m, useInView, useReducedMotion } from 'framer-motion';
import type { Architecture, ArchNode, NodeFlag, NodeKind } from '../data/types';
import { computeLayout } from '../lib/layout';

export const KIND_LABEL: Record<NodeKind, string> = {
  source: 'Source',
  ingest: 'Ingest',
  process: 'Processing',
  store: 'Storage',
  ai: 'AI / model',
  rules: 'Rules & checks',
  output: 'Output',
  ui: 'Interface',
  infra: 'Infra & ops',
};

const FLAG_LABEL: Record<NodeFlag, string> = {
  ai: 'AI & agents',
  security: 'Security',
  test: 'Testing',
  automation: 'Automation',
};

const kc = (k: NodeKind) => `var(--k-${k})`;

/** Placeholder height before layout, to avoid layout shift. */
function estimateHeight(arch: Architecture, width: number) {
  return width > 0 ? computeLayout(arch, width).height : 320;
}

function nodeHasFlag(n: ArchNode, f: NodeFlag) {
  return n.flags?.includes(f) || (f === 'ai' && n.kind === 'ai');
}

interface Props {
  arch: Architecture;
  title: string;
}

export default function ArchitectureDiagram({ arch, title }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const inView = useInView(wrapRef, { once: true, margin: '0px 0px -15% 0px' });
  // Don't build the (heavy) diagram until it's close to the viewport
  const near = useInView(wrapRef, { once: true, margin: '600px 0px 600px 0px' });
  const reduce = useReducedMotion() ?? false;

  const [selected, setSelected] = useState<string | null>(null);
  const [flag, setFlag] = useState<NodeFlag | null>(null);
  const [step, setStep] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => (near && width > 0 ? computeLayout(arch, width) : null), [arch, width, near]);
  const nodeById = useMemo(() => Object.fromEntries(arch.nodes.map(n => [n.id, n])), [arch]);

  const steps = useMemo(
    () =>
      arch.steps ??
      arch.lanes.map(l => {
        const ns = arch.nodes.filter(n => n.lane === l.id);
        return { nodes: ns.map(n => n.id), caption: `${l.label}: ${ns.map(n => n.label).join(', ')}.` };
      }),
    [arch],
  );

  // Step-through playback
  useEffect(() => {
    if (step === null) return;
    const t = window.setTimeout(() => setStep(s => (s === null || s >= steps.length - 1 ? null : s + 1)), 2800);
    return () => window.clearTimeout(t);
  }, [step, steps.length]);

  const flagCounts = useMemo(() => {
    const c: Partial<Record<NodeFlag, number>> = {};
    (Object.keys(FLAG_LABEL) as NodeFlag[]).forEach(f => {
      const n = arch.nodes.filter(nd => nodeHasFlag(nd, f)).length;
      if (n) c[f] = n;
    });
    return c;
  }, [arch]);

  const kindsPresent = useMemo(() => [...new Set(arch.nodes.map(n => n.kind))], [arch]);

  // Which nodes are "lit" right now
  const active: Set<string> | null = useMemo(() => {
    if (step !== null) return new Set(steps[step].nodes);
    if (flag) return new Set(arch.nodes.filter(n => nodeHasFlag(n, flag)).map(n => n.id));
    if (selected) {
      const s = new Set([selected]);
      arch.edges.forEach(e => {
        if (e.from === selected) s.add(e.to);
        if (e.to === selected) s.add(e.from);
      });
      return s;
    }
    return null;
  }, [step, steps, flag, selected, arch]);

  const edgeLit = (from: string, to: string) => {
    if (!active) return true;
    if (selected && step === null && !flag) return from === selected || to === selected;
    return active.has(from) || active.has(to);
  };

  const sel = selected ? nodeById[selected] : null;
  const show = inView || reduce;

  return (
    <div className="rounded-2xl border border-line bg-surface/60">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2.5 sm:px-4">
        <button
          type="button"
          className="chip"
          aria-pressed={step !== null}
          onClick={() => {
            setFlag(null);
            setSelected(null);
            setStep(s => (s === null ? 0 : null));
          }}
        >
          {step === null ? (
            <>
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 0.5 L9 5 L1 9.5Z" fill="currentColor" /></svg>
              Play the pipeline
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="1" width="8" height="8" rx="1" fill="currentColor" /></svg>
              Stop · {step + 1}/{steps.length}
            </>
          )}
        </button>
        {Object.keys(flagCounts).length > 0 && (
          <span className="ml-1 hidden font-mono text-[0.68rem] uppercase tracking-widest text-faint sm:inline">Highlight</span>
        )}
        {(Object.keys(flagCounts) as NodeFlag[]).map(f => (
          <button
            key={f}
            type="button"
            className="chip"
            aria-pressed={flag === f}
            onClick={() => {
              setStep(null);
              setSelected(null);
              setFlag(cur => (cur === f ? null : f));
            }}
          >
            {FLAG_LABEL[f]} <b className="font-semibold text-ink">{flagCounts[f]}</b>
          </button>
        ))}
      </div>

      {/* stage */}
      <div
        ref={wrapRef}
        className="grid-dots relative w-full overflow-hidden"
        style={{ height: layout?.height ?? estimateHeight(arch, width) }}
        role="group"
        aria-label={`${title} architecture diagram. Select a component for details.`}
      >
        {layout && (
          <>
            {/* lane labels */}
            {layout.lanes.map((l, i) => (
              <m.div
                key={l.id}
                className="pointer-events-none absolute rounded-xl border border-dashed border-line"
                style={{ left: l.x - 6, top: l.y - 4, width: l.w + 12, height: l.h + 8 }}
                initial={reduce ? false : { opacity: 0 }}
                animate={show ? { opacity: 1 } : {}}
                transition={{ delay: i * 0.12, duration: 0.5 }}
              >
                <span className="absolute left-2.5 top-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-faint">
                  {String(i + 1).padStart(2, '0')} · {l.label}
                </span>
              </m.div>
            ))}

            {/* edges */}
            <svg className="pointer-events-none absolute inset-0" width={layout.width} height={layout.height} aria-hidden="true">
              <defs>
                <marker id={`ah-${title.replace(/\W/g, '')}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L8,4 L0,8 Z" fill="var(--faint)" />
                </marker>
              </defs>
              {layout.edges.map((e, i) => {
                const lit = edgeLit(e.from, e.to);
                const color = kc(nodeById[e.from].kind);
                return (
                  <g key={e.key} style={{ opacity: lit ? 1 : 0.15, transition: 'opacity .3s' }}>
                    <m.path
                      d={e.d}
                      fill="none"
                      stroke={active && lit ? color : 'var(--faint)'}
                      strokeWidth={active && lit ? 1.8 : 1.4}
                      strokeDasharray={active && lit ? undefined : '4 4'}
                      markerEnd={`url(#ah-${title.replace(/\W/g, '')})`}
                      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                      animate={show ? { pathLength: 1, opacity: 1 } : {}}
                      transition={{ delay: 0.25 + e.order * 0.18, duration: 0.7, ease: 'easeInOut' }}
                    />
                    {e.label && (
                      <text x={e.lx} y={e.ly} textAnchor="middle" className="fill-faint font-mono" fontSize="10">
                        {e.label}
                      </text>
                    )}
                    {show && !reduce && lit && (
                      <circle r={active ? 3.6 : 2.8} fill={color} className="packet" style={{ color }}>
                        <animateMotion
                          dur={`${2.2 + (i % 4) * 0.35}s`}
                          repeatCount="indefinite"
                          begin={`${0.9 + e.order * 0.18}s`}
                          path={e.d}
                          keyPoints="0;1"
                          keyTimes="0;1"
                          calcMode="linear"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* nodes */}
            {arch.nodes.map(n => {
              const b = layout.boxes[n.id];
              if (!b) return null;
              const dim = active ? !active.has(n.id) : false;
              const isSel = selected === n.id;
              const isLit = active?.has(n.id) && (step !== null || flag !== null || isSel);
              return (
                <m.div
                  key={n.id}
                  className="absolute"
                  style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
                  initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
                  animate={show ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ delay: 0.1 + b.laneIndex * 0.18, duration: 0.45, ease: 'easeOut' }}
                >
                  <button
                    type="button"
                    aria-pressed={isSel}
                    aria-label={`${n.label}${n.tech ? `, ${n.tech}` : ''}. ${KIND_LABEL[n.kind]}.`}
                    onClick={() => {
                      setStep(null);
                      setFlag(null);
                      setSelected(s => (s === n.id ? null : n.id));
                    }}
                    className="relative flex h-full w-full cursor-pointer flex-col justify-center overflow-hidden rounded-xl border bg-card px-3 text-left transition-[opacity,box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5"
                    style={{
                      opacity: dim ? 0.28 : 1,
                      borderColor: isLit ? kc(n.kind) : 'var(--border)',
                      boxShadow: isLit ? `0 0 0 1px ${kc(n.kind)}, 0 0 24px -4px ${kc(n.kind)}` : undefined,
                    }}
                  >
                    <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: kc(n.kind) }} aria-hidden="true" />
                    <span className="truncate text-[0.8rem] font-semibold leading-tight text-ink" title={n.label}>
                      {n.label}
                    </span>
                    {n.tech && (
                      <span className="mt-1 truncate font-mono text-[0.66rem] leading-tight text-muted" title={n.tech}>
                        {n.tech}
                      </span>
                    )}
                    {n.flags?.includes('security') && (
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full" style={{ background: 'var(--k-output)' }} aria-hidden="true" />
                    )}
                  </button>
                </m.div>
              );
            })}
          </>
        )}
      </div>

      {/* caption / detail panel */}
      <div className="min-h-[76px] border-t border-line px-4 py-3" aria-live="polite">
        <AnimatePresence mode="wait">
          {step !== null ? (
            <m.p
              key={`step-${step}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-sm text-ink"
            >
              <span className="mr-2 font-mono text-xs text-accent">
                STEP {step + 1}/{steps.length}
              </span>
              {steps[step].caption}
            </m.p>
          ) : sel ? (
            <m.div key={sel.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: kc(sel.kind) }} aria-hidden="true" />
                <span className="text-sm font-semibold text-ink">{sel.label}</span>
                <span className="font-mono text-[0.7rem] text-muted">
                  {KIND_LABEL[sel.kind]}
                  {sel.tech ? ` · ${sel.tech}` : ''}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{sel.detail ?? 'Select another component, or press Play to follow the data.'}</p>
            </m.div>
          ) : (
            <m.div key="legend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {kindsPresent.map(k => (
                <span key={k} className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] text-muted">
                  <span className="h-2 w-2 rounded-sm" style={{ background: kc(k) }} aria-hidden="true" />
                  {KIND_LABEL[k]}
                </span>
              ))}
              <span className="font-mono text-[0.68rem] text-faint">· Tap a component for details</span>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
