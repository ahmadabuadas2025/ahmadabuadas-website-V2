import type { Architecture } from '../data/types';

export interface Box {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  laneIndex: number;
}

export interface LaneBox {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface EdgePath {
  key: string;
  from: string;
  to: string;
  d: string;
  label?: string;
  /** label anchor */
  lx: number;
  ly: number;
  /** lane index of the source, used to stagger the draw-in */
  order: number;
}

export interface Layout {
  orientation: 'h' | 'v';
  width: number;
  height: number;
  boxes: Record<string, Box>;
  lanes: LaneBox[];
  edges: EdgePath[];
}

const NODE_H = 60;
const LANE_HEAD = 30;
const PAD = 14;

/**
 * Lays out an architecture in real pixels for a given container width.
 * Wide containers: lanes are columns (data flows left → right).
 * Narrow containers: lanes are rows (data flows top → bottom), up to 2 nodes per row.
 */
export function computeLayout(arch: Architecture, width: number): Layout {
  const laneCount = arch.lanes.length;
  const gapX = width > 900 ? 44 : 30;
  const colW = (width - PAD * 2 - gapX * (laneCount - 1)) / laneCount;
  const orientation: 'h' | 'v' = colW >= 128 ? 'h' : 'v';
  const laneIdx = Object.fromEntries(arch.lanes.map((l, i) => [l.id, i]));
  const byLane = arch.lanes.map(l => arch.nodes.filter(n => n.lane === l.id));

  const boxes: Record<string, Box> = {};
  const lanes: LaneBox[] = [];
  let height = 0;

  if (orientation === 'h') {
    const gapY = 20;
    const maxCount = Math.max(...byLane.map(n => n.length), 1);
    const bodyH = maxCount * NODE_H + (maxCount - 1) * gapY;
    height = PAD + LANE_HEAD + bodyH + PAD + 8;
    arch.lanes.forEach((lane, i) => {
      const x = PAD + i * (colW + gapX);
      lanes.push({ id: lane.id, label: lane.label, x, y: PAD, w: colW, h: LANE_HEAD + bodyH + 8 });
      const nodes = byLane[i];
      const stackH = nodes.length * NODE_H + (nodes.length - 1) * gapY;
      const top = PAD + LANE_HEAD + (bodyH - stackH) / 2;
      nodes.forEach((n, j) => {
        boxes[n.id] = { id: n.id, x, y: top + j * (NODE_H + gapY), w: colW, h: NODE_H, laneIndex: i };
      });
    });
  } else {
    const gapRow = 34;
    const gap = 10;
    const inner = width - PAD * 2;
    let y = PAD;
    arch.lanes.forEach((lane, i) => {
      const nodes = byLane[i];
      const perRow = nodes.length === 1 ? 1 : 2;
      const w = (inner - gap * (perRow - 1)) / perRow;
      const rows = Math.ceil(nodes.length / perRow);
      const laneH = LANE_HEAD - 6 + rows * NODE_H + (rows - 1) * gap;
      lanes.push({ id: lane.id, label: lane.label, x: PAD, y, w: inner, h: laneH });
      nodes.forEach((n, j) => {
        const r = Math.floor(j / perRow);
        const inRow = Math.min(perRow, nodes.length - r * perRow);
        const rowW = inRow * w + (inRow - 1) * gap;
        const x0 = PAD + (inner - rowW) / 2;
        const c = j % perRow;
        boxes[n.id] = { id: n.id, x: x0 + c * (w + gap), y: y + LANE_HEAD - 6 + r * (NODE_H + gap), w, h: NODE_H, laneIndex: i };
      });
      y += laneH + gapRow;
    });
    height = y - gapRow + PAD;
  }

  const edges: EdgePath[] = arch.edges
    .filter(e => boxes[e.from] && boxes[e.to])
    .map((e, i) => {
      const a = boxes[e.from];
      const b = boxes[e.to];
      const la = laneIdx[arch.nodes.find(n => n.id === e.from)!.lane];
      const lb = laneIdx[arch.nodes.find(n => n.id === e.to)!.lane];
      const { d, lx, ly } = orientation === 'h' ? pathH(a, b, la, lb) : pathV(a, b, la, lb);
      return { key: `${e.from}-${e.to}-${i}`, from: e.from, to: e.to, d, label: e.label, lx, ly, order: la };
    });

  return { orientation, width, height, boxes, lanes, edges };
}

function pathH(a: Box, b: Box, la: number, lb: number) {
  if (lb > la) {
    const sx = a.x + a.w, sy = a.y + a.h / 2;
    const tx = b.x, ty = b.y + b.h / 2;
    const dx = (tx - sx) / 2;
    return { d: `M${sx},${sy} C${sx + dx},${sy} ${tx - dx},${ty} ${tx},${ty}`, lx: (sx + tx) / 2, ly: (sy + ty) / 2 - 6 };
  }
  if (lb === la) {
    const down = b.y > a.y;
    const sx = a.x + a.w * 0.5, sy = down ? a.y + a.h : a.y;
    const tx = b.x + b.w * 0.5, ty = down ? b.y : b.y + b.h;
    return { d: `M${sx},${sy} L${tx},${ty}`, lx: sx + 8, ly: (sy + ty) / 2 };
  }
  // backward edge: loop over the top
  const sx = a.x + a.w / 2, sy = a.y;
  const tx = b.x + b.w / 2, ty = b.y;
  const lift = Math.min(sy, ty) - 22;
  return { d: `M${sx},${sy} C${sx},${lift} ${tx},${lift} ${tx},${ty}`, lx: (sx + tx) / 2, ly: lift + 10 };
}

function pathV(a: Box, b: Box, la: number, lb: number) {
  if (lb > la) {
    const sx = a.x + a.w / 2, sy = a.y + a.h;
    const tx = b.x + b.w / 2, ty = b.y;
    const dy = (ty - sy) / 2;
    return { d: `M${sx},${sy} C${sx},${sy + dy} ${tx},${ty - dy} ${tx},${ty}`, lx: (sx + tx) / 2 + 6, ly: (sy + ty) / 2 };
  }
  if (lb === la) {
    const right = b.x > a.x;
    const sameRow = Math.abs(a.y - b.y) < 2;
    if (sameRow) {
      const sx = right ? a.x + a.w : a.x, sy = a.y + a.h / 2;
      const tx = right ? b.x : b.x + b.w, ty = b.y + b.h / 2;
      return { d: `M${sx},${sy} L${tx},${ty}`, lx: (sx + tx) / 2, ly: sy - 6 };
    }
    const sx = a.x + a.w / 2, sy = a.y + a.h, tx = b.x + b.w / 2, ty = b.y;
    return { d: `M${sx},${sy} L${tx},${ty}`, lx: sx + 6, ly: (sy + ty) / 2 };
  }
  // backward edge: loop around the right side
  const sx = a.x + a.w, sy = a.y + a.h / 2;
  const tx = b.x + b.w, ty = b.y + b.h / 2;
  const out = Math.max(sx, tx) + 10;
  return { d: `M${sx},${sy} C${out},${sy} ${out},${ty} ${tx},${ty}`, lx: out - 30, ly: (sy + ty) / 2 };
}
