#!/usr/bin/env node
// Build an excalidraw-drawing page or diagram from a spec (JSON).
//
//   node build.mjs page.json [--out-dir DIR] [--scale N] [--lint-only]
//
// Writes <name>.excalidraw (editable in Excalidraw) and <name>.png next to the
// spec, and prints a report: the size of every panel's drawing area, and
// warnings for anything that overflows, overlaps or got resized. Exit code 0
// with no warnings, 1 on an error, 3 when the page built but has warnings.
//
// Rendering is the pinned mcp-excalidraw-server runtime's offline renderer
// (Excalidraw's own exporter under jsdom), so the PNG matches what the
// .excalidraw file shows when opened.

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// ---------- runtime ----------

const here = path.dirname(fs.realpathSync(fileURLToPath(import.meta.url)));
const runtimeRoot = process.env.EXCALIDRAW_DRAWING_RUNTIME
  || path.resolve(here, '../../../runtime/excalidraw');
const pkg = path.join(runtimeRoot, 'node_modules/mcp-excalidraw-server');
if (!fs.existsSync(pkg)) {
  console.error(`The Excalidraw runtime is not installed at ${runtimeRoot}.\n` +
    `Run: npm ci --ignore-scripts --prefix ${runtimeRoot}`);
  process.exit(1);
}
const load = rel => import(pathToFileURL(path.join(pkg, rel)).href);
const { prepareScene } = await load('dist/core/render/excalidraw-node/index.js');
const { renderScene } = await load('dist/core/render/index.js');
const { measureTextWidth } = await load('dist/core/render/text-metrics.js');

// ---------- style ----------

export const STYLE = {
  font: 5,                       // Excalifont
  ink: '#1e1e1e',
  muted: '#495057',
  faint: '#adb5bd',
  panelStroke: '#ced4da',
  lineHeight: 1.25,
  // Measured from hand-drawn 1500×2000 pages: 48 px side margins, 30 px
  // between panels, 24 px inside them.
  page: { width: 1500, top: 28, margin: 48, gap: 30 },
  title: { size: 56 },
  subtitle: { size: 21 },
  panel: { pad: 24, heading: 24, body: 17, headingGap: 22, takeawayGap: 26, takeawayWidth: 520 },
  footer: { size: 15 }
};

// Page shapes as height ÷ width. 3:4 is what these posts use (1500×2000).
// "auto" grows to fit the content; "fit" also trims the width to it, for a
// single diagram that doesn't fill the page.
export const FORMATS = { '3:4': 4 / 3, '4:5': 5 / 4, 'a4': Math.SQRT2, 'square': 1, 'auto': null, 'fit': null };

const COLORS = {
  green: ['#b2f2bb', '#2f9e44'], orange: ['#ffd8a8', '#e8590c'], red: ['#ffc9c9', '#e03131'],
  blue: ['#a5d8ff', '#1971c2'], purple: ['#d0bfff', '#7048e8'], yellow: ['#ffec99', '#f08c00'],
  gray: ['#e9ecef', '#868e96'], cyan: ['#99e9f2', '#0c8599'], white: ['#ffffff', '#1e1e1e']
};

// ---------- text ----------

const fontCss = size => `${size}px Excalifont`;
const textWidth = (s, size) => measureTextWidth(s, fontCss(size));

export function wrap(text, size, maxWidth) {
  const out = [];
  for (const para of String(text).split('\n')) {
    // A line that fits stays exactly as written, spaces included.
    if (textWidth(para, size) <= maxWidth) { out.push(para); continue; }
    const words = para.split(/\s+/).filter(Boolean);
    let line = '';
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (line && textWidth(next, size) > maxWidth) { out.push(line); line = w; } else line = next;
    }
    out.push(line);
  }
  return out;
}

// A word too long for a wrapped text's width: wrapping can't break it, so it spills out.
const wordTooWide = el => el && el.autoResize === false &&
  Math.max(...String(el.text).split('\n').map(l => textWidth(l, el.fontSize))) > el.width + 1;

function textEl(id, x, y, text, size, opts = {}) {
  const lines = opts.width ? wrap(text, size, opts.width) : String(text).split('\n');
  const width = opts.width ?? Math.ceil(Math.max(...lines.map(l => textWidth(l, size))));
  const el = {
    id, type: 'text', x, y, text: lines.join('\n'), fontSize: size, fontFamily: STYLE.font,
    strokeColor: opts.color ?? STYLE.ink, textAlign: opts.align ?? 'left', verticalAlign: 'top',
    width, height: Math.ceil(lines.length * size * STYLE.lineHeight), lineHeight: STYLE.lineHeight
  };
  if (opts.width) { el.autoResize = false; el.originalText = String(text); }
  if (opts.groupIds) el.groupIds = opts.groupIds;
  if (opts.align === 'center') el.x = x - width / 2;
  return el;
}

// ---------- element expansion (panel-local coordinates) ----------

// A color name gives a fill and a stroke; a hex color is the stroke.
const strokeOf = color => !color ? undefined : COLORS[color]?.[1] ?? (color.startsWith('#') ? color : undefined);
function colorPair(el) {
  const c = el.color && COLORS[el.color];
  return {
    backgroundColor: el.backgroundColor ?? (c ? c[0] : 'transparent'),
    strokeColor: el.strokeColor ?? strokeOf(el.color) ?? STYLE.ink
  };
}

const SHAPES = new Set(['rectangle', 'ellipse', 'diamond']);

// Expand one spec element into Excalidraw skeleton elements. `boxes` collects
// every id's bounding box for arrow routing.
let autoId = 0;
function expand(el, pid, boxes, warnings) {
  const id = `${pid}.${el.id ?? `${el.type}${++autoId}`}`;
  const g = [id + '.g'];
  const out = [];
  const common = { roughness: el.roughness ?? 1, strokeWidth: el.strokeWidth ?? 2, fillStyle: el.fillStyle ?? 'solid',
    strokeStyle: el.strokeStyle ?? 'solid', opacity: el.opacity ?? 100 };

  switch (el.type) {
    case 'rectangle': case 'ellipse': case 'diamond': {
      const s = { ...common, ...colorPair(el), id, type: el.type, x: el.x, y: el.y,
        width: el.width ?? 160, height: el.height ?? 70 };
      if (el.type === 'rectangle') s.roundness = el.sharp ? null : { type: 3 };
      const label = el.label ?? el.text;
      const L = label ? (typeof label === 'string' ? { text: label } : label) : null;
      if (L && (L.valign === 'top' || L.align === 'left')) {
        // The renderer centres bound labels whatever they ask, so a top or
        // left label is a free text grouped with its shape.
        s.groupIds = [id + '.g'];
        out.push(s);
        const size = L.fontSize ?? STYLE.panel.body, left = L.align === 'left';
        const t = textEl(`${id}.label`, left ? s.x + 18 : s.x + s.width / 2, s.y + 12, L.text, size,
          { width: Math.max(1, s.width - 36), align: left ? 'left' : 'center',
            color: L.color ?? STYLE.ink, groupIds: s.groupIds });
        if (L.valign !== 'top') t.y = s.y + (s.height - t.height) / 2;
        out.push(t);
      } else {
        if (L) s.label = { text: L.text, fontSize: L.fontSize ?? STYLE.panel.body, fontFamily: STYLE.font,
          strokeColor: L.color ?? STYLE.ink, textAlign: L.align ?? 'center', verticalAlign: 'middle' };
        out.push(s);
      }
      boxes[id] = { x: s.x, y: s.y, w: s.width, h: s.height, bind: true, shape: el.type };
      break;
    }
    case 'text': {
      if (!String(el.text ?? '').trim()) { warnings.push(`${pid}: an empty text (${el.id ?? 'no id'}) skipped`); break; }
      const t = textEl(id, el.x, el.y, el.text, el.fontSize ?? STYLE.panel.body,
        { width: el.width, color: el.strokeColor ?? strokeOf(el.color), align: el.align });
      out.push(t);
      boxes[id] = { x: t.x, y: t.y, w: t.width, h: t.height, bind: false };
      break;
    }
    case 'window': {
      // A rounded window with "•••" and a title in its title bar.
      const w = el.width ?? 240, h = el.height ?? 90;
      const c = colorPair({ ...el, backgroundColor: el.backgroundColor ?? (el.color ? undefined : '#ffffff') });
      out.push({ ...common, id, type: 'rectangle', x: el.x, y: el.y, width: w, height: h,
        roundness: { type: 3 }, groupIds: g, ...c });
      const titleText = el.dots === false ? (el.title ?? '') : `•••  ${el.title ?? ''}`;
      // Excalidraw drops empty text elements, so a bare window gets none.
      if (titleText.trim()) out.push(textEl(`${id}.title`, el.x + 14, el.y + 6, titleText, el.fontSize ?? 15, { groupIds: g }));
      out.push({ ...common, id: `${id}.bar`, type: 'line', x: el.x, y: el.y + 30, strokeWidth: 1,
        strokeColor: STYLE.ink, points: [[0, 0], [w, 0]], groupIds: g });
      if (el.lines) out.push(...lines({ x: el.x + 14, y: el.y + 46, width: w - 28, count: el.lines }, id, g));
      boxes[id] = { x: el.x, y: el.y, w, h, bind: false };
      break;
    }
    case 'stack': {
      // Overlapping windows, back to front; the last one is on top.
      const items = el.items ?? ['one', 'two', 'three'];
      const [dx, dy] = el.offset ?? [36, 30];
      const w = el.width ?? 220, h = el.height ?? 80;
      // The windows' ids come from the stack's own, generated when it has none.
      const local = id.slice(pid.length + 1);
      items.forEach((title, i) => out.push(...expand({ type: 'window', id: `${local}.${i}`, x: el.x + i * dx,
        y: el.y + i * dy, width: w, height: h, title, lines: i === items.length - 1 ? el.lines : undefined,
        color: el.color, dots: el.dots }, pid, {}, warnings)
        .map(e => ({ ...e, groupIds: [...(e.groupIds ?? []), id + '.stack'] }))));
      const spanX = dx * (items.length - 1), spanY = dy * (items.length - 1);
      boxes[id] = { x: el.x + Math.min(0, spanX), y: el.y + Math.min(0, spanY), w: w + Math.abs(spanX), h: h + Math.abs(spanY), bind: false };
      break;
    }
    case 'person': {
      // Stick figure, ~50×90 at size 1, with an optional label under it.
      const k = el.size ?? 1, x = el.x, y = el.y, cx = x + 25 * k;
      const ln = (sid, pts) => ({ ...common, id: `${id}.${sid}`, type: 'line', x: cx, y,
        strokeColor: el.strokeColor ?? STYLE.ink, points: pts.map(([a, b]) => [a * k, b * k]), groupIds: g });
      out.push({ ...common, id: `${id}.head`, type: 'ellipse', x: cx - 12 * k, y, width: 24 * k, height: 24 * k,
        strokeColor: el.strokeColor ?? STYLE.ink, backgroundColor: 'transparent', groupIds: g });
      out.push(ln('body', [[0, 24], [0, 60]]), ln('arms', [[-20, 36], [0, 42], [20, 36]]),
        ln('legs', [[-16, 90], [0, 60], [16, 90]]));
      let h = 90 * k;
      if (el.label) {
        const t = textEl(`${id}.label`, cx, y + h + 8, el.label, el.fontSize ?? 16, { align: 'center', groupIds: g, color: STYLE.muted });
        out.push(t); h += 8 + t.height;
      }
      boxes[id] = { x, y, w: 50 * k, h, bind: false };
      break;
    }
    case 'lines': {
      out.push(...lines(el, id, g));
      boxes[id] = { x: el.x, y: el.y, w: el.width ?? 160, h: (el.count ?? 2) * (el.gap ?? 14), bind: false };
      break;
    }
    case 'line': case 'arrow': {
      const { group: _g, curve, ...rest } = el;
      const l = { ...common, ...rest, id, _spec: el, strokeColor: el.strokeColor ?? strokeOf(el.color) ?? STYLE.ink };
      // Excalidraw draws a smooth curve through the points of a "round" line.
      if (curve) l.roundness = { type: 2 };
      out.push(l);
      break;
    }
    case 'chart': {
      const c = el.kind === 'bar' ? barChart(el, id, g, common, pid, warnings) : lineChart(el, id, g, common, pid, warnings);
      out.push(...c.out);
      boxes[id] = { ...c.box, bind: false };
      break;
    }
    default:
      warnings.push(`${pid}: unknown element type "${el.type}" (${el.id ?? 'no id'}) skipped`);
  }
  // Elements sharing a "group" are one drawing: they move together in
  // Excalidraw, and the checks let their parts overlap.
  if (el.group) for (const e of out) e.groupIds = [...(e.groupIds ?? []), `${pid}.group.${el.group}`];
  return out;
}

function lines(el, id, g) {
  const n = el.count ?? 2, gap = el.gap ?? 14, w = el.width ?? 160;
  return Array.from({ length: n }, (_, i) => ({
    id: `${id}.l${i}`, type: 'line', x: el.x, y: el.y + i * gap, strokeColor: STYLE.faint, strokeWidth: 1,
    roughness: 1, points: [[0, 0], [i === n - 1 ? w * 0.7 : w, 0]], groupIds: g
  }));
}

// ---------- charts (scaled from data, so no number is placed by hand) ----------

const tickList = ticks => (ticks ?? []).map(t => Array.isArray(t) ? { v: t[0], text: String(t[1]) } : { v: t, text: String(t) });
const finite = v => typeof v === 'number' && Number.isFinite(v);

// Push labels down until none overlaps the one above it, keeping their order.
function unstack(labels, gap = 4) {
  labels.sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) {
    const prev = labels[i - 1];
    if (labels[i].y < prev.y + prev.height + gap) labels[i].y = prev.y + prev.height + gap;
  }
}

// A line chart: axes, optional ticks and grid, one line per series, each
// series named next to its first or last point. x, y, width and height are
// the chart's whole footprint; the plot area is what the labels leave.
function lineChart(el, id, g, common, pid, warnings) {
  const fs = el.fontSize ?? 18, small = Math.max(14, fs - 2);
  const x0 = el.x ?? 0, y0 = el.y ?? 0, W = el.width ?? 600, H = el.height ?? 360;
  const X = el.xAxis ?? {}, Y = el.yAxis ?? {};
  const series = (el.series ?? []).filter(s => {
    const ok = Array.isArray(s.points) && s.points.length >= 2 && s.points.every(p => finite(p?.[0]) && finite(p?.[1]));
    if (!ok) warnings.push(`${pid}: chart "${el.id ?? 'no id'}": series "${s.label ?? '?'}" needs two or more [x, y] number points: skipped`);
    return ok;
  });
  const box = { x: x0, y: y0, w: W, h: H };
  if (!series.length) { warnings.push(`${pid}: chart "${el.id ?? 'no id'}" has no series to draw`); return { out: [], box }; }
  const pts = series.flatMap(s => s.points);
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const xmin = X.min ?? Math.min(...xs), xmax = X.max ?? Math.max(...xs);
  // The y axis starts at 0 unless a value is negative, and ends at the largest
  // value; data that is all one value still gets a range.
  const ymin = Y.min ?? Math.min(0, ...ys);
  let ymax = Y.max ?? Math.max(...ys);
  if (Y.max === undefined && ymax === ymin) ymax = ymin + 1;
  if (!(xmax > xmin) || !(ymax > ymin)) {
    warnings.push(`${pid}: chart "${el.id ?? 'no id'}": an axis has no range (min must be below max)`);
    return { out: [], box };
  }
  const xt = tickList(X.ticks), yt = tickList(Y.ticks);
  const side = el.labels ?? (yt.length ? 'end' : 'start');
  const named = side === 'none' ? [] : series.filter(s => s.label);
  const labelW = Math.max(0, ...named.map(s => textWidth(s.label, fs)));
  const yTickW = yt.length ? Math.max(...yt.map(t => textWidth(t.text, small))) + 16 : 0;
  const leftM = (side === 'start' && named.length ? labelW + 20 : 4) + yTickW;
  const rightM = Math.max(X.label ? textWidth(X.label, fs) + 18 : 4, side === 'end' && named.length ? labelW + 18 : 0);
  const topM = Y.label ? fs * STYLE.lineHeight + 18 : 12;
  const bottomM = Math.max(xt.length ? small * STYLE.lineHeight + 14 : 0, fs * 0.7);
  const px = x0 + leftM, py = y0 + topM, pw = W - leftM - rightM, ph = H - topM - bottomM;
  if (pw < 120 || ph < 80) {
    warnings.push(`${pid}: chart "${el.id ?? 'no id'}" leaves a plot of only ${Math.round(pw)}×${Math.round(ph)} px after its labels: make it bigger`);
  }
  const sx = v => px + (v - xmin) / (xmax - xmin) * pw;
  const sy = v => py + ph - (v - ymin) / (ymax - ymin) * ph;
  const out = [];
  const line = (sid, x, y, points, extra = {}) => out.push({ ...common, id: `${id}.${sid}`, type: 'line', x, y, points,
    strokeColor: STYLE.muted, groupIds: g, ...extra });
  const text = (sid, x, y, s, size, color = STYLE.ink) => {
    const t = textEl(`${id}.${sid}`, x, y, s, size, { color, groupIds: g });
    out.push(t); return t;
  };

  if (el.grid) yt.forEach((t, i) => line(`grid${i}`, px, sy(t.v), [[0, 0], [pw, 0]],
    { strokeColor: '#dee2e6', strokeWidth: 1, strokeStyle: 'dashed', roughness: 0 }));
  line('yaxis', px, py - 6, [[0, 0], [0, ph + 6]]);
  line('xaxis', px, py + ph, [[0, 0], [pw + 6, 0]]);
  if (Y.label) { const w = textWidth(Y.label, fs); text('ylabel', Math.max(x0, px - w / 2), y0, Y.label, fs); }
  if (X.label) text('xlabel', px + pw + 16, py + ph - fs * STYLE.lineHeight / 2, X.label, fs);
  yt.forEach((t, i) => {
    line(`ytick${i}`, px - 6, sy(t.v), [[0, 0], [6, 0]]);
    const tw = textWidth(t.text, small);
    text(`yt${i}`, px - 12 - tw, sy(t.v) - small * STYLE.lineHeight / 2, t.text, small, STYLE.muted);
  });
  xt.forEach((t, i) => {
    line(`xtick${i}`, sx(t.v), py + ph, [[0, 0], [0, 6]]);
    const tw = textWidth(t.text, small);
    text(`xt${i}`, sx(t.v) - tw / 2, py + ph + 10, t.text, small, STYLE.muted);
  });

  for (const [axis, ticks, lo, hi] of [['x', xt, xmin, xmax], ['y', yt, ymin, ymax]]) {
    if (ticks.some(t => t.v < lo || t.v > hi)) warnings.push(`${pid}: chart "${el.id ?? 'no id'}": a ${axis} tick is outside the axis range`);
  }
  const labels = { start: [], end: [] };
  series.forEach((s, i) => {
    const color = strokeOf(s.color) ?? STYLE.ink;
    if (s.points.some(([vx, vy]) => vx < xmin || vx > xmax || vy < ymin || vy > ymax)) {
      warnings.push(`${pid}: chart "${el.id ?? 'no id'}": series "${s.label ?? i + 1}" has a point outside the axis range: widen the range`);
    }
    const P = s.points.map(([vx, vy]) => [sx(vx), sy(vy)]);
    out.push({ ...common, id: `${id}.s${i}`, type: 'line', x: P[0][0], y: P[0][1],
      points: P.map(([a, b]) => [a - P[0][0], b - P[0][1]]), strokeColor: color,
      strokeWidth: s.strokeWidth ?? el.strokeWidth ?? 2, strokeStyle: s.strokeStyle ?? 'solid',
      // Smooth curves suit a sketched trend; with y ticks the points are
      // measurements, and a curve could bulge past them, so lines are straight.
      roundness: (s.curve ?? el.curve ?? !yt.length) ? { type: 2 } : null, groupIds: g });
    if (s.markers ?? el.markers) P.forEach(([a, b], k) => out.push({ ...common, id: `${id}.s${i}.m${k}`, type: 'ellipse',
      x: a - 5, y: b - 5, width: 10, height: 10, strokeColor: color, backgroundColor: color, strokeWidth: 1, groupIds: g }));
    if (side === 'none' || !s.label) return;
    const h = fs * STYLE.lineHeight, w = textWidth(s.label, fs);
    const [ax, ay] = side === 'end' ? P[P.length - 1] : P[0];
    // A start label sits left of the axis when its series starts on it, else
    // just left of its first point.
    const startX = ax > px + 1 ? ax - 12 - w : px - yTickW - 16 - w;
    labels[side === 'end' ? 'end' : 'start'].push({ i, text: s.label, color,
      x: side === 'end' ? ax + 12 : startX, y: ay - h / 2, height: h });
  });
  for (const group of Object.values(labels)) {
    unstack(group);
    for (const l of group) text(`label${l.i}`, l.x, l.y, l.text, fs, l.color);
  }
  // Names pushed apart may end below the footprint: the box must hold them, for arrows routed to it.
  const bottom = Math.max(...out.filter(e => e.type === 'text').map(t => t.y + t.height));
  if (bottom > y0 + H) box.h = bottom - y0;
  return { out, box };
}

// A horizontal bar chart: one bar per item, scaled to the largest value (or
// `max`), with the label on the left and the value at the bar's end.
function barChart(el, id, g, common, pid, warnings) {
  const fs = el.fontSize ?? 17, barH = el.barHeight ?? 32, gap = el.gap ?? 18;
  const x0 = el.x ?? 0, y0 = el.y ?? 0, W = el.width ?? 560;
  const bars = (el.bars ?? []).filter(b => {
    const ok = finite(b.value) && b.value >= 0;
    if (!ok) warnings.push(`${pid}: chart "${el.id ?? 'no id'}": bar "${b.label ?? '?'}" needs a value of 0 or more: skipped`);
    return ok;
  });
  if (!bars.length) {
    warnings.push(`${pid}: chart "${el.id ?? 'no id'}" has no bars to draw`);
    return { out: [], box: { x: x0, y: y0, w: W, h: 0 } };
  }
  const out = [];
  let y = y0;
  if (el.unit) { const t = textEl(`${id}.unit`, x0, y0, el.unit, 16, { color: STYLE.muted, groupIds: g }); out.push(t); y += t.height + 14; }
  const shown = b => b.display ?? String(b.value);
  const labelW = Math.max(...bars.map(b => textWidth(b.label ?? '', fs))) + 24;
  const valueW = Math.max(...bars.map(b => textWidth(shown(b), fs))) + 12;
  const max = el.max ?? Math.max(...bars.map(b => b.value));
  if (bars.some(b => b.value > max)) warnings.push(`${pid}: chart "${el.id ?? 'no id'}": a bar is longer than max ${max}`);
  const scale = max > 0 ? (W - labelW - valueW) / max : 0;
  if (W - labelW - valueW < 120) warnings.push(`${pid}: chart "${el.id ?? 'no id'}" leaves bars only ${Math.round(W - labelW - valueW)} px: make it wider or the labels shorter`);
  const th = fs * STYLE.lineHeight;
  bars.forEach((b, i) => {
    // A zero gets no bar; a value too small to see at this scale still shows as a sliver.
    const by = y + i * (barH + gap), bw = b.value > 0 ? Math.max(2, b.value * scale) : 0;
    if (b.label) out.push(textEl(`${id}.l${i}`, x0, by + (barH - th) / 2, b.label, fs, { groupIds: g }));
    const c = COLORS[b.color ?? el.color ?? 'blue'] ?? COLORS.blue;
    if (bw > 0) out.push({ ...common, id: `${id}.b${i}`, type: 'rectangle', x: x0 + labelW, y: by, width: bw, height: barH,
      backgroundColor: c[0], strokeColor: c[1], fillStyle: el.fillStyle ?? 'hachure', roundness: null, groupIds: g });
    out.push(textEl(`${id}.v${i}`, x0 + labelW + bw + 10, by + (barH - th) / 2, shown(b), fs, { groupIds: g }));
  });
  return { out, box: { x: x0, y: y0, w: W, h: y - y0 + bars.length * (barH + gap) - gap } };
}

// Route an arrow between two boxes: side to side when they sit apart
// horizontally, else bottom to top. Several arrows on one side of a box are
// spread along it (offA, offB), so their heads don't pile up on one point;
// an ellipse is met on its curve, aimed at the other end.
const centre = b => [b.x + b.w / 2, b.y + b.h / 2];
function sidesOf(a, b) {
  const [ax, ay] = centre(a), [bx, by] = centre(b);
  const dx = bx - ax, dy = by - ay;
  const horizontalGap = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w));
  if (horizontalGap > 0 && Math.abs(dx) >= Math.abs(dy) * 0.5) {
    return { a: dx > 0 ? 'right' : 'left', b: dx > 0 ? 'left' : 'right' };
  }
  return { a: dy > 0 ? 'bottom' : 'top', b: dy > 0 ? 'top' : 'bottom' };
}
function anchor(box, side, offset, gap) {
  const [cx, cy] = centre(box);
  if (side === 'right') return [box.x + box.w + gap, cy + offset];
  if (side === 'left') return [box.x - gap, cy + offset];
  if (side === 'bottom') return [cx + offset, box.y + box.h + gap];
  return [cx + offset, box.y - gap];
}
function onEllipse(box, [tx, ty], gap) {
  const [cx, cy] = centre(box), rx = box.w / 2, ry = box.h / 2;
  const dx = tx - cx, dy = ty - cy, len = Math.hypot(dx, dy) || 1;
  const t = 1 / Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2);
  return [cx + dx * t + (dx / len) * gap, cy + dy * t + (dy / len) * gap];
}
function route(a, b, gap = 6, offA = 0, offB = 0) {
  const sides = sidesOf(a, b);
  let p1 = anchor(a, sides.a, offA, gap), p2 = anchor(b, sides.b, offB, gap);
  if (a.shape === 'ellipse') p1 = onEllipse(a, b.shape === 'ellipse' ? centre(b) : p2, gap);
  if (b.shape === 'ellipse') p2 = onEllipse(b, p1, gap);
  return [p1, p2];
}

// Spread the ends that share one side of one box, ordered by where the other
// end is, so the arrows fan out without crossing.
function planSpread(linear, pid, boxes) {
  const ref = r => r && `${pid}.${typeof r === 'string' ? r : r.id}`;
  const ends = new Map();
  for (const el of linear) {
    const spec = el._spec;
    if (spec.points) continue;
    const s = ref(spec.start ?? spec.from), e = ref(spec.end ?? spec.to);
    if (!boxes[s] || !boxes[e]) continue;
    const sides = sidesOf(boxes[s], boxes[e]);
    for (const [id, side, which, other] of [[s, sides.a, 'a', boxes[e]], [e, sides.b, 'b', boxes[s]]]) {
      const key = `${id}|${side}`;
      if (!ends.has(key)) ends.set(key, { box: boxes[id], side, items: [] });
      ends.get(key).items.push({ el, which, other: centre(other) });
    }
  }
  for (const { box, side, items } of ends.values()) {
    if (items.length < 2 || box.shape === 'ellipse') continue;
    const along = side === 'left' || side === 'right' ? 1 : 0;
    items.sort((p, q) => p.other[along] - q.other[along]);
    const length = along ? box.h : box.w;
    const step = Math.min((length * 0.6) / (items.length - 1), 28);
    items.forEach((it, i) => {
      it.el._off = { ...(it.el._off ?? {}), [it.which]: (i - (items.length - 1) / 2) * step };
    });
  }
}

function finishLinear(el, pid, boxes, warnings) {
  const spec = el._spec, off = el._off ?? {}; delete el._spec; delete el._off;
  const ref = r => r && (typeof r === 'string' ? r : r.id) && `${pid}.${typeof r === 'string' ? r : r.id}`;
  const s = ref(spec.start ?? spec.from), e = ref(spec.end ?? spec.to);
  for (const k of ['start', 'end', 'from', 'to']) delete el[k];
  if (spec.points && spec.x !== undefined) {
    el.points = spec.points;
  } else if (s && e) {
    if (!boxes[s] || !boxes[e]) { warnings.push(`${el.id}: connects to unknown id ${!boxes[s] ? s : e}`); return null; }
    const [[x1, y1], [x2, y2]] = route(boxes[s], boxes[e], spec.gap ?? 8, off.a ?? 0, off.b ?? 0);
    el.x = x1; el.y = y1;
    el.points = spec.elbow && x1 !== x2 && y1 !== y2
      ? [[0, 0], [0, (y2 - y1) / 2], [x2 - x1, (y2 - y1) / 2], [x2 - x1, y2 - y1]]
      : [[0, 0], [x2 - x1, y2 - y1]];
  } else if (spec.points) {
    el.x = spec.x ?? 0; el.y = spec.y ?? 0; el.points = spec.points;
  } else {
    warnings.push(`${el.id}: an arrow needs start/end ids or x, y and points`); return null;
  }
  if (el.type === 'arrow') {
    if (s && boxes[s]?.bind) el.start = { id: s };
    if (e && boxes[e]?.bind) el.end = { id: e };
    el.endArrowhead = spec.endArrowhead === undefined ? 'arrow' : spec.endArrowhead;
    el.startArrowhead = spec.startArrowhead ?? null;
  }
  if (spec.label) el.label = { text: spec.label, fontSize: 15, fontFamily: STYLE.font };
  return el;
}

// ---------- geometry ----------

function bbox(el) {
  if (el.type === 'arrow' || el.type === 'line') {
    const xs = el.points.map(p => p[0]), ys = el.points.map(p => p[1]);
    return { x: el.x + Math.min(...xs), y: el.y + Math.min(...ys),
      w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  }
  return { x: el.x, y: el.y, w: el.width, h: el.height };
}
function union(boxes) {
  if (!boxes.length) return { x: 0, y: 0, w: 0, h: 0 };
  const x = Math.min(...boxes.map(b => b.x)), y = Math.min(...boxes.map(b => b.y));
  return { x, y, w: Math.max(...boxes.map(b => b.x + b.w)) - x, h: Math.max(...boxes.map(b => b.y + b.h)) - y };
}
const contains = (a, b, t = 1) => b.x >= a.x - t && b.y >= a.y - t && b.x + b.w <= a.x + a.w + t && b.y + b.h <= a.y + a.h + t;
const intersects = (a, b, t = 2) => a.x + t < b.x + b.w && b.x + t < a.x + a.w && a.y + t < b.y + b.h && b.y + t < a.y + a.h;

// ---------- page ----------

export async function build(spec, opts = {}) {
  const warnings = [];
  const P = STYLE.page, PS = STYLE.panel;
  const pageW = spec.width ?? P.width;
  const innerW = pageW - 2 * P.margin;
  const colW = (innerW - P.gap) / 2;
  const elements = [];

  const formatName = spec.format ?? '3:4';
  if (!(formatName in FORMATS)) throw new Error(`format must be one of ${Object.keys(FORMATS).join(', ')}`);
  const ratio = FORMATS[formatName];

  // Header
  let y = P.top;
  // Like a panel's heading, the title is optional: Excalidraw drops an empty text.
  if (String(spec.title ?? '').trim()) {
    const title = textEl('page.title', P.margin, y, spec.title, STYLE.title.size, { width: innerW });
    if (wordTooWide(title)) warnings.push('page: the title has a word wider than the page: shorten it');
    elements.push(title); y += title.height + 6;
  }
  if (spec.subtitle) {
    const sub = textEl('page.subtitle', P.margin, y, spec.subtitle, STYLE.subtitle.size, { width: innerW, color: STYLE.muted });
    if (wordTooWide(sub)) warnings.push('page: the subtitle has a word wider than the page: shorten it');
    elements.push(sub); y += sub.height;
  }
  y += 24;

  // Prepare each panel's drawing in local coordinates, so its true size is
  // known before rows are laid out.
  const panels = [];
  for (const [i, p] of (spec.panels ?? []).entries()) {
    const pid = p.id ?? `p${i + 1}`;
    const span = p.span === 2 || p.span === 'full' ? 2 : 1;
    const w = span === 2 ? innerW : colW;
    // A panel without a frame is a bare drawing: no card, so no padding either.
    const framed = (p.frame ?? spec.frame) !== false;
    const pad = framed ? PS.pad : 0;
    const areaW = w - 2 * pad;
    const boxes = {};
    const raw = (p.elements ?? []).flatMap(el => expand(el, pid, boxes, warnings));
    planSpread(raw.filter(el => (el.type === 'arrow' || el.type === 'line') && el._spec), pid, boxes);
    const skel = raw.map(el => (el.type === 'arrow' || el.type === 'line') && el._spec
      ? finishLinear(el, pid, boxes, warnings) : el).filter(Boolean);
    const prepared = skel.length ? await prepareScene(skel) : [];
    // The heading is optional: Excalidraw drops an empty text, so none is drawn.
    const heading = String(p.heading ?? '').trim() ? textEl(`${pid}.heading`, 0, 0, p.heading, PS.heading, { width: areaW }) : null;
    const takeaway = p.takeaway
      ? textEl(`${pid}.takeaway`, 0, 0, p.takeaway, PS.body, { width: Math.min(areaW, p.takeawayWidth ?? PS.takeawayWidth) })
      : null;
    const drawn = union(prepared.filter(e => !e.isDeleted).map(bbox));
    for (const [el, name] of [[heading, 'heading'], [takeaway, 'takeaway']]) {
      if (wordTooWide(el)) warnings.push(`${pid}: the ${name} has a word wider than the panel: shorten it`);
    }
    panels.push({ pid, span, w, areaW, pad, framed, prepared, heading, takeaway, drawn, spec: p, skel });
  }

  // Rows: a full-width panel takes a row; half panels pair up in order.
  const rows = [];
  for (const p of panels) {
    const last = rows[rows.length - 1];
    if (p.span === 1 && last && last.length === 1 && last[0].span === 1) last.push(p);
    else rows.push([p]);
  }
  const headH = p => p.heading ? p.heading.height + PS.headingGap : 0;
  const natural = p => p.pad + headH(p) + Math.max(0, p.drawn.y + p.drawn.h)
    + (p.takeaway ? PS.takeawayGap + p.takeaway.height : 0) + p.pad;

  const report = [];
  const heights = rows.map(row => Math.max(...row.map(p => Math.max(natural(p), p.spec.minHeight ?? 0))));
  const footerEl = spec.footer
    ? textEl('page.footer', P.margin, 0, spec.footer, STYLE.footer.size, { width: innerW, color: STYLE.muted }) : null;
  if (wordTooWide(footerEl)) warnings.push('page: the footer has a word wider than the page: shorten it');
  const footerH = footerEl ? 16 + footerEl.height : 0;
  const contentH = y + heights.reduce((a, b) => a + b, 0) + P.gap * Math.max(0, rows.length - 1) + footerH + P.margin;
  const targetH = ratio ? Math.round(pageW * ratio) : contentH;
  if (contentH > targetH + 1) {
    warnings.push(`page: the content needs ${Math.round(contentH)} px but ${formatName} is ${targetH} px tall: ` +
      `cut ${Math.ceil(contentH - targetH)} px (shorter takeaways, smaller drawings, fewer panels) or use another format`);
  } else if (rows.length) {
    // Spread the spare height over the rows; panels keep their content at the top.
    const extra = (targetH - contentH) / rows.length;
    heights.forEach((h, i) => { heights[i] = h + extra; });
  }
  for (const [ri, row] of rows.entries()) {
    const h = heights[ri];
    row.forEach((p, j) => {
      const px = P.margin + j * (colW + P.gap), py = y;
      const ax = px + p.pad, ay = py + p.pad + headH(p);
      if (p.framed) elements.push({ id: `${p.pid}.card`, type: 'rectangle', x: px, y: py, width: p.w, height: h,
        strokeColor: p.spec.strokeColor ?? STYLE.panelStroke, backgroundColor: p.spec.backgroundColor ?? '#ffffff',
        fillStyle: 'solid', strokeWidth: 2, roughness: 1, roundness: { type: 3 } });
      if (p.heading) elements.push({ ...p.heading, x: px + p.pad, y: py + p.pad });
      for (const el of p.prepared) elements.push({ ...el, x: el.x + ax, y: el.y + ay });
      if (p.takeaway) elements.push({ ...p.takeaway, x: px + p.pad, y: ay + Math.max(0, p.drawn.y + p.drawn.h) + PS.takeawayGap });
      lintPanel(p, warnings);
      report.push(`${p.pid}: drawing area ${Math.round(p.areaW)} wide, drawing uses ` +
        `${Math.round(p.drawn.x + p.drawn.w)}×${Math.round(p.drawn.y + p.drawn.h)}; panel ${Math.round(p.w)}×${Math.round(h)}`);
    });
    y += h + P.gap;
  }

  if (footerEl) {
    footerEl.y = y - P.gap + 16;
    elements.push(footerEl); y = footerEl.y + footerEl.height;
  }
  const pageH = Math.max(targetH, y + P.margin - (spec.footer ? 0 : P.gap));
  // "fit" trims the width to what is drawn, with the page margin on the right.
  let outW = pageW;
  if (formatName === 'fit') {
    const right = Math.max(0, ...(await prepareScene(elements)).filter(e => !e.isDeleted).map(e => {
      const b = bbox(e);
      // A wrapped text's box is as wide as it was allowed to be; measure its ink.
      return e.type === 'text' ? e.x + Math.max(...String(e.text).split('\n').map(l => textWidth(l, e.fontSize))) : b.x + b.w;
    }));
    outW = Math.min(pageW, Math.ceil(right + P.margin));
  }
  // An invisible page-sized rectangle fixes the export bounds to the page.
  elements.unshift({ id: 'page.bounds', type: 'rectangle', x: 0, y: 0, width: outW, height: pageH,
    strokeColor: 'transparent', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1, roughness: 0, locked: true });

  const finalElements = await prepareScene(elements);
  const missingGlyphs = lintGlyphs(finalElements, warnings);
  return { elements: finalElements, warnings, report, size: [outW, Math.round(pageH)], missingGlyphs };
}

// Characters Excalifont lacks (arrows, check marks, emoji, CJK) render in a
// system font and break the hand-drawn look. The metrics fall back to exactly
// 0.6em or 1em for a missing glyph.
function lintGlyphs(elements, warnings) {
  let any = false;
  for (const el of elements) {
    if (el.type !== 'text' || !el.text) continue;
    const missing = [...new Set([...el.text])].filter(ch => {
      // ASCII is always there (and "o" really is 0.6em wide).
      if (/\s/.test(ch) || ch.codePointAt(0) < 0x7f) return false;
      const w = textWidth(ch, 1000);
      return w === 600 || w === 1000;
    });
    if (missing.length) {
      any = true;
      const owner = String(el.containerId ?? el.id);
      warnings.push(`${owner}: ${missing.map(c => `"${c}"`).join(' ')} isn't in Excalifont and renders in a ` +
        `system font: draw it (an arrow element), or use words or ASCII such as -> instead`);
    }
  }
  return any;
}

function lintPanel(p, warnings) {
  const live = p.prepared.filter(e => !e.isDeleted);
  // 1. Stays inside the drawing area's width (height grows to fit).
  for (const el of live) {
    const b = bbox(el);
    if (b.x < -1 || b.x + b.w > p.areaW + 1 || b.y < -1) {
      warnings.push(`${p.pid}: ${shortId(el, p)} reaches outside the drawing area ` +
        `(x ${Math.round(b.x)}..${Math.round(b.x + b.w)}, y from ${Math.round(b.y)}; area is 0..${Math.round(p.areaW)} wide, y from 0)`);
    }
  }
  // 2. A shape grew because its label didn't fit.
  for (const s of p.skel) {
    if (!SHAPES.has(s.type) || !s.label) continue;
    const got = live.find(e => e.id === s.id);
    if (got && (got.height > s.height + 1 || got.width > s.width + 1)) {
      warnings.push(`${p.pid}: ${shortId(s, p)} grew from ${s.width}×${s.height} to ${Math.round(got.width)}×${Math.round(got.height)} ` +
        `to fit its label: make it bigger or the label shorter`);
    }
  }
  // 2b. A top or left label (free text grouped with its shape) that doesn't fit inside it.
  for (const tx of live) {
    if (tx.type !== 'text' || tx.containerId || !String(tx.id).endsWith('.label')) continue;
    const shape = live.find(e => e.id === String(tx.id).slice(0, -'.label'.length));
    if (shape && SHAPES.has(shape.type) && !contains(bbox(shape), bbox(tx), -2)) {
      warnings.push(`${p.pid}: the label of ${shortId(shape, p)} doesn't fit inside it: make it bigger or the label shorter`);
    }
  }
  // 3. Partial overlaps between solid things (one fully inside another is fine).
  // Text inside a box counts too: it is what collides with notes drawn on the box.
  const solid = live.filter(e => SHAPES.has(e.type) || e.type === 'text');
  for (let i = 0; i < solid.length; i++) {
    for (let j = i + 1; j < solid.length; j++) {
      const a = solid[i], b = solid[j];
      if (a.containerId === b.id || b.containerId === a.id) continue;
      const ga = a.groupIds ?? [], gb = b.groupIds ?? [];
      // Parts of one window, stack or figure may overlap; their texts may not.
      const shared = ga.filter(g => gb.includes(g));
      if (shared.some(g => g.endsWith('.stack'))) continue;  // stacked windows overlap by design
      if (shared.length && !(a.type === 'text' && b.type === 'text')) continue;
      const A = bbox(a), B = bbox(b);
      // Text inside a box is fine; text inside another text's box never is.
      const nested = !(a.type === 'text' && b.type === 'text') && (contains(A, B) || contains(B, A));
      if (intersects(A, B) && !nested) {
        warnings.push(`${p.pid}: ${shortId(a, p)} and ${shortId(b, p)} overlap`);
      }
    }
  }
  // 3b. A word too long for its text's width: wrapping can't break it, so it spills out.
  // Excalidraw widens such a text to fit, so compare with the width the spec asked for.
  for (const tx of p.skel) {
    if (tx.type !== 'text') continue;
    if (wordTooWide(tx)) {
      warnings.push(`${p.pid}: ${shortId(tx, p)} has a word wider than its ${Math.round(tx.width)} px width: widen it or shorten the word`);
    }
  }
  // 4. An arrow too short to read as one.
  for (const a of live.filter(e => e.type === 'arrow')) {
    let len = 0;
    for (let i = 1; i < a.points.length; i++) len += Math.hypot(a.points[i][0] - a.points[i - 1][0], a.points[i][1] - a.points[i - 1][1]);
    if (len < 20) {
      warnings.push(`${p.pid}: ${shortId(a, p)} is only ${Math.round(len)} px long: move what it connects further apart (40 px or more)`);
    }
  }
  // 5. An arrow or line running through text.
  const linear = live.filter(e => e.type === 'arrow' || e.type === 'line');
  const texts = live.filter(e => e.type === 'text');
  for (const l of linear) {
    for (const tx of texts) {
      if (tx.containerId === l.id) continue;
      const gl = l.groupIds ?? [], gt = tx.groupIds ?? [];
      if (gl.some(g => gt.includes(g))) continue;
      const r = bbox(tx);
      if (crosses(l, { x: r.x + 2, y: r.y + 3, w: r.w - 4, h: r.h - 6 })) {
        warnings.push(`${p.pid}: ${shortId(l, p)} runs through the text ${shortId(tx.containerId ? { id: tx.containerId } : tx, p)}`);
      }
    }
  }
}

// Does any segment of a linear element pass through rectangle r? Sampled
// every 2 px, which is finer than any text line.
function crosses(l, r) {
  const pts = l.points.map(([px, py]) => [l.x + px, l.y + py]);
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 2));
    for (let k = 0; k <= n; k++) {
      const x = x1 + (x2 - x1) * k / n, y = y1 + (y2 - y1) * k / n;
      if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) return true;
    }
  }
  return false;
}
const shortId = (el, p) => `"${String(el.id).replace(`${p.pid}.`, '')}"`;

// ---------- CLI ----------

async function main() {
  const args = process.argv.slice(2);
  const usage = 'usage: build.mjs page.json [--out-dir DIR] [--scale 1-4] [--lint-only]';
  const flag = (name, def) => {
    const i = args.indexOf(name);
    if (i < 0) return def;
    const value = args.splice(i, 2)[1];
    if (value === undefined || value.startsWith('--')) { console.error(`${name} needs a value\n${usage}`); process.exit(2); }
    return value;
  };
  const lintOnly = args.includes('--lint-only'); if (lintOnly) args.splice(args.indexOf('--lint-only'), 1);
  const outDir = flag('--out-dir', null), scale = Number(flag('--scale', 2));
  const input = args[0];
  if (!input) { console.error(usage); process.exit(2); }
  if (!(scale >= 1 && scale <= 4)) { console.error(`--scale must be a number from 1 to 4\n${usage}`); process.exit(2); }
  if (outDir && !fs.statSync(outDir, { throwIfNoEntry: false })?.isDirectory()) {
    console.error(`--out-dir ${outDir} is not a folder`); process.exit(2);
  }
  let spec;
  try { spec = JSON.parse(fs.readFileSync(input, 'utf8')); }
  catch (e) { console.error(`Could not read ${input}: ${e.message}`); process.exit(1); }

  let built;
  try { built = await build(spec); }
  catch (e) { console.error(`Could not build ${input}: ${e.message}`); process.exit(1); }
  const { elements, warnings, report, size, missingGlyphs } = built;
  const stem = path.join(outDir ?? path.dirname(path.resolve(input)), path.basename(input).replace(/\.json$/i, ''));
  console.log(`page ${size[0]}×${size[1]}`);
  for (const r of report) console.log(r);
  if (!lintOnly) {
    const scene = { type: 'excalidraw', version: 2, source: 'excalidraw-drawing',
      elements, appState: { viewBackgroundColor: '#ffffff', gridSize: null }, files: {} };
    // Render first: if it fails, neither file is touched, so the PNG and the
    // .excalidraw on disk never come from different builds.
    const png = await renderScene({ elements, files: {} }, { format: 'png', scale, padding: 0,
      // Every glyph was checked against Excalifont above; system fonts are
      // only needed for the ones it lacks.
      systemFonts: missingGlyphs });
    // The PNG and the .excalidraw file must always come from one build. Write
    // both beside their targets, move the earlier pair aside, move the new one
    // in; if any step fails, put the earlier pair back as it was.
    const outputs = [[`${stem}.png`, Buffer.from(png.data, 'base64')],
      [`${stem}.excalidraw`, JSON.stringify(scene, null, 1)]];
    const tmp = `.${process.pid}.tmp`, bak = `.${process.pid}.bak`;
    const setAside = [], placed = [];
    try {
      for (const [f, data] of outputs) fs.writeFileSync(f + tmp, data);
      for (const [f] of outputs) if (fs.existsSync(f)) { fs.renameSync(f, f + bak); setAside.push(f); }
      for (const [f] of outputs) { fs.renameSync(f + tmp, f); placed.push(f); }
      for (const f of setAside) fs.rmSync(f + bak, { force: true });
    } catch (e) {
      for (const f of placed) fs.rmSync(f, { force: true });
      for (const f of setAside) { try { fs.renameSync(f + bak, f); } catch { /* reported below */ } }
      for (const [f] of outputs) fs.rmSync(f + tmp, { force: true });
      const lost = setAside.filter(f => !fs.existsSync(f));
      console.error(`Could not write the outputs next to ${stem}: ${e.message}` +
        (lost.length ? `\nThe earlier ${lost.join(' and ')} could not be put back: see ${lost.map(f => f + bak).join(', ')}` : ''));
      process.exit(1);
    }
    for (const w of png.warnings) warnings.push(`renderer: ${w}`);
    console.log(`wrote ${stem}.excalidraw\nwrote ${stem}.png (${png.width}×${png.height})`);
  }
  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`- ${w}`);
    process.exit(3);
  }
  console.log('no warnings');
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  main().catch(e => { console.error(e.stack ?? String(e)); process.exit(1); });
}
