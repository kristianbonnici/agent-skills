#!/usr/bin/env node
// Read, change and preview an existing Excalidraw drawing: a .excalidraw file
// (excalidraw.com, the Excalidraw app, build.mjs) or an .excalidraw.md from
// Obsidian's Excalidraw plugin, where the drawing is the JSON under "## Drawing".
//
//   node drawing.mjs render <drawing> <out.png> [--scale 1-4]
//
// As a module, for a one-off edit script (references/editing.md):
//
//   import { readDrawing, writeDrawing } from '<skill>/scripts/drawing.mjs';
//   const d = readDrawing('Plan.excalidraw.md');
//   d.scene.elements.find(e => e.text === 'DONE').strokeColor = '#2f9e44';
//   writeDrawing(d);
//
// writeDrawing keeps the file's format and indentation, gives every element
// that changed a new version, and in an .excalidraw.md rewrites the Text
// Elements list the plugin reads text from. build.mjs uses the same code to
// write a new drawing into an Obsidian vault.

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const here = path.dirname(fs.realpathSync(fileURLToPath(import.meta.url)));
export const runtimeRoot = process.env.EXCALIDRAW_DRAWING_RUNTIME
  || path.resolve(here, '../../../runtime/excalidraw');
export const runtimePackage = path.join(runtimeRoot, 'node_modules/mcp-excalidraw-server');

// ---------- step pictures ----------

// A step picture carries a PNG text chunk saying so, the way a build knows a
// file at a step picture's name is its own before it replaces or deletes it.
const STEP_KEY = 'excalidraw-drawing-step';
const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = buf => { let c = -1; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
export function markStep(png, k, of, build = '', slide = '') {
  // "<click> of <count> <build id> <slide>": the build id ties a slide's pictures to one build, the
  // slide's name to that slide. Read back by the chunk's own length, so nothing after it can run on.
  const data = Buffer.from(`${STEP_KEY}\0${k} of ${of} ${build} ${encodeURIComponent(slide)}`, 'latin1'), type = Buffer.from('tEXt');
  const len = Buffer.alloc(4), crc = Buffer.alloc(4);
  len.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([type, data])));
  const ihdrEnd = 8 + 8 + png.readUInt32BE(8) + 4;    // the signature, then IHDR: its length, type, data and CRC
  return Buffer.concat([png.subarray(0, ihdrEnd), len, type, data, crc, png.subarray(ihdrEnd)]);
}
// What a step picture's marker records ({ k, of, build, slide }), or null for a file without one.
export function readStepMark(file) {
  try {
    const fd = fs.openSync(file, 'r');
    try {
      // The marker sits right after IHDR (byte 33); read its whole chunk, however long the slide's name.
      const head = Buffer.alloc(41);
      if (fs.readSync(fd, head, 0, 41, 0) < 41 || head.toString('latin1', 37, 41) !== 'tEXt') return null;
      const len = head.readUInt32BE(33);
      if (len > 65536) return null;
      const data = Buffer.alloc(len);
      if (fs.readSync(fd, data, 0, len, 41) < len) return null;
      const text = data.toString('latin1');
      if (!text.startsWith(`${STEP_KEY}\0`)) return null;
      const m = /^(\d+) of (\d+)(?: (\S*) (\S*))?\.?$/.exec(text.slice(STEP_KEY.length + 1));
      return m ? { k: Number(m[1]), of: Number(m[2]), build: m[3] ?? '', slide: decodeURIComponent(m[4] ?? '') } : null;
    } finally { fs.closeSync(fd); }
  } catch { return null; }
}
export const isStepPicture = file => readStepMark(file) !== null;

// The "source" build.mjs writes. Excalidraw, excalidraw.com and the Obsidian
// plugin each write their own when they save, so another value means someone
// has edited the drawing since it was built.
export const SOURCE = 'excalidraw-drawing';

// ---------- Obsidian ----------

// The Obsidian vault that holds `dir` (the folder with a .obsidian folder in
// it, here or further up), or null.
export function findVault(dir) {
  let d = path.resolve(dir);
  for (;;) {
    if (fs.statSync(path.join(d, '.obsidian'), { throwIfNoEntry: false })?.isDirectory()) return d;
    const up = path.dirname(d);
    if (up === d) return null;
    d = up;
  }
}

// What the plugin writes at the top of every drawing (plugin 2.29).
const MD_HEADER = ['---', '', 'excalidraw-plugin: parsed', 'tags: [excalidraw]', '', '---',
  "==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠== You can decompress Drawing data with the command palette: 'Decompress current Excalidraw file'. For more info check in plugin settings under 'Saving'",
  '', ''].join('\n');
const DRAWING_BLOCK = /\n(##? Drawing\n)```json\n([\s\S]*?)\n```/;
const TEXT_HEAD = '## Text Elements\n';

// The plugin reads each text's words from the "## Text Elements" list, one
// "<text> ^<id>" entry per element, which it matches with /\s\^(.{8})[\n]+/:
// a text whose id is not 8 characters long is lost or mixed up with another.
// So every text gets an id of 8 letters and digits (the same one on every
// build of the same spec), and every reference to it follows.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const hashId = seed => [...crypto.createHash('sha256').update(seed).digest()].slice(0, 8).map(b => ALPHABET[b % 62]).join('');
export const newId = () => [...crypto.randomBytes(8)].map(b => ALPHABET[b % 62]).join('');

export function shortTextIds(elements) {
  const taken = new Set(elements.map(e => e.id));
  const map = new Map();
  for (const e of elements) {
    if (e.type !== 'text' || /^[A-Za-z0-9_-]{8}$/.test(e.id)) continue;
    let n = 0, id;
    do id = hashId(`${e.id}#${n++}`); while (taken.has(id));
    taken.add(id); map.set(e.id, id);
  }
  if (!map.size) return map;
  const to = id => map.get(id) ?? id;
  for (const e of elements) {
    e.id = to(e.id);
    if (e.containerId) e.containerId = to(e.containerId);
    if (Array.isArray(e.boundElements)) e.boundElements = e.boundElements.map(b => b && { ...b, id: to(b.id) });
    for (const k of ['startBinding', 'endBinding']) if (e[k]?.elementId) e[k] = { ...e[k], elementId: to(e[k].elementId) };
  }
  return map;
}

const entry = e => `${e.rawText ?? e.originalText ?? e.text} ^${e.id}\n\n`;

// A new drawing as the plugin's .excalidraw.md, with the JSON uncompressed.
export function toMarkdown(scene) {
  const s = structuredClone(scene);
  shortTextIds(s.elements);
  const texts = s.elements.filter(e => e.type === 'text' && !e.isDeleted).map(entry).join('');
  return `${MD_HEADER}# Excalidraw Data\n\n${TEXT_HEAD}${texts}%%\n## Drawing\n\`\`\`json\n${JSON.stringify(s, null, '\t')}\n\`\`\`\n%%`;
}

// The Text Elements list rewritten from the elements: entries keep their order,
// a changed text gets its new words, a deleted one goes, a new one is added at
// the end. Entries for links on other elements, and the plugin's dummy entry,
// stay as they were.
function withTextSection(md, elements) {
  const start = md.indexOf(TEXT_HEAD);
  if (start < 0) return md;
  const from = start + TEXT_HEAD.length;
  const to = Math.min(...['\n## Element Links\n', '\n## Embedded Files\n', '%%\n## Drawing\n', '\n## Drawing\n', '\n# ']
    .map(s => md.indexOf(s, from)).filter(i => i >= 0));
  const live = new Map(elements.filter(e => !e.isDeleted).map(e => [e.id, e]));
  const seen = new Set();
  let s = '';
  for (const m of md.slice(from, to).matchAll(/([\s\S]*?)\s\^(.{8})\n+/g)) {
    const e = live.get(m[2]);
    if (m[2] === '_dummy!_') s += m[0];
    else if (e && !seen.has(e.id)) { seen.add(e.id); s += e.type === 'text' ? entry(e) : m[0]; }
  }
  for (const e of live.values()) if (e.type === 'text' && !seen.has(e.id)) s += entry(e);
  return md.slice(0, from) + s + md.slice(to);
}

// ---------- reading and writing ----------

const isMarkdown = file => /\.md$/i.test(file);
const snapshot = elements => new Map(elements.map(e => [e.id, JSON.stringify(e)]));

export function readDrawing(file) {
  const raw = fs.readFileSync(file, 'utf8');
  let json = raw;
  if (isMarkdown(file)) {
    if (/```compressed-json\n/.test(raw)) {
      throw new Error(`${file} holds compressed JSON, which can't be read here. In Obsidian, turn off ` +
        `"Compress Excalidraw JSON in Markdown" (Excalidraw settings, Saving), or run "Decompress current ` +
        `Excalidraw file" from the command palette, then save the drawing once`);
    }
    const m = raw.match(DRAWING_BLOCK);
    if (!m) throw new Error(`${file} has no "## Drawing" JSON block: is it an Excalidraw drawing?`);
    json = m[2];
  }
  const scene = JSON.parse(json);
  if (!Array.isArray(scene?.elements)) throw new Error(`${file} has no elements list: is it an Excalidraw drawing?`);
  const indent = json.match(/\n([ \t]+)"/)?.[1] ?? '';
  return { file, kind: isMarkdown(file) ? 'obsidian' : 'excalidraw', raw, indent, scene, before: snapshot(scene.elements) };
}

export function writeDrawing(d, file = d.file) {
  const now = Date.now();
  for (const e of d.scene.elements) {
    const was = d.before.get(e.id);
    if (was === JSON.stringify(e)) continue;
    // New words in `text` alone would be undone: the plugin and Excalidraw
    // take a text's words from originalText (and the plugin from rawText).
    const old = was && JSON.parse(was);
    if (old && e.type === 'text' && e.text !== old.text) {
      for (const k of ['originalText', 'rawText']) if (k in e && e[k] === old[k]) e[k] = e.text;
    }
    // A new version tells Excalidraw this copy is newer than the one it had.
    e.version = (e.version ?? 1) + 1;
    e.versionNonce = crypto.randomInt(2 ** 31);
    e.updated = now;
  }
  let out;
  if (d.kind === 'obsidian') {
    shortTextIds(d.scene.elements);
    const m = d.raw.match(DRAWING_BLOCK);
    if (!m) throw new Error(`${d.file} lost its "## Drawing" JSON block`);
    const json = JSON.stringify(d.scene, null, d.indent);
    out = withTextSection(d.raw.slice(0, m.index) + `\n${m[1]}\`\`\`json\n${json}\n\`\`\`` +
      d.raw.slice(m.index + m[0].length), d.scene.elements);
  } else {
    out = JSON.stringify(d.scene, null, d.indent) + (d.raw.endsWith('\n') ? '\n' : '');
  }
  // Written beside it, then moved in: a failed write never leaves half a drawing.
  const tmp = `${file}.${process.pid}.tmp`;
  try { fs.writeFileSync(tmp, out); fs.renameSync(tmp, file); }
  finally { fs.rmSync(tmp, { force: true }); }
  Object.assign(d, { file, raw: out, before: snapshot(d.scene.elements) });
  return d;
}

// Has the drawing at `file` been saved by an editor since build.mjs wrote it?
// A file that can't be read counts as edited (a compressed one was saved by
// Obsidian), so nothing unreadable is replaced either.
export function savedByEditor(file) {
  if (!fs.existsSync(file)) return false;
  try { return readDrawing(file).scene.source !== SOURCE; } catch { return true; }
}

// An index that sorts after `index`, for an element added at the end
// (Excalidraw orders elements by these fractional keys; an invalid one is
// repaired when the drawing opens).
export const indexAfter = index => `${index ?? 'a0'}V`;

// ---------- preview ----------

const load = rel => import(pathToFileURL(path.join(runtimePackage, rel)).href);

// ---------- fonts ----------

// Fonts a text can have besides Excalifont, drawn only in the PNG. Excalidraw can't use any
// other font, so the drawing keeps the text in Excalifont and names the font to draw it in
// with customData.font; an editor keeps that, so a preview after a hand edit draws it too.
// Each is a font that comes with an operating system, never copied into the skill; a computer
// without it draws Excalifont (missingFonts says which are missing).
export const FONTS = {
  // A serif with a slightly inked edge, for a title that should read more serious than hand
  // lettering but still belong on a sketch. 0.93 of the Excalifont size matches its height.
  'iowan-inked': { name: 'Iowan Old Style Bold', family: 'Iowan Old Style', weight: 700, size: 52 / 56,
    inked: true, files: ['/System/Library/Fonts/Supplemental/Iowan Old Style.ttc'] }
};
const fontFile = font => FONTS[font]?.files.find(f => fs.existsSync(f)) ?? null;
const styledTexts = elements => elements.filter(e => e.type === 'text' && !e.isDeleted && FONTS[e.customData?.font]);
export const missingFonts = elements =>
  [...new Set(styledTexts(elements).map(e => e.customData.font))].filter(f => !fontFile(f));

// The inked edge: the letters' outlines nudged by two sizes of noise (fine nicks, a slow wobble),
// then softened and sharpened again, like ink that spread a little into the paper. In the
// drawing's units; render at scale 2 so the filter stays crisp (scale 1 blurs the inked edge).
const INKED_FILTER = `<filter id="excalidraw-drawing-inked" x="-2%" y="-20%" width="104%" height="140%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="0.29" numOctaves="1" seed="7" result="fine"/>` +
  `<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="1" seed="11" result="coarse"/>` +
  `<feDisplacementMap in="SourceGraphic" in2="fine" scale="1.7" xChannelSelector="R" yChannelSelector="G" result="nicked"/>` +
  `<feDisplacementMap in="nicked" in2="coarse" scale="4" xChannelSelector="R" yChannelSelector="G" result="wobbled"/>` +
  `<feGaussianBlur in="wobbled" stdDeviation="0.45"/>` +
  `<feComponentTransfer><feFuncA type="linear" slope="4" intercept="-1.3"/></feComponentTransfer></filter>`;

const xmlText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const reText = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Renders a scene to a PNG as the runtime's renderScene does, and draws each text that names a
// font from FONTS (and that this computer has) in that font. Returns renderScene's result.
// background: the page's color, the scene's viewBackgroundColor (white when not given).
export async function renderPng(elements, files = {}, { scale = 1, padding = 0, systemFonts, background = '#ffffff' } = {}) {
  const { renderScene, maxDimension } = await load('dist/core/render/index.js');
  const styled = styledTexts(elements).filter(e => fontFile(e.customData.font));
  if (!styled.length) return renderScene({ elements, files }, { format: 'png', scale, padding, systemFonts, viewBackgroundColor: background });
  const { svgToPng } = await load('dist/core/render/png.js');
  const { collectFontEntriesFromSvg, fontFilesFor, needsSystemFonts } = await load('dist/core/render/fonts.js');
  const out = await renderScene({ elements, files }, { format: 'svg', padding, viewBackgroundColor: background });
  let svg = out.data;
  const used = new Set();
  for (const e of styled) {
    const font = FONTS[e.customData.font];
    const size = Math.round(e.fontSize * font.size * 10) / 10, line = e.fontSize * (e.lineHeight ?? 1.25);
    used.add(e.customData.font);
    String(e.text).split('\n').forEach((text, i) => {
      if (!text.trim()) return;
      // Excalidraw writes each line as its own <text>, placed by its baseline in Excalifont; the
      // new font is centred on the line instead, since its baseline sits elsewhere.
      const re = new RegExp(`<text x="([^"]*)" y="[^"]*" font-family="[^"]*" font-size="${e.fontSize}px"([^>]*?) ` +
        `dominant-baseline="alphabetic">${reText(xmlText(text))}</text>`);
      if (!re.test(svg)) throw new Error(`couldn't find the text "${text}" in the rendered drawing to draw it in ${font.name}`);
      svg = svg.replace(re, (_, x, rest) => `<text x="${x}" y="${Math.round(((i + 0.5) * line - 0.02 * e.fontSize) * 100) / 100}" ` +
        `font-family="${font.family}" font-weight="${font.weight}" font-size="${size}px"${rest} dominant-baseline="central"` +
        `${font.inked ? ' filter="url(#excalidraw-drawing-inked)"' : ''}>${xmlText(text)}</text>`);
    });
  }
  if (styled.some(e => FONTS[e.customData.font].inked)) svg = svg.replace('<defs>', `<defs>${INKED_FILTER}`);
  // The same size limit as renderScene's.
  const largest = Math.max(out.width, out.height), limit = maxDimension(), warnings = [...out.warnings];
  if (largest > 0 && largest * scale > limit) {
    scale = Math.max(0.1, Math.floor((limit / largest) * 1000) / 1000);
    warnings.push(`scale reduced to ${scale} so the image stays within ${limit}px`);
  }
  const png = svgToPng(svg, { scale, loadSystemFonts: systemFonts ?? needsSystemFonts(elements), defaultFontFamily: 'Excalifont',
    fontFiles: [...fontFilesFor(collectFontEntriesFromSvg(svg)), ...[...used].map(fontFile)] });
  return { format: 'png', data: png.data.toString('base64'), width: png.width, height: png.height, warnings };
}

export async function renderDrawing(file, out, { scale = 2 } = {}) {
  if (!fs.existsSync(runtimePackage)) {
    throw new Error(`the Excalidraw runtime is not installed at ${runtimeRoot}: run npm ci --ignore-scripts --prefix ${runtimeRoot}`);
  }
  const { scene } = readDrawing(file);
  const { measureTextWidth } = await load('dist/core/render/text-metrics.js');
  const elements = scene.elements.filter(e => !e.isDeleted);
  // System fonts only for characters Excalifont lacks, as build.mjs does.
  const systemFonts = elements.some(e => e.type === 'text' && [...String(e.text ?? '')].some(ch => {
    if (/\s/.test(ch) || ch.codePointAt(0) < 0x7f) return false;
    const w = measureTextWidth(ch, '1000px Excalifont');
    return w === 600 || w === 1000;
  }));
  const png = await renderPng(elements, scene.files ?? {}, { scale, padding: 10, systemFonts,
    background: scene.appState?.viewBackgroundColor ?? '#ffffff' });
  fs.writeFileSync(out, Buffer.from(png.data, 'base64'));
  const fontWarnings = missingFonts(elements).map(f => `${FONTS[f].name} isn't on this computer, so text meant ` +
    `for it is drawn in Excalifont (${FONTS[f].files.join(', ')})`);
  return { width: png.width, height: png.height, warnings: [...(png.warnings ?? []), ...fontWarnings],
    images: elements.filter(e => e.type === 'image' && !scene.files?.[e.fileId]?.dataURL).length };
}

async function main() {
  const usage = 'usage: drawing.mjs render <drawing> <out.png> [--scale 1-4]';
  const args = process.argv.slice(2);
  let scale = 2;
  const i = args.indexOf('--scale');
  if (i >= 0) {
    scale = Number(args.splice(i, 2)[1]);
    if (!(scale >= 1 && scale <= 4)) { console.error(`--scale must be a number from 1 to 4\n${usage}`); process.exit(2); }
  }
  const [cmd, file, out] = args;
  if (cmd !== 'render' || !file || !out || args.length !== 3) { console.error(usage); process.exit(2); }
  if (!/\.png$/i.test(out)) { console.error(`the preview must be a .png file\n${usage}`); process.exit(2); }
  let r;
  try { r = await renderDrawing(file, out, { scale }); }
  catch (e) { console.error(`Could not render ${file}: ${e.message}`); process.exit(1); }
  console.log(`wrote ${out} (${r.width}×${r.height})`);
  if (r.images) console.log(`note: ${r.images} embedded image(s) aren't drawn in the preview`);
  for (const w of r.warnings) console.log(`renderer: ${w}`);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  main().catch(e => { console.error(e.stack ?? String(e)); process.exit(1); });
}
