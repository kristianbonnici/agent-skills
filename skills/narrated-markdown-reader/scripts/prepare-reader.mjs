import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const { marked } = require(path.resolve(scriptDirectory, "../assets/vendor/marked.umd.js"));

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

const options = parseArguments(process.argv.slice(2));
if (!options.source || !options.output) {
  throw new Error("Usage: prepare-reader.mjs --source <markdown> --output <blocks.json> [--math-spec <json>] [--link-prefix <prefix>]");
}

const sourcePath = path.resolve(options.source);
const outputPath = path.resolve(options.output);
const linkPrefix = options["link-prefix"] || "";
const source = fs.readFileSync(sourcePath, "utf8");

const warnings = [];

function warn(message) {
  if (!warnings.includes(message)) warnings.push(message);
}

function fail(message) {
  console.error("prepare-reader: " + message);
  process.exit(1);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function collapse(value) {
  return value.replace(/\s+/g, " ").trim();
}

// HTML entities: the Latin-1 block is in code point order from U+00A0, the rest is a list of the
// ones that turn up in prose. An entity that isn't here is spoken as written, with a warning.
const NAMED_ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", sbquo: "‚",
  ldquo: "“", rdquo: "”", bdquo: "„", dagger: "†", Dagger: "‡",
  bull: "•", hellip: "…", permil: "‰", prime: "′", Prime: "″",
  lsaquo: "‹", rsaquo: "›", euro: "€", trade: "™",
  ensp: " ", emsp: " ", thinsp: " ", zwnj: "‌", zwj: "‍",
  larr: "←", uarr: "↑", rarr: "→", darr: "↓", harr: "↔",
  lArr: "⇐", rArr: "⇒", hArr: "⇔",
  minus: "−", ne: "≠", le: "≤", ge: "≥", infin: "∞", asymp: "≈",
  equiv: "≡", sum: "∑", radic: "√", check: "✓", hearts: "♥",
  Alpha: "Α", Beta: "Β", Gamma: "Γ", Delta: "Δ", Sigma: "Σ", Pi: "Π", Omega: "Ω",
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", lambda: "λ",
  mu: "μ", pi: "π", sigma: "σ", omega: "ω",
};
"nbsp iexcl cent pound curren yen brvbar sect uml copy ordf laquo not shy reg macr deg plusmn sup2 sup3 acute micro para middot cedil sup1 ordm raquo frac14 frac12 frac34 iquest Agrave Aacute Acirc Atilde Auml Aring AElig Ccedil Egrave Eacute Ecirc Euml Igrave Iacute Icirc Iuml ETH Ntilde Ograve Oacute Ocirc Otilde Ouml times Oslash Ugrave Uacute Ucirc Uuml Yacute THORN szlig agrave aacute acirc atilde auml aring aelig ccedil egrave eacute ecirc euml igrave iacute icirc iuml eth ntilde ograve oacute ocirc otilde ouml divide oslash ugrave uacute ucirc uuml yacute thorn yuml"
  .split(" ")
  .forEach((name, offset) => {
    NAMED_ENTITIES[name] = String.fromCodePoint(160 + offset);
  });

function decodeEntities(value) {
  return value.replace(/&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z][a-zA-Z0-9]*));/g, (match, decimal, hexadecimal, name) => {
    if (name) {
      if (Object.hasOwn(NAMED_ENTITIES, name)) return NAMED_ENTITIES[name];
      warn("Unknown HTML entity " + match + " is spoken as written.");
      return match;
    }
    const code = decimal ? Number(decimal) : Number.parseInt(hexadecimal, 16);
    if (!Number.isInteger(code) || code <= 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return "";
    return String.fromCodePoint(code);
  });
}

// Inline math ($x$, $$x$$ and \(x\)) is taken out of the text before Markdown reads it, as a
// placeholder with the item's number, and put back as a span on the page and as its spoken words
// in the narration.
const MATH_OPEN = "";
const MATH_CLOSE = "";
const CODE_OPEN = "";
const CODE_CLOSE = "";

function normalizeMath(value) {
  return value.replace(/\s+/g, " ").trim();
}

function assertSpeakable(speech, where) {
  if (typeof speech !== "string" || !speech.trim()) {
    fail("The math spec needs a non-empty \"speech\" for " + where + ".");
  }
  if (/[\\$^_{}]/.test(speech)) {
    fail("The math spec's speech for " + where + " still holds LaTeX (a backslash, $, ^, _, { or }); write it as spoken words: " + speech);
  }
}

const mathSpecificationData = options["math-spec"]
  ? JSON.parse(fs.readFileSync(path.resolve(options["math-spec"]), "utf8"))
  : { formulas: [] };
const rawMathSpecifications = mathSpecificationData.formulas || [];

function prepareMathSpecification(specification) {
  let narration = "";
  let segmentIndex = 0;
  const lines = specification.lines.map((line, lineIndex) => {
    if (lineIndex > 0) narration += ". ";
    return line.map((segment, itemIndex) => {
      assertSpeakable(segment.speech, "a segment of the formula " + specification.source);
      if (itemIndex > 0) narration += " ";
      const speechStart = narration.length;
      narration += segment.speech;
      const prepared = { ...segment, index: segmentIndex, speechStart, speechEnd: narration.length };
      segmentIndex += 1;
      return prepared;
    });
  });
  narration += ".";
  return { source: specification.source, narration, lines };
}

const mathSpecifications = new Map(
  rawMathSpecifications.map((specification) => {
    const prepared = prepareMathSpecification(specification);
    return [normalizeMath(prepared.source), prepared];
  })
);

const inlineSpecifications = new Map();
for (const entry of mathSpecificationData.inline || []) {
  if (!entry || typeof entry.source !== "string" || !normalizeMath(entry.source)) {
    fail("Every entry of the math spec's \"inline\" list needs a \"source\" (the exact LaTeX).");
  }
  assertSpeakable(entry.speech, "the inline expression " + entry.source);
  const key = normalizeMath(entry.source);
  const speech = collapse(entry.speech);
  if (inlineSpecifications.has(key) && inlineSpecifications.get(key) !== speech) {
    fail("The math spec gives the inline expression " + entry.source + " two different spoken forms.");
  }
  inlineSpecifications.set(key, speech);
}

function mathSpecification(source) {
  const specification = mathSpecifications.get(normalizeMath(source));
  if (!specification) {
    throw new Error("A fenced math block is missing an explicit natural-language narration: " + source);
  }
  return specification;
}

const missingInlineMath = new Set();

function newMathContext() {
  return { items: [] };
}

function extractInlineMath(value, context) {
  let result = "";
  let position = 0;

  function take(tex, display) {
    const trimmed = tex.trim();
    const key = normalizeMath(trimmed);
    let speech = inlineSpecifications.get(key);
    if (speech === undefined) {
      missingInlineMath.add(key);
      speech = "";
    }
    context.items.push({ tex: trimmed, display, speech });
    return MATH_OPEN + (context.items.length - 1) + MATH_CLOSE;
  }

  while (position < value.length) {
    const character = value[position];

    if (character === "\\") {
      if (value[position + 1] === "(") {
        const end = value.indexOf("\\)", position + 2);
        if (end > position + 2 && value.slice(position + 2, end).trim()) {
          result += take(value.slice(position + 2, end), false);
          position = end + 2;
          continue;
        }
      }
      result += value.slice(position, position + 2);
      position += 2;
      continue;
    }

    // Code spans, link and image destinations and tags are not math.
    if (character === "`") {
      let length = 1;
      while (value[position + length] === "`") length += 1;
      const fence = "`".repeat(length);
      const end = value.indexOf(fence, position + length);
      if (end >= 0) {
        result += value.slice(position, end + length);
        position = end + length;
      } else {
        result += fence;
        position += length;
      }
      continue;
    }
    if (character === "!" && value[position + 1] === "[") {
      const close = value.indexOf("](", position + 2);
      const end = close >= 0 ? value.indexOf(")", close + 2) : -1;
      if (end >= 0) {
        result += value.slice(position, end + 1);
        position = end + 1;
        continue;
      }
    }
    if (character === "]" && value[position + 1] === "(") {
      const end = value.indexOf(")", position + 2);
      if (end >= 0) {
        result += value.slice(position, end + 1);
        position = end + 1;
        continue;
      }
    }
    if (character === "<" && /[a-zA-Z/!]/.test(value[position + 1] || "")) {
      const end = value.indexOf(">", position);
      if (end >= 0) {
        result += value.slice(position, end + 1);
        position = end + 1;
        continue;
      }
    }

    if (character === "$") {
      if (value[position + 1] === "$") {
        const end = value.indexOf("$$", position + 2);
        if (end > position + 2 && value.slice(position + 2, end).trim()) {
          result += take(value.slice(position + 2, end), true);
          position = end + 2;
        } else {
          result += "$$";
          position += 2;
        }
        continue;
      }
      // An opening $ is followed by something other than a space; a closing one follows
      // something other than a space and is not followed by a digit ("costs $5 or $10").
      const next = value[position + 1];
      if (next !== undefined && !/\s/.test(next)) {
        let probe = position + 1;
        let close = -1;
        while (probe < value.length) {
          const probed = value[probe];
          if (probed === "\\") {
            probe += 2;
            continue;
          }
          if (probed === "`") break;
          if (probed === "$") {
            if (!/\s/.test(value[probe - 1]) && !/\d/.test(value[probe + 1] || "")) close = probe;
            break;
          }
          probe += 1;
        }
        if (close > position + 1) {
          result += take(value.slice(position + 1, close), false);
          position = close + 1;
          continue;
        }
      }
    }

    result += character;
    position += 1;
  }
  return result;
}

function substituteSpeech(text, context) {
  let result = "";
  let last = 0;
  const spans = [];
  for (const match of text.matchAll(/(\d+)/g)) {
    result += text.slice(last, match.index);
    const index = Number(match[1]);
    const item = context.items[index];
    const speechStart = result.length;
    result += item.speech;
    spans.push({ index, tex: item.tex, speech: item.speech, speechStart, speechEnd: result.length });
    last = match.index + match[0].length;
  }
  result += text.slice(last);
  return { text: result, spans };
}

function finishMath(html, context) {
  return html.replace(/(\d+)/g, (_match, number) => {
    const index = Number(number);
    const item = context.items[index];
    const display = item.display ? ' data-display="true"' : "";
    return `<span class="reader-word report-inline-math" data-inline-math="${index}" data-tex="${escapeHtml(item.tex)}"${display} role="math" aria-label="${escapeHtml(item.speech)}"><code>${escapeHtml(item.tex)}</code></span>`;
  });
}

// What is spoken for Markdown text: the words as the page shows them. Images are pictures and
// aren't read (their alt text is no text on the page, so it couldn't be followed), and
// strikethrough marks, HTML tags and entities never are.
function plainText(value) {
  const codeSpans = [];
  const text = value
    .replace(/`([^`]+)`/g, (_match, code) => CODE_OPEN + (codeSpans.push(code) - 1) + CODE_CLOSE)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/!\[[^\]]*\]\[[^\]]*\]/g, "")
    .replace(/\[\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
    .replace(/<((?:https?:\/\/|mailto:)[^>]+)>/g, "$1")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/(?<!\w)[*_]([^*_]+)[*_](?!\w)/g, "$1")
    .replace(/\\([!-/:-@[-`{-~])/g, "$1");
  return collapse(decodeEntities(text)
    .replace(/(\d+)/g, (_match, number) => codeSpans[Number(number)]));
}

function applyLinkPrefix(html) {
  if (!linkPrefix) return html;
  return html.replace(/\b(href|src)="(?![a-z][a-z\d+.-]*:|\/|#)([^"]+)"/gi, (_match, attribute, target) =>
    `${attribute}="${escapeHtml(linkPrefix + target)}"`
  );
}

// HTML in the source (inline and block) is rendered through an allow-list: known tags with a few
// attributes and safe links, balanced; anything else is left out and said so in the warnings.
const ALLOWED_TAGS = new Set([
  "a", "abbr", "aside", "b", "bdi", "blockquote", "br", "caption", "center", "cite", "code", "dd", "del", "details",
  "div", "dl", "dt", "em", "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "i", "img",
  "ins", "kbd", "li", "main", "mark", "nav", "ol", "p", "pre", "q", "s", "samp", "section", "small", "span", "strong",
  "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "time", "tr", "u", "ul", "var", "wbr",
]);
const VOID_TAGS = new Set(["br", "hr", "img", "wbr"]);
const INLINE_TAGS = new Set([
  "a", "abbr", "b", "bdi", "br", "cite", "code", "del", "em", "i", "img", "ins", "kbd", "mark", "q", "s", "samp",
  "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr",
]);
const DROPPED_WITH_CONTENT = new Set([
  "audio", "canvas", "embed", "head", "iframe", "math", "noscript", "object", "script", "select", "style", "svg",
  "template", "textarea", "title", "video",
]);
const ALLOWED_ATTRIBUTES = {
  "*": ["title", "lang", "dir"],
  a: ["href"],
  img: ["src", "alt", "width", "height"],
  ol: ["start"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
};

function safeUrl(value, kind) {
  const compact = value.replace(/[\u0000- \u007f-\u009f]/g, "");
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(compact);
  if (!scheme) return true;
  const name = scheme[1].toLowerCase();
  if (name === "http" || name === "https") return true;
  if (kind === "href") return name === "mailto";
  return name === "data" && /^data:image\/(png|jpeg|gif|webp|avif);base64,/i.test(compact);
}

function cleanAttributes(name, attributes) {
  const allowed = new Set([...ALLOWED_ATTRIBUTES["*"], ...(ALLOWED_ATTRIBUTES[name] || [])]);
  const cleaned = [];
  for (const [attribute, rawValue] of attributes) {
    if (!allowed.has(attribute)) continue;
    const value = decodeEntities(rawValue);
    if ((attribute === "href" || attribute === "src") && !safeUrl(value, attribute)) {
      warn("Dropped an unsafe " + attribute + " on <" + name + ">: " + value.slice(0, 60));
      continue;
    }
    if (["start", "colspan", "rowspan", "width", "height"].includes(attribute) && !/^\d{1,5}$/.test(value)) continue;
    if (attribute === "dir" && !["ltr", "rtl", "auto"].includes(value)) continue;
    if (attribute === "lang" && !/^[A-Za-z0-9-]{1,35}$/.test(value)) continue;
    cleaned.push([attribute, value]);
  }
  return cleaned;
}

const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/y;
const attributePattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function tokenizeHtml(html) {
  const items = [];
  let text = "";
  let position = 0;
  const flush = () => {
    if (text) items.push({ type: "text", text });
    text = "";
  };
  while (position < html.length) {
    const start = html.indexOf("<", position);
    if (start < 0) {
      text += html.slice(position);
      break;
    }
    text += html.slice(position, start);
    if (html.startsWith("<!--", start)) {
      const end = html.indexOf("-->", start + 4);
      flush();
      position = end < 0 ? html.length : end + 3;
      continue;
    }
    if (html[start + 1] === "!" || html[start + 1] === "?") {
      const end = html.indexOf(">", start);
      flush();
      position = end < 0 ? html.length : end + 1;
      continue;
    }
    tagPattern.lastIndex = start;
    const match = tagPattern.exec(html);
    if (!match) {
      text += "&lt;";
      position = start + 1;
      continue;
    }
    flush();
    const attributes = [];
    for (const found of match[3].matchAll(attributePattern)) {
      attributes.push([found[1].toLowerCase(), found[2] ?? found[3] ?? found[4] ?? ""]);
    }
    items.push({ type: "tag", closing: match[1] === "/", name: match[2].toLowerCase(), attributes });
    position = start + match[0].length;
  }
  flush();
  return items;
}

function closeEvent(entry, fragment) {
  const sameFragment = entry.fragment === fragment;
  if (sameFragment) entry.event.structural = false;
  return { kind: "close", name: entry.name, structural: !sameFragment };
}

// Turns tokenized HTML into events, balancing tags against `state.stack`, which carries the tags a
// block of HTML opened for the blocks after it. An event is "structural" when its partner is in
// another fragment (the <details> of a <details> whose Markdown sits between its tags).
function buildEvents(items, state) {
  state.fragment += 1;
  const fragment = state.fragment;
  const events = [];
  let skipping = null;
  for (const item of items) {
    if (skipping) {
      if (item.type === "tag" && item.name === skipping.name) {
        skipping.depth += item.closing ? -1 : 1;
        if (skipping.depth === 0) skipping = null;
      }
      continue;
    }
    if (item.type === "text") {
      events.push({ kind: "text", text: item.text });
      continue;
    }
    const name = item.name;
    if (DROPPED_WITH_CONTENT.has(name)) {
      warn("Left out <" + name + "> and what is inside it: not rendered or narrated.");
      if (!item.closing) skipping = { name, depth: 1 };
      continue;
    }
    if (!ALLOWED_TAGS.has(name)) {
      warn("<" + name + "> is not supported: its tag was dropped and its text kept.");
      continue;
    }
    if (VOID_TAGS.has(name)) {
      if (item.closing) continue;
      const attributes = cleanAttributes(name, item.attributes);
      if (name === "img" && !attributes.some(([attribute]) => attribute === "src")) {
        warn("Left out an <img> with no safe src.");
        continue;
      }
      events.push({ kind: "void", name, attributes });
      continue;
    }
    if (!item.closing) {
      const event = { kind: "open", name, attributes: cleanAttributes(name, item.attributes), structural: true };
      events.push(event);
      state.stack.push({ name, fragment, event });
      continue;
    }
    let position = -1;
    for (let index = state.stack.length - 1; index >= 0; index -= 1) {
      if (state.stack[index].name === name) {
        position = index;
        break;
      }
    }
    if (position < 0) {
      warn("Dropped a stray </" + name + "> with no opening tag.");
      continue;
    }
    while (state.stack.length - 1 > position) events.push(closeEvent(state.stack.pop(), fragment));
    events.push(closeEvent(state.stack.pop(), fragment));
  }
  return events;
}

function renderEvent(event, extra = "") {
  if (event.kind === "text") return event.text;
  if (event.kind === "close") return `</${event.name}>`;
  const attributes = event.attributes.map(([name, value]) => ` ${name}="${escapeHtml(value)}"`).join("");
  const open = event.name === "details" ? " open" : "";
  return `<${event.name}${attributes}${open}${extra}>`;
}

function sanitizeInline(html) {
  if (!html.includes("<")) return html;
  const state = { stack: [], fragment: 0 };
  const events = buildEvents(tokenizeHtml(html), state);
  while (state.stack.length) events.push(closeEvent(state.stack.pop(), state.fragment));
  return events.map((event) => renderEvent(event)).join("");
}

function inlineHtml(prepared) {
  return applyLinkPrefix(sanitizeInline(marked.parseInline(prepared).trim()));
}

const blocks = [];
const body = [];
const htmlState = { stack: [], fragment: 0 };
let currentSection = "Opening";

function blockAttributes(index) {
  return ` class="report-block" data-block="${index}"`;
}

function blockRecord(index, type, spoken) {
  return {
    index,
    type,
    text: spoken.text,
    section: currentSection,
    ...(spoken.spans.length ? { inlineMath: spoken.spans } : {}),
  };
}

function inlineParts(markdown) {
  const context = newMathContext();
  const prepared = extractInlineMath(markdown, context);
  return {
    spoken: substituteSpeech(plainText(prepared), context),
    html: finishMath(inlineHtml(prepared), context),
  };
}

function tableRowParts(cells) {
  const context = newMathContext();
  const prepared = cells.map((cell) => extractInlineMath(cell.text, context));
  const speech = prepared.map((cell) => plainText(cell)).filter(Boolean).join(". ");
  return {
    spoken: substituteSpeech(speech, context),
    cells: prepared.map((cell) => finishMath(inlineHtml(cell), context)),
  };
}

// A block with spoken words gets its own entry in `blocks` and a wrapper that carries its number;
// one without (an image alone in a paragraph) is shown, with nothing to read.
function addBlock(type, parts, wrapper) {
  if (!parts.spoken.text) {
    body.push(wrapper("", parts.html));
    return -1;
  }
  const index = blocks.length;
  blocks.push(blockRecord(index, type, parts.spoken));
  body.push(wrapper(blockAttributes(index), parts.html));
  return index;
}

// The text an HTML run is read as: its text nodes, with a space where a block-level tag (or a
// line break) separates them.
function eventText(events) {
  let text = "";
  for (const event of events) {
    if (event.kind === "text") text += event.text;
    else if (event.name === "br" || !INLINE_TAGS.has(event.name)) text += " ";
  }
  return text;
}

function emitHtmlUnit(events, isElement) {
  if (!collapse(decodeEntities(eventText(events)))) {
    body.push(applyLinkPrefix(events.map((event) => renderEvent(event)).join("")));
    return;
  }
  const context = newMathContext();
  const prepared = events.map((event) =>
    event.kind === "text" ? { ...event, text: extractInlineMath(event.text, context) } : event
  );
  const spoken = substituteSpeech(collapse(decodeEntities(eventText(prepared))), context);
  const index = blocks.length;
  blocks.push(blockRecord(index, "html", spoken));
  const html = isElement
    ? prepared.map((event, position) => renderEvent(event, position === 0 ? blockAttributes(index) : "")).join("")
    : `<div class="report-block report-html" data-block="${index}">${prepared.map((event) => renderEvent(event)).join("")}</div>`;
  body.push(applyLinkPrefix(finishMath(html, context)));
}

// A run of balanced events becomes one block for each block-level element and one for each stretch
// of text and inline tags between them.
function emitHtmlRun(run) {
  let inline = [];
  let element = [];
  let depth = 0;
  const flushInline = () => {
    if (inline.length) emitHtmlUnit(inline, false);
    inline = [];
  };
  for (const event of run) {
    if (depth > 0) {
      element.push(event);
      if (event.kind === "open") depth += 1;
      if (event.kind === "close") depth -= 1;
      if (depth === 0 && !INLINE_TAGS.has(element[0].name)) {
        emitHtmlUnit(element, true);
        element = [];
      } else if (depth === 0) {
        inline.push(...element);
        element = [];
      }
      continue;
    }
    if (event.kind === "open") {
      if (!INLINE_TAGS.has(event.name)) flushInline();
      element = [event];
      depth = 1;
    } else if (event.kind === "void" && !INLINE_TAGS.has(event.name)) {
      flushInline();
      body.push(renderEvent(event));
    } else if (event.kind === "close") {
      body.push(renderEvent(event));
    } else {
      inline.push(event);
    }
  }
  flushInline();
}

function emitHtmlBlock(events) {
  let run = [];
  const flush = () => {
    if (run.length) emitHtmlRun(run);
    run = [];
  };
  for (const event of events) {
    if ((event.kind === "open" || event.kind === "close") && event.structural) {
      flush();
      body.push(applyLinkPrefix(renderEvent(event)));
    } else {
      run.push(event);
    }
  }
  flush();
}

const tokens = marked.lexer(source);

for (const token of tokens) {
  if (token.type === "space" || token.type === "def") continue;

  if (token.type === "heading") {
    const depth = Math.min(3, token.depth);
    const parts = inlineParts(token.text);
    if (depth <= 2) currentSection = parts.spoken.text;
    addBlock(`h${depth}`, parts, (attributes, html) =>
      `<h${depth}${attributes}>${html}</h${depth}>`
    );
    continue;
  }

  if (token.type === "paragraph") {
    addBlock("paragraph", inlineParts(token.text), (attributes, html) =>
      `<p${attributes}>${html}</p>`
    );
    continue;
  }

  if (token.type === "list") {
    const tag = token.ordered ? "ol" : "ul";
    const start = token.ordered && token.start ? ` start="${Number(token.start)}"` : "";
    const items = [];
    for (const item of token.items) {
      const parts = inlineParts(item.text.replace(/\n/g, " "));
      if (!parts.spoken.text) {
        items.push(`<li>${parts.html}</li>`);
        continue;
      }
      const index = blocks.length;
      blocks.push(blockRecord(index, token.ordered ? "ordered-item" : "list-item", parts.spoken));
      items.push(`<li${blockAttributes(index)}>${parts.html}</li>`);
    }
    body.push(`<${tag}${start}>${items.join("\n")}</${tag}>`);
    continue;
  }

  if (token.type === "table") {
    const rows = [];
    const tableRow = (type, cells, cellTag) => {
      const parts = tableRowParts(cells);
      let attributes = "";
      if (parts.spoken.text) {
        const index = blocks.length;
        blocks.push(blockRecord(index, type, parts.spoken));
        attributes = blockAttributes(index);
      }
      return `<tr${attributes}>${parts.cells.map((cell) => `<${cellTag}>${cell}</${cellTag}>`).join("")}</tr>`;
    };

    rows.push(`<thead>${tableRow("table-header", token.header, "th")}</thead>`);
    const tableRows = token.rows.map((row) => tableRow("table-row", row, "td"));
    rows.push(`<tbody>${tableRows.join("\n")}</tbody>`);
    body.push(`<div class="table-responsive"><table class="table table-sm">${rows.join("\n")}</table></div>`);
    continue;
  }

  if (token.type === "code") {
    if ((token.lang || "").trim().toLowerCase() === "math") {
      const specification = mathSpecification(token.text);
      const spokenText = specification.narration;
      const index = blocks.length;
      blocks.push({
        index,
        type: "math",
        text: spokenText,
        mathSource: token.text,
        mathLines: specification.lines,
        section: currentSection,
      });
      const lines = specification.lines.map((line, lineIndex) => {
        const segments = line.map((segment) =>
          `<span class="reader-word report-math-token" data-math-token="${index}:${segment.index}" data-math-start="${segment.speechStart}" data-math-end="${segment.speechEnd}"><code>${escapeHtml(segment.tex)}</code></span>`
        );
        return `<div class="report-math-line" data-math-line="${lineIndex}">${segments.join("\n")}</div>`;
      });
      body.push(
        `<div class="report-block report-math" data-block="${index}" data-math-block="${index}" role="math" aria-label="${escapeHtml(spokenText)}">${lines.join("\n")}</div>`
      );
      continue;
    }

    // Code is read as it is written, so the words match what the page shows.
    const text = collapse(token.text);
    if (!text) {
      body.push(`<pre><code>${escapeHtml(token.text)}</code></pre>`);
      continue;
    }
    const index = blocks.length;
    blocks.push({ index, type: "code", text, section: currentSection });
    body.push(`<pre${blockAttributes(index)}><code>${escapeHtml(token.text)}</code></pre>`);
    continue;
  }

  if (token.type === "blockquote") {
    addBlock("blockquote", inlineParts(token.text || token.raw), (attributes, html) =>
      `<blockquote${attributes}>${html}</blockquote>`
    );
    continue;
  }

  if (token.type === "html") {
    emitHtmlBlock(buildEvents(tokenizeHtml(token.text ?? token.raw), htmlState));
    continue;
  }

  if (token.type === "hr") {
    body.push("<hr>");
    continue;
  }

  warn("Left out a Markdown \"" + token.type + "\" block: not rendered or narrated.");
}

// HTML a block left open is closed here, so it can't swallow the page around it.
while (htmlState.stack.length) {
  const entry = htmlState.stack.pop();
  warn("Closed an unclosed <" + entry.name + "> at the end of the document.");
  body.push(`</${entry.name}>`);
}

if (missingInlineMath.size) {
  const list = [...missingInlineMath].map((tex) => "  - " + tex).join("\n");
  fail(
    missingInlineMath.size + " inline math expression" + (missingInlineMath.size === 1 ? " has" : "s have") +
    " no spoken form, and raw LaTeX never goes to text-to-speech. Add each to the \"inline\" list of the math spec" +
    " (--math-spec) as {\"source\": \"<the exact LaTeX>\", \"speech\": \"<spoken words>\"}:\n" + list
  );
}

for (const block of blocks) {
  if (block.type === "math" || block.type === "code") continue;
  const latex = /\\[a-zA-Z]+|\\[[\]]/.exec(block.text);
  if (latex) {
    warn("Block " + block.index + " (" + block.section + ") reads \"" + latex[0] + "\", which looks like LaTeX outside a fenced math block or $…$: " + block.text.slice(0, 80));
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify({
  schemaVersion: 1,
  sourcePath,
  blocks,
  bodyHtml: body.join("\n"),
}, null, 2));
for (const message of warnings) console.error("prepare-reader: warning: " + message);
console.log(JSON.stringify({
  outputPath,
  blocks: blocks.length,
  characters: blocks.reduce((sum, block) => sum + block.text.length, 0),
  inlineMath: blocks.reduce((sum, block) => sum + (block.inlineMath ? block.inlineMath.length : 0), 0),
  warnings,
}, null, 2));
