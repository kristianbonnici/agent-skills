#!/usr/bin/env node
// Turn a folder of slide specs into a deck: a browser deck, a PDF and a PowerPoint.
//
//   node deck.mjs <folder> [--title TITLE] [--name NAME] [--scale 1-4] [--no-build] [--force]
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
// NAME defaults to the folder's name. The three are written together, once all
// are ready, and never over a file of that name deck.mjs didn't write (unless
// --force). A slide edited by hand in Excalidraw stops the deck, as it stops a
// build: carry the change into its spec. Exit code 0, 1 on an error, 3 when a
// slide built with warnings (fix them, as for any build).

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { readStepMark, runtimeRoot } from './drawing.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const usage = 'usage: deck.mjs <folder> [--title TITLE] [--name NAME] [--scale 1-4] [--no-build] [--force]';
const MARK = 'excalidraw-drawing deck';      // in each output, so a later run knows the file is its own

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(name);
  if (i < 0) return def;
  const value = args.splice(i, 2)[1];
  if (value === undefined || value.startsWith('--')) { console.error(`${name} needs a value\n${usage}`); process.exit(2); }
  return value;
};
const has = name => { const i = args.indexOf(name); if (i >= 0) args.splice(i, 1); return i >= 0; };
const noBuild = has('--no-build'), force = has('--force');
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
const warnings = [];
const slides = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'notes.json').sort(byName)
  .map(f => ({ base: f.slice(0, -5), spec: readJson(path.join(dir, f)) }))
  .filter(s => {
    if (Array.isArray(s.spec?.panels)) return true;
    warnings.push(`${s.base}.json has no "panels" list, so it isn't a slide: left out of the deck`);
    return false;
  });
if (!slides.length) { console.error(`${folder} has no slide specs (a .json with "panels")`); process.exit(1); }
for (const s of slides) {
  if (s.spec.format !== '16:9') warnings.push(`${s.base}: format is ${s.spec.format ?? '3:4'}, not 16:9: the deck and the PowerPoint show it with bars at the sides or top, and its PDF page takes its own shape`);
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
    if (code !== 0 && code !== 3) {
      console.error(`${s.base}: the build failed\n${out}` + (/--force/.test(out)
        ? `\ndeck.mjs's --force replaces only the deck's own files, never a slide's: carry a hand edit into the slide's spec, ` +
          `or move the file in the way; build.mjs ${s.base}.json --force replaces it, if that is what the user wants.` : ''));
      process.exit(1);
    }
    for (const line of out.split('\n')) if (line.startsWith('- ')) warnings.push(`${s.base}: ${line.slice(2)}`);
  }
}
for (const s of slides) {
  s.png = `${s.base}.png`;
  if (!fs.existsSync(path.join(dir, s.png))) { console.error(`${s.png} is missing: build the slide (or drop --no-build)`); process.exit(1); }
  // Only step pictures a build wrote for this slide, all from one build: each marked
  // with its click and the slide's count of clicks. A file merely at such a name isn't one.
  const steps = [];
  const first = readStepMark(path.join(dir, `${s.base}.step-1.png`));
  if (first) {
    for (let k = 1; k < first.of; k++) {
      const mark = readStepMark(path.join(dir, `${s.base}.step-${k}.png`));
      if (!mark || mark.k !== k || mark.of !== first.of) { steps.length = 0; warnings.push(`${s.base}: its step pictures don't match: build it again`); break; }
      steps.push(`${s.base}.step-${k}.png`);
    }
  } else if (fs.existsSync(path.join(dir, `${s.base}.step-1.png`))) {
    warnings.push(`${s.base}.step-1.png isn't a step picture a build wrote: left out of the deck`);
  }
  s.frames = [...steps, s.png];
  const own = s.spec.notes, listed = notes[s.base];
  if (own !== undefined && typeof own !== 'string') warnings.push(`${s.base}: "notes" should be text`);
  if (listed !== undefined && typeof listed !== 'string') warnings.push(`notes.json: "${s.base}" should be text`);
  s.note = typeof own === 'string' && own.trim() ? own : typeof listed === 'string' ? listed : '';
  if (!s.note.trim()) warnings.push(`${s.base}: no speaker notes`);
  s.title = String(s.spec.title ?? s.base);
  s.alt = s.title + (s.spec.subtitle ? `. ${s.spec.subtitle}` : '');
}
const deckTitle = titleArg ?? slides[0].title;
const name = nameArg ?? path.basename(dir);

// ---------- the browser deck ----------

const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// File names go into the page as URLs: "#", "?" and "%" in one must not cut it short.
const url = f => encodeURIComponent(f);
const data = slides.map(s => ({ src: url(s.png), frames: s.frames.map(url), title: s.title, sub: String(s.spec.subtitle ?? ''), note: s.note }));
const page = fs.readFileSync(path.join(here, '..', 'assets', 'deck.html'), 'utf8')
  .replace('__TITLE__', () => esc(deckTitle))
  .replace('__MARK__', () => MARK)
  .replace('__SLIDES__', () => JSON.stringify(data).replace(/</g, '\\u003c'));

// ---------- PDF: every slide finished ----------

const pdf = await PDFDocument.create();
pdf.setTitle(deckTitle); pdf.setCreator(MARK);
for (const s of slides) {
  const img = await pdf.embedPng(fs.readFileSync(path.join(dir, s.png)));
  const w = 960, h = Math.round(w * img.height / img.width);    // 13.33 x 7.5 in for a 16:9 slide
  pdf.addPage([w, h]).drawImage(img, { x: 0, y: 0, width: w, height: h });
}
const pdfBytes = await pdf.save({ useObjectStreams: false });

// ---------- PowerPoint: one picture per step, each later one fading in on a click ----------

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';                                    // 13.333 x 7.5 in
pres.title = deckTitle; pres.subject = MARK;
const clicks = [];
for (const s of slides) {
  const slide = pres.addSlide();
  // Fitted to the slide by its own shape, centred: a slide that isn't 16:9 is never stretched.
  const png = fs.readFileSync(path.join(dir, s.png)), aspect = png.readUInt32BE(16) / png.readUInt32BE(20);
  const w = Math.min(13.333, 7.5 * aspect), h = w / aspect, x = (13.333 - w) / 2, y = (7.5 - h) / 2;
  s.frames.forEach((f, k) => slide.addImage({ path: path.join(dir, f), x, y, w, h, objectName: `step ${k + 1}`,
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
const pptxBytes = await flat.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

// ---------- write the three together, never over a file deck.mjs didn't write ----------

async function ours(file) {
  if (!fs.existsSync(file)) return true;
  const bytes = fs.readFileSync(file);
  if (file.endsWith('.pptx')) {
    try { return (await (await JSZip.loadAsync(bytes)).file('docProps/core.xml')?.async('string') ?? '').includes(MARK); }
    catch { return false; }
  }
  if (file.endsWith('.pdf')) {
    try { return (await PDFDocument.load(bytes, { updateMetadata: false })).getCreator() === MARK; }
    catch { return false; }
  }
  return bytes.includes(MARK);
}
const outputs = [['index.html', page], [`${name}.pdf`, pdfBytes], [`${name}.pptx`, pptxBytes]].map(([f, b]) => [path.join(dir, f), b]);
const theirs = [];
for (const [f] of outputs) if (!(await ours(f))) theirs.push(path.basename(f));
if (theirs.length && !force) {
  console.error(`${theirs.join(', ')} ${theirs.length > 1 ? 'are' : 'is'} in ${folder} but deck.mjs didn't write ` +
    `${theirs.length > 1 ? 'them' : 'it'}: move ${theirs.length > 1 ? 'them' : 'it'}, choose another --name, or pass --force to replace ${theirs.length > 1 ? 'them' : 'it'}.`);
  process.exit(1);
}
// Write the new set beside the old, move the old aside, move the new in; on any
// failure, put the old set back as it was, so the folder never mixes two decks.
const tmp = `.${process.pid}.tmp`, bak = `.${process.pid}.bak`;
const setAside = [], placed = [];
try {
  for (const [f, b] of outputs) fs.writeFileSync(f + tmp, b);
  for (const [f] of outputs) if (fs.existsSync(f)) { fs.renameSync(f, f + bak); setAside.push(f); }
  for (const [f] of outputs) { fs.renameSync(f + tmp, f); placed.push(f); }
  for (const f of setAside) fs.rmSync(f + bak, { force: true });
} catch (e) {
  for (const f of placed) fs.rmSync(f, { force: true });
  for (const f of setAside) { try { fs.renameSync(f + bak, f); } catch { /* reported below */ } }
  for (const [f] of outputs) fs.rmSync(f + tmp, { force: true });
  const lost = setAside.filter(f => !fs.existsSync(f));
  console.error(`Could not write the deck in ${folder}: ${e.message}` +
    (lost.length ? `\nThe earlier ${lost.map(f => path.basename(f)).join(' and ')} could not be put back: see ${lost.map(f => f + bak).join(', ')}` : ''));
  process.exit(1);
}

const total = clicks.reduce((a, b) => a + b, 0);
console.log(`${slides.length} slides, ${total} step${total === 1 ? '' : 's'} after the first`);
for (const f of ['index.html', `${name}.pdf`, `${name}.pptx`]) console.log(`wrote ${path.join(dir, f)}`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`- ${w}`);
  process.exit(3);
}
console.log('no warnings');
