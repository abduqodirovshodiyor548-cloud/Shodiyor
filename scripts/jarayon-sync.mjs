#!/usr/bin/env node
// Sprint fayllari, qarorlar jurnali va hisobotlardan jarayon.data.js ni yig'adi.
// jarayon.html shu faylni o'qiydi. Ishlatish: node scripts/jarayon-sync.mjs [--check]

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SPRINTS_DIR = join(ROOT, "sprints");
const REPORTS_DIR = join(SPRINTS_DIR, "hisobotlar");
const OUT = join(ROOT, "jarayon.data.js");
const CHECK_ONLY = process.argv.includes("--check");

const SPRINT_STATUSES = ["rejalashtirilgan", "jarayonda", "yakunlangan", "to'xtatilgan"];
const DECISION_STATUSES = ["taklif", "qabul qilingan", "almashtirilgan", "bekor qilingan"];
const TASK_MARKERS = {
  " ": "rejalashtirilgan",
  "/": "jarayonda",
  x: "bajarildi",
  X: "bajarildi",
  "!": "bloklangan",
  "-": "bekor qilindi",
};

const errors = [];
const warnings = [];

function parseFrontmatter(text, file) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) {
    errors.push(`${file}: frontmatter topilmadi`);
    return { meta: {}, body: text };
  }
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*?)\s*(#.*)?$/);
    if (kv) meta[kv[1]] = kv[2];
  }
  return { meta, body: text.slice(m[0].length) };
}

// ``` bloklari ichidagi qatorlarni tashlab yuboradi
function stripFences(lines) {
  let inFence = false;
  return lines.filter((l) => {
    if (/^\s*```/.test(l)) {
      inFence = !inFence;
      return false;
    }
    return !inFence;
  });
}

function section(lines, title) {
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${title}`, "i").test(l));
  if (start === -1) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^##\s/.test(l));
  return end === -1 ? rest : rest.slice(0, end);
}

function parseSprint(file) {
  const text = readFileSync(join(SPRINTS_DIR, file), "utf8");
  const { meta, body } = parseFrontmatter(text, file);
  const lines = stripFences(body.split(/\r?\n/));

  if (!meta.id) errors.push(`${file}: "id" yo'q`);
  if (!SPRINT_STATUSES.includes(meta.status))
    errors.push(`${file}: noma'lum sprint statusi "${meta.status}" (ruxsat: ${SPRINT_STATUSES.join(", ")})`);

  const maqsad = section(lines, "Maqsad").join(" ").replace(/\s+/g, " ").trim();
  const dod = section(lines, "Qabul mezonlari")
    .map((l) => l.match(/^\s*-\s+(?:\[(.)\]\s+)?(.*)$/))
    .filter(Boolean)
    .map((m) => ({ text: m[2].trim(), done: m[1] ? m[1].toLowerCase() === "x" : null }));

  const tasks = [];
  let group = "Umumiy";
  for (const line of section(lines, "Vazifalar")) {
    const h = line.match(/^###\s+(.*)$/);
    if (h) {
      group = h[1].trim();
      continue;
    }
    const t = line.match(/^\s*-\s+\[(.)\]\s+(?:\*\*([A-Z]\d+-\d+)\*\*\s+)?(.*)$/);
    if (!t) continue;
    const status = TASK_MARKERS[t[1]];
    if (!status) errors.push(`${file}: noma'lum vazifa belgisi "[${t[1]}]" → ${line.trim()}`);
    if (!t[2]) warnings.push(`${file}: vazifada ID yo'q → ${line.trim()}`);
    tasks.push({ id: t[2] || null, title: t[3].trim(), group, status: status || "rejalashtirilgan" });
  }

  return {
    id: meta.id,
    nomi: meta.nomi || meta.id,
    status: meta.status,
    boshlanish: meta.boshlanish || null,
    tugash: meta.tugash || null,
    davomiylik: meta.davomiylik || null,
    fayl: `sprints/${file}`,
    maqsad,
    dod,
    tasks,
  };
}

function parseDecisions() {
  const file = join(SPRINTS_DIR, "QARORLAR.md");
  if (!existsSync(file)) return [];
  const lines = stripFences(readFileSync(file, "utf8").split(/\r?\n/));
  const out = [];
  let cur = null;
  for (const line of lines) {
    const h = line.match(/^##\s+(Q-\d+):\s*(.*)$/);
    if (h) {
      cur = { id: h[1], sarlavha: h[2].trim() };
      out.push(cur);
      continue;
    }
    const f = cur && line.match(/^\s*-\s+\*\*([^*]+?):\*\*\s*(.*)$/);
    if (f) cur[f[1].trim().toLowerCase()] = f[2].trim();
  }
  for (const d of out) {
    if (d.status && !DECISION_STATUSES.includes(d.status))
      warnings.push(`QARORLAR.md: ${d.id} noma'lum status "${d.status}"`);
  }
  return out;
}

function parseReports() {
  if (!existsSync(REPORTS_DIR)) return [];
  return readdirSync(REPORTS_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort()
    .map((f) => {
      const { meta, body } = parseFrontmatter(readFileSync(join(REPORTS_DIR, f), "utf8"), `hisobotlar/${f}`);
      const lines = body.split(/\r?\n/);
      const xulosa = section(lines, "Qisqacha xulosa").join(" ").replace(/\s+/g, " ").trim();
      return { sprint: meta.sprint, sana: meta.sana, status: meta.status, fayl: `sprints/hisobotlar/${f}`, xulosa };
    });
}

const sprints = readdirSync(SPRINTS_DIR)
  .filter((f) => /^sprint-\d+.*\.md$/.test(f))
  .sort()
  .map(parseSprint);

const seen = new Map();
for (const s of sprints) {
  for (const t of s.tasks) {
    if (!t.id) continue;
    if (seen.has(t.id)) errors.push(`Takroriy vazifa ID: ${t.id} (${seen.get(t.id)} va ${s.id})`);
    seen.set(t.id, s.id);
  }
}
const active = sprints.filter((s) => s.status === "jarayonda");
if (active.length > 1)
  warnings.push(`Bir vaqtda ${active.length} ta sprint "jarayonda": ${active.map((s) => s.id).join(", ")}`);

const data = {
  yangilangan: new Date().toISOString(),
  loyiha: "Lokal AI Dashboard",
  sprints,
  qarorlar: parseDecisions(),
  hisobotlar: parseReports(),
};

for (const w of warnings) console.warn(`⚠ ${w}`);
for (const e of errors) console.error(`✖ ${e}`);
if (errors.length) process.exit(1);

const total = sprints.reduce((n, s) => n + s.tasks.length, 0);
const done = sprints.reduce((n, s) => n + s.tasks.filter((t) => t.status === "bajarildi").length, 0);

if (!CHECK_ONLY) {
  writeFileSync(
    OUT,
    `// Avtomatik yaratilgan: node scripts/jarayon-sync.mjs. Qo'lda tahrirlamang.\nwindow.JARAYON = ${JSON.stringify(data, null, 2)};\n`,
  );
}
console.log(
  `${CHECK_ONLY ? "Tekshirildi" : "jarayon.data.js yangilandi"}: ${sprints.length} sprint, ${done}/${total} vazifa bajarilgan, ${data.qarorlar.length} qaror, ${data.hisobotlar.length} hisobot`,
);
