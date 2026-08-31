import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function parseArguments(values) {
  const options = {};
  for (let index = 0; index < values.length; index += 1) {
    const key = values[index];
    if (!key.startsWith("--")) throw new Error("Unexpected argument: " + key);
    const value = values[index + 1];
    if (!value || value.startsWith("--")) throw new Error("Missing value for " + key);
    options[key.slice(2)] = value;
    index += 1;
  }
  return options;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDuration(seconds) {
  const rounded = Math.max(0, Math.floor(seconds));
  return Math.floor(rounded / 60) + ":" + String(rounded % 60).padStart(2, "0");
}

const options = parseArguments(process.argv.slice(2));
if (!options.workdir) {
  throw new Error("Usage: build-reader.mjs --workdir <directory> [--title <title>] [--audio <filename>]");
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootPath = path.resolve(options.workdir);
const report = JSON.parse(fs.readFileSync(path.join(rootPath, "blocks.json"), "utf8"));
const timingData = JSON.parse(fs.readFileSync(path.join(rootPath, "block-timings.json"), "utf8"));
const wordTimingData = JSON.parse(fs.readFileSync(path.join(rootPath, "word-timings.json"), "utf8"));
const outputPath = path.join(rootPath, "reader-fragment.html");
const standalonePath = path.join(rootPath, "index.html");
const visualizationCssPath = path.resolve(scriptDirectory, "../assets/reader-base.css");
const audioFilename = options.audio || "narration.mp3";
const readerTitle = options.title || "Narrated Markdown reader";
const words = JSON.stringify(wordTimingData.words.map((word) => [word.block, word.start, word.end, word.text, word.charStart])).replace(/</g, "\\u003c");
const sections = JSON.stringify(report.blocks.map((block) => block.section)).replace(/</g, "\\u003c");
const mathBlocks = JSON.stringify(Object.fromEntries(
  report.blocks
    .filter((block) => block.type === "math")
    .map((block) => [block.index, block.mathLines.flat()])
)).replace(/</g, "\\u003c");

const fragment = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"><\/script>
<div id="highlighted-report-reader">
  <div class="card reader-toolbar">
    <audio data-audio controls preload="metadata" src="./${escapeHtml(audioFilename)}">
      Your browser does not support audio playback.
    </audio>
    <label class="form-label reader-position" for="highlighted-reader-position">
      <span class="reader-position-label">
        <span>Position</span>
        <span class="tabular-nums" data-time>0:00 / ${formatDuration(timingData.duration)}</span>
      </span>
      <input id="highlighted-reader-position" class="form-range" data-scrubber type="range" min="0" max="${timingData.duration}" value="0" step="0.1">
    </label>
    <div class="viz-controls">
      <label class="form-label" for="highlighted-reader-speed">
        Speed
        <select id="highlighted-reader-speed" class="form-select">
          <option value="0.75">0.75×</option>
          <option value="1" selected>1×</option>
          <option value="1.25">1.25×</option>
          <option value="1.5">1.5×</option>
          <option value="1.75">1.75×</option>
          <option value="2">2×</option>
        </select>
      </label>
      <label class="form-label" for="highlighted-reader-theme">
        Appearance
        <select id="highlighted-reader-theme" class="form-select" data-theme>
          <option value="system" selected>System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label class="form-label" for="highlighted-reader-alignment">
        Page alignment
        <select id="highlighted-reader-alignment" class="form-select" data-alignment>
          <option value="center" selected>Centered</option>
          <option value="left">Left</option>
        </select>
      </label>
      <label class="form-label" for="highlighted-reader-width">
        Reading width
        <select id="highlighted-reader-width" class="form-select" data-width-control>
          <option value="narrow">Narrow</option>
          <option value="comfortable" selected>Comfortable</option>
          <option value="wide">Wide</option>
        </select>
      </label>
      <label class="form-check form-switch">
        <input class="form-check-input" type="checkbox" data-follow checked>
        <span class="form-check-label">Follow text</span>
      </label>
      <span class="text-small text-muted" data-status aria-live="polite">Ready</span>
    </div>
  </div>

  <article class="report-document" data-document>
    <div class="reader-line-highlight" data-line-highlight aria-hidden="true" hidden></div>
${report.bodyHtml}
  </article>
</div>

<style>
  #highlighted-report-reader {
    --reader-column-width: 52rem;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
    width: 100%;
    min-width: 0;
    color: var(--foreground);
  }

  #highlighted-report-reader[data-reader-theme="light"] {
    color-scheme: light;
  }

  #highlighted-report-reader[data-reader-theme="dark"] {
    color-scheme: dark;
  }

  #highlighted-report-reader[data-reader-width="narrow"] {
    --reader-column-width: 40rem;
  }

  #highlighted-report-reader[data-reader-width="comfortable"] {
    --reader-column-width: 52rem;
  }

  #highlighted-report-reader[data-reader-width="wide"] {
    --reader-column-width: 68rem;
  }

  #highlighted-report-reader .reader-toolbar {
    position: sticky;
    top: 0;
    z-index: 2;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
    min-width: 0;
  }

  #highlighted-report-reader audio {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  #highlighted-report-reader .reader-position {
    display: grid;
    gap: 0.5rem;
    width: 100%;
  }

  #highlighted-report-reader .reader-position-label {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  #highlighted-report-reader .report-document {
    display: block;
    position: relative;
    width: 100%;
    max-width: var(--reader-column-width);
    min-width: 0;
    margin-inline: auto;
  }

  #highlighted-report-reader[data-reader-alignment="left"] .report-document {
    margin-inline: 0 auto;
  }

  #highlighted-report-reader .report-document > h1 {
    margin-block: 0 1.5rem;
  }

  #highlighted-report-reader .report-document > h2 {
    margin-block: 3rem 0.8rem;
  }

  #highlighted-report-reader .report-document > h3 {
    margin-block: 2rem 0.6rem;
  }

  #highlighted-report-reader .report-document > h2 + h3 {
    margin-block-start: 0.25rem;
  }

  #highlighted-report-reader .report-document > :is(p, ul, ol, blockquote) {
    margin-block: 0 1rem;
  }

  #highlighted-report-reader .report-document > :is(.table-responsive, pre, .report-math) {
    margin-block: 1rem 1.75rem;
  }

  #highlighted-report-reader .report-block {
    position: relative;
    z-index: 1;
  }

  #highlighted-report-reader .reader-line-highlight {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    background: var(--accent);
    border-radius: 0.25rem;
    transition: transform 120ms ease, width 120ms ease, height 120ms ease;
  }

  #highlighted-report-reader .reader-word {
    position: relative;
    z-index: 2;
  }

  #highlighted-report-reader .report-math {
    display: grid;
    gap: 0.65rem;
  }

  #highlighted-report-reader .report-math-line {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
  }

  #highlighted-report-reader .report-math-token {
    display: inline-block;
    padding-inline: 0.1rem;
  }

  #highlighted-report-reader .reader-word.is-current {
    color: var(--primary-foreground);
    background: var(--primary);
    border-radius: 0.2rem;
    box-shadow: 0 0 0 0.12rem var(--primary);
  }

  #highlighted-report-reader pre {
    white-space: pre-wrap;
  }

  @media (prefers-reduced-motion: reduce) {
    #highlighted-report-reader .reader-line-highlight {
      transition: none;
    }
  }
</style>

<script>
(() => {
  const root = document.getElementById("highlighted-report-reader");
  if (!root) return;

  const audio = root.querySelector("[data-audio]");
  const speed = root.querySelector("#highlighted-reader-speed");
  const theme = root.querySelector("[data-theme]");
  const alignment = root.querySelector("[data-alignment]");
  const readingWidth = root.querySelector("[data-width-control]");
  const scrubber = root.querySelector("[data-scrubber]");
  const timeLabel = root.querySelector("[data-time]");
  const follow = root.querySelector("[data-follow]");
  const status = root.querySelector("[data-status]");
  const documentElement = root.querySelector("[data-document]");
  const lineHighlight = root.querySelector("[data-line-highlight]");
  const blockElements = Array.from(root.querySelectorAll("[data-block]"));
  const words = ${words};
  const sections = ${sections};
  const mathBlocks = ${mathBlocks};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const wordElements = [];
  let activeWordIndex = -1;
  let scrubbing = false;
  let resumeAfterScrub = false;
  let scrubFrame = 0;
  let playbackFrame = 0;

  function applyTheme(preference) {
    const resolved = preference === "system"
      ? (colorSchemeQuery.matches ? "dark" : "light")
      : preference;
    root.dataset.readerTheme = resolved;
    if (document.documentElement.hasAttribute("data-reader-standalone")) {
      document.documentElement.dataset.theme = resolved;
    }
  }

  function applyReadingLayout() {
    root.dataset.readerAlignment = alignment.value;
    root.dataset.readerWidth = readingWidth.value;
    requestAnimationFrame(() => {
      if (activeWordIndex >= 0 && wordElements[activeWordIndex]) {
        updateLineHighlight(wordElements[activeWordIndex][0]);
      }
    });
  }

  function formatTime(seconds) {
    const rounded = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(rounded / 60);
    const remainder = String(rounded % 60).padStart(2, "0");
    return minutes + ":" + remainder;
  }

  function findWord(time) {
    let low = 0;
    let high = words.length - 1;
    let result = 0;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      if (words[middle][1] <= time) {
        result = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }
    return result;
  }

  function updatePosition(time) {
    const duration = Number.isFinite(audio.duration) ? audio.duration : ${timingData.duration};
    if (!scrubbing) scrubber.value = String(Math.min(time, duration));
    timeLabel.textContent = formatTime(time) + " / " + formatTime(duration);
  }

  function prepareWordSpans() {
    function escapePattern(value) {
      const escape = String.fromCharCode(92);
      const special = "^$*+?.()|[]{}-/";
      return Array.from(value, (character) =>
        special.includes(character) || character === escape ? escape + character : character
      ).join("");
    }

    const whitespacePattern = new RegExp(String.fromCharCode(92) + "s+", "g");
    const whitespaceReplacement = String.fromCharCode(92) + "s+";

    const wordsByBlock = new Map();
    words.forEach((word, index) => {
      if (!wordsByBlock.has(word[0])) wordsByBlock.set(word[0], []);
      wordsByBlock.get(word[0]).push({ index, text: word[3], charStart: word[4] });
    });

    let unmapped = 0;
    blockElements.forEach((element) => {
      const blockIndex = Number(element.dataset.block);
      const blockWords = wordsByBlock.get(blockIndex) || [];

      if (element.hasAttribute("data-math-block")) {
        const segments = mathBlocks[blockIndex] || [];
        blockWords.forEach((word) => {
          const segment = segments.find((candidate) =>
            candidate.speechStart <= word.charStart && word.charStart < candidate.speechEnd
          );
          if (!segment) {
            unmapped += 1;
            return;
          }
          const selector = '[data-math-token="' + blockIndex + ':' + segment.index + '"]';
          const tokenElement = element.querySelector(selector);
          if (!tokenElement) {
            unmapped += 1;
            return;
          }
          wordElements[word.index] = [tokenElement];
        });
        return;
      }

      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let flatText = "";
      let node = walker.nextNode();
      while (node) {
        const start = flatText.length;
        flatText += node.data;
        nodes.push({ node, start, end: flatText.length, ranges: [] });
        node = walker.nextNode();
      }

      let cursor = 0;
      blockWords.forEach((word) => {
        const pattern = escapePattern(word.text).replace(whitespacePattern, whitespaceReplacement);
        const matcher = new RegExp(pattern, "gi");
        matcher.lastIndex = cursor;
        const match = matcher.exec(flatText);
        if (!match) {
          unmapped += 1;
          return;
        }

        const position = match.index;
        const matchEnd = position + match[0].length;
        nodes.forEach((nodeInfo) => {
          const start = Math.max(position, nodeInfo.start);
          const end = Math.min(matchEnd, nodeInfo.end);
          if (end <= start) return;
          const localStart = start - nodeInfo.start;
          const localEnd = end - nodeInfo.start;
          if (!nodeInfo.node.data.slice(localStart, localEnd).trim()) return;
          nodeInfo.ranges.push({ start: localStart, end: localEnd, index: word.index });
        });
        cursor = matchEnd;
      });

      nodes.forEach((nodeInfo) => {
        if (!nodeInfo.ranges.length) return;
        const fragment = document.createDocumentFragment();
        let offset = 0;
        nodeInfo.ranges.forEach((range) => {
          if (range.start > offset) {
            fragment.append(document.createTextNode(nodeInfo.node.data.slice(offset, range.start)));
          }
          const span = document.createElement("span");
          span.className = "reader-word";
          span.dataset.word = String(range.index);
          span.textContent = nodeInfo.node.data.slice(range.start, range.end);
          fragment.append(span);
          if (!wordElements[range.index]) wordElements[range.index] = [];
          wordElements[range.index].push(span);
          offset = range.end;
        });
        if (offset < nodeInfo.node.data.length) {
          fragment.append(document.createTextNode(nodeInfo.node.data.slice(offset)));
        }
        nodeInfo.node.replaceWith(fragment);
      });
    });

    if (unmapped) console.warn("Unmapped narration words:", unmapped);
  }

  function renderMathBlocks() {
    if (!window.katex) {
      console.warn("KaTeX did not load; showing readable formula source instead.");
      return;
    }

    root.querySelectorAll("[data-math-token]").forEach((element) => {
      const identifiers = element.dataset.mathToken.split(":").map(Number);
      const segments = mathBlocks[identifiers[0]] || [];
      const segment = segments.find((candidate) => candidate.index === identifiers[1]);
      if (!segment) return;
      window.katex.render(segment.tex, element, {
        displayMode: false,
        throwOnError: false,
        strict: false,
      });
    });
  }

  function updateLineHighlight(wordElement) {
    if (!wordElement) return;
    const block = wordElement.closest("[data-block]");
    if (!block) return;
    const wordRect = wordElement.getBoundingClientRect();
    const blockRect = block.getBoundingClientRect();
    const documentRect = documentElement.getBoundingClientRect();
    const mathLine = wordElement.closest("[data-math-line]");
    const mathLineRect = mathLine ? mathLine.getBoundingClientRect() : null;
    const computed = getComputedStyle(wordElement);
    const parsedLineHeight = Number.parseFloat(computed.lineHeight);
    const lineHeight = mathLineRect
      ? mathLineRect.height
      : Number.isFinite(parsedLineHeight) ? parsedLineHeight : wordRect.height * 1.35;
    const x = blockRect.left - documentRect.left;
    const y = mathLineRect
      ? mathLineRect.top - documentRect.top
      : wordRect.top - documentRect.top - Math.max(0, (lineHeight - wordRect.height) / 2);

    lineHighlight.hidden = false;
    lineHighlight.style.width = blockRect.width + "px";
    lineHighlight.style.height = lineHeight + "px";
    lineHighlight.style.transform = "translate(" + x + "px, " + y + "px)";
  }

  function setActiveWord(index, shouldScroll, displayTime, smoothScroll) {
    const elements = wordElements[index];
    if (!elements || !elements.length) return;
    const element = elements[0];
    if (index === activeWordIndex) {
      updateLineHighlight(element);
      return;
    }
    if (activeWordIndex >= 0 && wordElements[activeWordIndex]) {
      wordElements[activeWordIndex].forEach((part) => part.classList.remove("is-current"));
      wordElements[activeWordIndex][0].removeAttribute("aria-current");
    }

    activeWordIndex = index;
    elements.forEach((part) => part.classList.add("is-current"));
    element.setAttribute("aria-current", "true");
    const blockIndex = words[index][0];
    status.textContent = sections[blockIndex] + " · " + formatTime(displayTime);
    updateLineHighlight(element);

    if (shouldScroll && follow.checked) {
      const rect = element.getBoundingClientRect();
      const outsideReadingBand = rect.top < window.innerHeight * 0.24 || rect.bottom > window.innerHeight * 0.76;
      if (!outsideReadingBand && smoothScroll !== false) return;
      const behavior = reduceMotion || smoothScroll === false ? "auto" : "smooth";
      element.scrollIntoView({ behavior, block: "center" });
    }
  }

  function synchronize(shouldScroll, time, smoothScroll) {
    const targetTime = Number.isFinite(time) ? time : audio.currentTime;
    setActiveWord(findWord(targetTime), shouldScroll, targetTime, smoothScroll);
  }

  function stopPlaybackLoop() {
    cancelAnimationFrame(playbackFrame);
    playbackFrame = 0;
  }

  function playbackLoop() {
    if (audio.paused || audio.ended || scrubbing) {
      playbackFrame = 0;
      return;
    }
    updatePosition(audio.currentTime);
    synchronize(true);
    playbackFrame = requestAnimationFrame(playbackLoop);
  }

  speed.addEventListener("change", () => {
    audio.playbackRate = Number(speed.value);
    audio.preservesPitch = true;
  });

  theme.addEventListener("change", () => applyTheme(theme.value));
  colorSchemeQuery.addEventListener("change", () => {
    if (theme.value === "system") applyTheme("system");
  });
  alignment.addEventListener("change", applyReadingLayout);
  readingWidth.addEventListener("change", applyReadingLayout);

  scrubber.addEventListener("pointerdown", () => {
    scrubbing = true;
    resumeAfterScrub = !audio.paused;
    if (resumeAfterScrub) audio.pause();
  });

  scrubber.addEventListener("input", () => {
    scrubbing = true;
    const targetTime = Number(scrubber.value);
    audio.currentTime = targetTime;
    updatePosition(targetTime);
    cancelAnimationFrame(scrubFrame);
    scrubFrame = requestAnimationFrame(() => synchronize(true, targetTime, false));
  });

  scrubber.addEventListener("change", () => {
    const targetTime = Number(scrubber.value);
    audio.currentTime = targetTime;
    scrubbing = false;
    updatePosition(targetTime);
    synchronize(true, targetTime, false);
    if (resumeAfterScrub) audio.play();
    resumeAfterScrub = false;
  });

  audio.addEventListener("timeupdate", () => {
    if (scrubbing || playbackFrame) return;
    updatePosition(audio.currentTime);
    synchronize(!audio.paused);
  });
  audio.addEventListener("seeked", () => {
    if (scrubbing) return;
    updatePosition(audio.currentTime);
    synchronize(true);
  });
  audio.addEventListener("play", () => {
    stopPlaybackLoop();
    synchronize(true);
    playbackFrame = requestAnimationFrame(playbackLoop);
  });
  audio.addEventListener("pause", stopPlaybackLoop);
  audio.addEventListener("loadedmetadata", () => {
    scrubber.max = String(audio.duration);
    updatePosition(audio.currentTime);
    status.textContent = "Ready · " + formatTime(audio.duration);
    synchronize(false);
  });
  audio.addEventListener("ended", () => {
    stopPlaybackLoop();
    status.textContent = "Finished";
  });

  window.addEventListener("resize", () => {
    if (activeWordIndex >= 0 && wordElements[activeWordIndex]) {
      updateLineHighlight(wordElements[activeWordIndex][0]);
    }
  });

  audio.playbackRate = Number(speed.value);
  applyTheme(theme.value);
  applyReadingLayout();
  renderMathBlocks();
  prepareWordSpans();
  updatePosition(0);
  setActiveWord(0, false, 0, false);
})();
</script>
`;

fs.writeFileSync(outputPath, fragment);
const visualizationCss = fs.readFileSync(visualizationCssPath, "utf8");
const standalone = `<!doctype html>
<html lang="en" data-reader-standalone>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(readerTitle)}</title>
  <style>
${visualizationCss}
    html { color-scheme: light dark; }
    body { box-sizing: border-box; max-width: 90rem; margin: 0 auto; padding: 1rem; background: var(--background); color: var(--foreground); }
  </style>
</head>
<body>
${fragment}
</body>
</html>
`;
fs.writeFileSync(standalonePath, standalone);
console.log(JSON.stringify({ outputPath, standalonePath, bytes: Buffer.byteLength(fragment), standaloneBytes: Buffer.byteLength(standalone), blocks: report.blocks.length }, null, 2));
