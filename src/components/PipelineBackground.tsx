import { useEffect, useRef } from 'react';
import { cssVar } from '../lib/theme';

/**
 * Hero backdrop: Ahmad's data path drawn as five stages
 * (sources → ingest → store → intelligence → action), with records flowing between them.
 * Canvas + rAF, paused off-screen and when the tab is hidden; a single static frame for reduced motion.
 */
const STAGES: string[][] = [
  ['Kafka', 'Teradata', 'OPC · MQTT', 'Transactions'],
  ['PySpark', 'Airflow', 'dbt'],
  ['Snowflake', 'Hive', 'Vector DB'],
  ['Anomaly model', 'LLM agent', 'Risk score'],
  ['AML alerts', 'Dashboards', 'Reports'],
];

interface Pill { x: number; y: number; w: number; label: string; stage: number; pulse: number }
interface Link { a: Pill; b: Pill; c1x: number; c1y: number; c2x: number; c2y: number }
interface Packet { link: Link; t: number; speed: number }

function bez(l: Link, t: number) {
  const mt = 1 - t;
  const x = mt * mt * mt * (l.a.x + l.a.w / 2) + 3 * mt * mt * t * l.c1x + 3 * mt * t * t * l.c2x + t * t * t * (l.b.x - l.b.w / 2);
  const y = mt * mt * mt * l.a.y + 3 * mt * mt * t * l.c1y + 3 * mt * t * t * l.c2y + t * t * t * l.b.y;
  return { x, y };
}

export default function PipelineBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, raf = 0, running = false, visible = true, armed = false, last = 0;
    // static links are drawn once to an offscreen layer, then blitted each frame
    const layer = document.createElement('canvas');
    const lctx = layer.getContext('2d')!;
    let pills: Pill[] = [];
    let links: Link[] = [];
    let packets: Packet[] = [];
    let colors = { line: '', text: '', pill: '', a: '', b: '', c: '' };

    const readColors = () => {
      colors = {
        line: cssVar('--border-strong'),
        text: cssVar('--muted'),
        pill: cssVar('--card'),
        a: cssVar('--accent'),
        b: cssVar('--accent-3'),
        c: cssVar('--accent-2'),
      };
    };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layer.width = canvas.width;
      layer.height = canvas.height;
      ctx.font = '500 11px "JetBrains Mono Variable", ui-monospace, monospace';

      const narrow = W < 760;
      // On wide screens the stages sit right of the hero text; on phones they span the width, faintly.
      const x0 = narrow ? W * 0.1 : W * 0.56;
      const x1 = narrow ? W * 0.9 : W * 0.93;
      pills = [];
      STAGES.forEach((labels, s) => {
        const x = x0 + ((x1 - x0) * s) / (STAGES.length - 1);
        const n = labels.length;
        labels.forEach((label, i) => {
          const y = H * 0.16 + ((H * 0.7) * (i + 0.5)) / n + (s % 2 ? 18 : -6);
          const w = ctx.measureText(label).width + 18;
          // keep every pill fully on screen
          const cx = Math.min(Math.max(x, w / 2 + 6), W - w / 2 - 6);
          pills.push({ x: cx, y, w, label, stage: s, pulse: 0 });
        });
      });
      links = [];
      for (let s = 0; s < STAGES.length - 1; s++) {
        const from = pills.filter(p => p.stage === s);
        const to = pills.filter(p => p.stage === s + 1);
        from.forEach((a, i) => {
          // link to the proportionally nearest node(s) in the next stage, so curves stay mostly horizontal
          const j = from.length === 1 ? 0 : Math.round((i * (to.length - 1)) / (from.length - 1));
          const targets = [to[j], to[Math.min(j + (i % 2 ? -1 : 1), to.length - 1)] ?? to[j]].filter(Boolean);
          new Set(targets).forEach(b => {
            const sx = a.x + a.w / 2, tx = b.x - b.w / 2;
            const dx = (tx - sx) * 0.5;
            links.push({ a, b, c1x: sx + dx, c1y: a.y, c2x: tx - dx, c2y: b.y });
          });
        });
      }
      packets = links.flatMap(link =>
        Array.from({ length: 1 + (Math.random() < 0.4 ? 1 : 0) }, () => ({ link, t: Math.random(), speed: 0.0025 + Math.random() * 0.003 })),
      );
    };

    const stageColor = (s: number) => (s < 2 ? colors.a : s < 4 ? colors.b : colors.c);

    const paintLayer = () => {
      const dpr = canvas.width / Math.max(W, 1);
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.clearRect(0, 0, layer.width, layer.height);
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.lineWidth = 1;
      lctx.setLineDash([3, 5]);
      lctx.strokeStyle = colors.line;
      links.forEach(l => {
        lctx.beginPath();
        lctx.moveTo(l.a.x + l.a.w / 2, l.a.y);
        lctx.bezierCurveTo(l.c1x, l.c1y, l.c2x, l.c2y, l.b.x - l.b.w / 2, l.b.y);
        lctx.stroke();
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(layer, 0, 0, W, H);
      // packets with short trails
      packets.forEach(p => {
        const col = stageColor(p.link.a.stage);
        for (let k = 4; k >= 0; k--) {
          const t = p.t - k * 0.018;
          if (t < 0) continue;
          const { x, y } = bez(p.link, t);
          ctx.globalAlpha = k === 0 ? 1 : 0.5 - k * 0.1;
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(x, y, k === 0 ? 2.4 : 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      // pills
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      pills.forEach(p => {
        const col = stageColor(p.stage);
        const h = 24;
        if (p.pulse > 0.05) {
          // cheap glow: a soft halo instead of shadowBlur
          ctx.globalAlpha = 0.22 * p.pulse;
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.roundRect(p.x - p.w / 2 - 5, p.y - h / 2 - 5, p.w + 10, h + 10, 11);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = colors.pill;
        ctx.strokeStyle = p.pulse > 0.05 ? col : colors.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(p.x - p.w / 2, p.y - h / 2, p.w, h, 7);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = colors.text;
        ctx.fillText(p.label, p.x, p.y + 0.5);
      });
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 32) return; // ~30 fps is plenty for a backdrop
      last = now;
      packets.forEach(p => {
        p.t += p.speed;
        if (p.t >= 1) {
          p.link.b.pulse = 1;
          p.t = 0;
          p.speed = 0.0025 + Math.random() * 0.003;
        }
      });
      pills.forEach(p => (p.pulse = Math.max(0, p.pulse - 0.025)));
      draw();
    };

    const start = () => {
      if (running || reduce || !armed || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    readColors();
    build();
    paintLayer();
    draw();
    // start animating only after the page has loaded and settled
    let armTimer = 0;
    const arm = () => {
      armTimer = window.setTimeout(() => {
        armed = true;
        start();
      }, 900);
    };
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });

    const ro = new ResizeObserver(() => {
      build();
      paintLayer();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    const mo = new MutationObserver(() => {
      readColors();
      paintLayer();
      draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    // fonts may load after first paint: re-measure pills
    document.fonts?.ready.then(() => {
      build();
      paintLayer();
      draw();
    });

    return () => {
      stop();
      window.clearTimeout(armTimer);
      window.removeEventListener('load', arm);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
