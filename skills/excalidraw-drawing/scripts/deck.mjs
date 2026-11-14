#!/usr/bin/env node
// Turn a folder of slide specs into a deck: a browser deck, a PDF and a PowerPoint.
//
//   node deck.mjs <folder> [--title TITLE] [--name NAME] [--scale 1-4] [--no-build]
//
// Every spec in the folder (a .json with "panels") is one slide, in file-name
// order: number them, 01-title.json, 02-problem.json, and insert one later as
// 02b-....json. A slide's speaker notes are its spec's "notes", or the entry
// for its file name (without .json) in the folder's notes.json.
//
// It builds each slide with build.mjs --steps (unless --no-build), then writes,
// in the folder:
//   index.html   the browser deck: arrow keys, swipe, speaker notes (N), all
//                slides (G), full screen (F), click-by-click steps (B to turn
//                them off), and #slide-N links
//   NAME.pdf     every slide finished, one per page: the handout
//   NAME.pptx    one full-slide picture per slide, each later step fading in on
//                a click, the notes in PowerPoint's notes; the pictures can't be
//                edited there: change the specs and run this again
// NAME defaults to the folder's name. Exit code 0, 1 on an error, 3 when a
// slide built with warnings (fix them, as for any build).

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { runtimeRoot } from './drawing.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const usage = 'usage: deck.mjs <folder> [--title TITLE] [--name NAME] [--scale 1-4] [--no-build]';

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(name);
  if (i < 0) return def;
  const value = args.splice(i, 2)[1];
  if (value === undefined || value.startsWith('--')) { console.error(`${name} needs a value\n${usage}`); process.exit(2); }
  return value;
};
const has = name => { const i = args.indexOf(name); if (i >= 0) args.splice(i, 1); return i >= 0; };
const noBuild = has('--no-build');
const titleArg = flag('--title', null), nameArg = flag('--name', null), scale = flag('--scale', '2');
const folder = args[0];
if (!folder || args.length > 1) { console.error(usage); process.exit(2); }
if (!fs.statSync(folder, { throwIfNoEntry: false })?.isDirectory()) { console.error(`${folder} is not a folder\n${usage}`); process.exit(2); }
if (!(Number(scale) >= 1 && Number(scale) <= 4)) { console.error(`--scale must be a number from 1 to 4\n${usage}`); process.exit(2); }
if (nameArg !== null && (!nameArg.trim() || /[\\/]/.test(nameArg))) { console.error(`--name is a file name without a folder or extension\n${usage}`); process.exit(2); }

const require = createRequire(path.join(runtimeRoot, 'package.json'));
let pptxgen, JSZip, PDFDocument;
try {
  pptxgen = require('pptxgenjs'); JSZip = require('jszip'); ({ PDFDocument } = require('pdf-lib'));
} catch {
  console.error(`The deck libraries are not installed in ${runtimeRoot}.\nRun: npm ci --ignore-scripts --prefix ${runtimeRoot}`);
  process.exit(1);
}

// ---------- the slides ----------

const dir = path.resolve(folder);
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.error(`Could not read ${f}: ${e.message}`); process.exit(1); } };
const notesFile = path.join(dir, 'notes.json');
const notes = fs.existsSync(notesFile) ? readJson(notesFile) : {};
const byName = (a, b) => a.localeCompare(b, 'en', { numeric: true });
const slides = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'notes.json').sort(byName)
  .map(f => ({ base: f.slice(0, -5), spec: readJson(path.join(dir, f)) }))
  .filter(s => Array.isArray(s.spec.panels));
if (!slides.length) { console.error(`${folder} has no slide specs (a .json with "panels")`); process.exit(1); }

const warnings = [];
for (const s of slides) {
  if (s.spec.format !== '16:9') warnings.push(`${s.base}: format is ${s.spec.format ?? '3:4'}, not 16:9: it will be letterboxed`);
}
for (const k of Object.keys(notes)) {
  if (!slides.some(s => s.base === k)) warnings.push(`notes.json: "${k}" is not a slide in the folder`);
}

// Build each slide with its steps, four at a time.
function buildOne(s) {
  return new Promise(resolve => {
    const p = spawn(process.execPath, [path.join(here, 'build.mjs'), path.join(dir, `${s.base}.json`), '--steps', '--no-obsidian', '--scale', scale]);
    let out = '';
    p.stdout.on('data', d => { out += d; }); p.stderr.on('data', d => { out += d; });
    p.on('close', code => resolve({ s, code, out }));
  });
}
if (!noBuild) {
  const queue = [...slides], results = [];
  await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) results.push(await buildOne(queue.shift())); }));
  for (const { s, code, out } of results.sort((a, b) => byName(a.s.base, b.s.base))) {
    if (code === 1 || code === 2) { console.error(`${s.base}: the build failed\n${out}`); process.exit(1); }
    for (const line of out.split('\n')) if (line.startsWith('- ')) warnings.push(`${s.base}: ${line.slice(2)}`);
  }
}
for (const s of slides) {
  s.png = `${s.base}.png`;
  if (!fs.existsSync(path.join(dir, s.png))) { console.error(`${s.png} is missing: build the slide (or drop --no-build)`); process.exit(1); }
  const steps = [];
  for (let k = 1; fs.existsSync(path.join(dir, `${s.base}.step-${k}.png`)); k++) steps.push(`${s.base}.step-${k}.png`);
  s.frames = [...steps, s.png];
  s.note = String(s.spec.notes ?? notes[s.base] ?? '');
  if (!s.note.trim()) warnings.push(`${s.base}: no speaker notes`);
  s.title = String(s.spec.title ?? s.base);
  s.alt = s.title + (s.spec.subtitle ? `. ${s.spec.subtitle}` : '');
}
const deckTitle = titleArg ?? slides[0].title;
const name = nameArg ?? path.basename(dir);

// ---------- the browser deck ----------

const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const data = slides.map(s => ({ src: s.png, frames: s.frames, title: s.title, sub: String(s.spec.subtitle ?? ''), note: s.note }));
const page = fs.readFileSync(path.join(here, '..', 'assets', 'deck.html'), 'utf8')
  .replace('__TITLE__', () => esc(deckTitle))
  .replace('__SLIDES__', () => JSON.stringify(data).replace(/</g, '\\u003c'));
fs.writeFileSync(path.join(dir, 'index.html'), page);

// ---------- PDF: every slide finished ----------

const pdf = await PDFDocument.create();
pdf.setTitle(deckTitle);
for (const s of slides) {
  const img = await pdf.embedPng(fs.readFileSync(path.join(dir, s.png)));
  const w = 960, h = Math.round(w * img.height / img.width);    // 13.33 x 7.5 in for a 16:9 slide
  pdf.addPage([w, h]).drawImage(img, { x: 0, y: 0, width: w, height: h });
}
fs.writeFileSync(path.join(dir, `${name}.pdf`), await pdf.save({ useObjectStreams: false }));

// ---------- PowerPoint: one picture per step, each later one fading in on a click ----------

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';                                    // 13.333 x 7.5 in
pres.title = deckTitle;
const clicks = [];
for (const s of slides) {
  const slide = pres.addSlide();
  s.frames.forEach((f, k) => slide.addImage({ path: path.join(dir, f), x: 0, y: 0, w: 13.333, h: 7.5, objectName: `step ${k + 1}`,
    altText: s.frames.length > 1 ? `${s.alt} (step ${k + 1} of ${s.frames.length})` : s.alt }));
  if (s.note) slide.addNotes(s.note);
  clicks.push(s.frames.length - 1);
}
// A click-triggered fade-in for each later picture, in order (PowerPoint's own markup for an entrance effect).
function timing(spids) {
  let id = 2;
  const effect = sp => {
    const [a, b, c, d, e] = [++id, ++id, ++id, ++id, ++id];
    return `<p:par><p:cTn id="${a}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>` +
      `<p:par><p:cTn id="${b}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
      `<p:par><p:cTn id="${c}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="clickEffect">` +
      `<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
      `<p:set><p:cBhvr><p:cTn id="${d}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>` +
      `<p:tgtEl><p:spTgt spid="${sp}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>` +
      `<p:to><p:strVal val="visible"/></p:to></p:set>` +
      `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${e}" dur="300"/><p:tgtEl><p:spTgt spid="${sp}"/></p:tgtEl></p:cBhvr></p:animEffect>` +
      `</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
  };
  return `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>` +
    `<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${spids.map(effect).join('')}</p:childTnLst></p:cTn>` +
    `<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>` +
    `<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>` +
    `</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>`;
}
const zip = await JSZip.loadAsync(await pres.write({ outputType: 'nodebuffer' }));
for (const [k, n] of clicks.entries()) {
  if (!n) continue;
  const f = `ppt/slides/slide${k + 1}.xml`;
  let x = await zip.file(f).async('string');
  const spids = [...x.matchAll(/<p:cNvPr id="(\d+)" name="step (\d+)"/g)].filter(m => Number(m[2]) > 1).map(m => m[1]);
  if (spids.length !== n || !x.includes('</p:clrMapOvr>')) throw new Error(`${f}: could not add the step animations`);
  zip.file(f, x.replace('</p:clrMapOvr>', `</p:clrMapOvr>${timing(spids)}`));
}
// No folder entries in the archive: some cloud services fail to open a .pptx that has them.
const flat = new JSZip();
for (const [f, entry] of Object.entries(zip.files)) {
  if (!entry.dir) flat.file(f, await entry.async('uint8array'), { createFolders: false });
}
fs.writeFileSync(path.join(dir, `${name}.pptx`), await flat.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));

const total = clicks.reduce((a, b) => a + b, 0);
console.log(`${slides.length} slides, ${total} step${total === 1 ? '' : 's'} after the first`);
for (const f of ['index.html', `${name}.pdf`, `${name}.pptx`]) console.log(`wrote ${path.join(dir, f)}`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`- ${w}`);
  process.exit(3);
}
console.log('no warnings');
