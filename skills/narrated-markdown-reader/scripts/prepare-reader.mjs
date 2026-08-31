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

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function plainText(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<((?:https?:\/\/|mailto:)[^>]+)>/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(?<!\w)[*_]([^*_]+)[*_](?!\w)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\\([*_`])/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function inlineHtml(value) {
  const html = marked.parseInline(value).trim();
  if (!linkPrefix) return html;
  return html.replace(/\b(href|src)="(?![a-z][a-z\d+.-]*:|\/|#)([^"]+)"/gi, (_match, attribute, target) =>
    `${attribute}="${escapeHtml(linkPrefix + target)}"`
  );
}

function normalizeMath(value) {
  return value.replace(/\s+/g, " ").trim();
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

function mathSpecification(source) {
  const specification = mathSpecifications.get(normalizeMath(source));
  if (!specification) {
    throw new Error("A fenced math block is missing an explicit natural-language narration: " + source);
  }
  return specification;
}

const blocks = [];
const body = [];
let currentSection = "Opening";

function addBlock(type, text, html, wrapper) {
  const spokenText = plainText(text);
  if (!spokenText) return -1;
  const index = blocks.length;
  blocks.push({ index, type, text: spokenText, section: currentSection });
  body.push(wrapper(index, html));
  return index;
}

const tokens = marked.lexer(source);

for (const token of tokens) {
  if (token.type === "space") continue;

  if (token.type === "heading") {
    const depth = Math.min(3, token.depth);
    const text = plainText(token.text);
    if (depth <= 2) currentSection = text;
    addBlock(`h${depth}`, token.text, inlineHtml(token.text), (index, html) =>
      `<h${depth} class="report-block" data-block="${index}">${html}</h${depth}>`
    );
    continue;
  }

  if (token.type === "paragraph") {
    addBlock("paragraph", token.text, inlineHtml(token.text), (index, html) =>
      `<p class="report-block" data-block="${index}">${html}</p>`
    );
    continue;
  }

  if (token.type === "list") {
    const tag = token.ordered ? "ol" : "ul";
    const start = token.ordered && token.start ? ` start="${Number(token.start)}"` : "";
    const items = [];
    for (const item of token.items) {
      const text = item.text;
      const html = inlineHtml(text.replace(/\n/g, " "));
      const spokenText = plainText(text);
      if (!spokenText) continue;
      const index = blocks.length;
      blocks.push({ index, type: token.ordered ? "ordered-item" : "list-item", text: spokenText, section: currentSection });
      items.push(`<li class="report-block" data-block="${index}">${html}</li>`);
    }
    body.push(`<${tag}${start}>${items.join("\n")}</${tag}>`);
    continue;
  }

  if (token.type === "table") {
    const rows = [];
    const headerText = token.header.map((cell) => plainText(cell.text)).join(". ");
    const headerIndex = blocks.length;
    blocks.push({ index: headerIndex, type: "table-header", text: headerText, section: currentSection });
    rows.push(`<thead><tr class="report-block" data-block="${headerIndex}">${token.header.map((cell) => `<th>${inlineHtml(cell.text)}</th>`).join("")}</tr></thead>`);

    const tableRows = token.rows.map((row) => {
      const rowText = row.map((cell) => plainText(cell.text)).join(". ");
      const index = blocks.length;
      blocks.push({ index, type: "table-row", text: rowText, section: currentSection });
      return `<tr class="report-block" data-block="${index}">${row.map((cell) => `<td>${inlineHtml(cell.text)}</td>`).join("")}</tr>`;
    });
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

    const text = token.text.replace(/\s+/g, " ").trim();
    addBlock("code", text, escapeHtml(token.text), (index, html) =>
      `<pre class="report-block" data-block="${index}"><code>${html}</code></pre>`
    );
    continue;
  }

  if (token.type === "blockquote") {
    const text = token.text || token.raw;
    addBlock("blockquote", text, inlineHtml(text), (index, html) =>
      `<blockquote class="report-block" data-block="${index}">${html}</blockquote>`
    );
    continue;
  }

  if (token.type === "hr") {
    body.push("<hr>");
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify({
  schemaVersion: 1,
  sourcePath,
  blocks,
  bodyHtml: body.join("\n"),
}, null, 2));
console.log(JSON.stringify({ outputPath, blocks: blocks.length, characters: blocks.reduce((sum, block) => sum + block.text.length, 0) }, null, 2));
