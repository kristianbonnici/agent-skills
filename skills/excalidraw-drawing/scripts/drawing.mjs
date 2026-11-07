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

export async function renderDrawing(file, out, { scale = 1 } = {}) {
  if (!fs.existsSync(runtimePackage)) {
    throw new Error(`the Excalidraw runtime is not installed at ${runtimeRoot}: run npm ci --ignore-scripts --prefix ${runtimeRoot}`);
  }
  const { scene } = readDrawing(file);
  const { renderScene } = await load('dist/core/render/index.js');
  const { measureTextWidth } = await load('dist/core/render/text-metrics.js');
  const elements = scene.elements.filter(e => !e.isDeleted);
  // System fonts only for characters Excalifont lacks, as build.mjs does.
  const systemFonts = elements.some(e => e.type === 'text' && [...String(e.text ?? '')].some(ch => {
    if (/\s/.test(ch) || ch.codePointAt(0) < 0x7f) return false;
    const w = measureTextWidth(ch, '1000px Excalifont');
    return w === 600 || w === 1000;
  }));
  const png = await renderScene({ elements, files: scene.files ?? {} }, { format: 'png', scale, padding: 10, systemFonts });
  fs.writeFileSync(out, Buffer.from(png.data, 'base64'));
  return { width: png.width, height: png.height, warnings: png.warnings ?? [],
    images: elements.filter(e => e.type === 'image').length };
}

async function main() {
  const usage = 'usage: drawing.mjs render <drawing> <out.png> [--scale 1-4]';
  const args = process.argv.slice(2);
  let scale = 1;
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
