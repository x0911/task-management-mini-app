import { readFileSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const REPORT_DIR = ".lighthouseci";
const README_PATH = "README.md";
const START_MARKER = "<!-- LIGHTHOUSE_RESULTS_START -->";
const END_MARKER = "<!-- LIGHTHOUSE_RESULTS_END -->";
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

function loadJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return fallback;
  }
}

function loadRawLhrs() {
  if (!existsSync(REPORT_DIR)) return [];
  return readdirSync(REPORT_DIR)
    .filter((file) => /^lhr-\d+\.json$/.test(file))
    .map((file) => loadJson(path.join(REPORT_DIR, file), null))
    .filter(Boolean);
}

function scorePercent(score) {
  return score === null || score === undefined || Number.isNaN(score)
    ? "—"
    : Math.round(score * 100);
}

function shortPath(url) {
  try {
    const pathname = new URL(url).pathname;
    return pathname === "/" ? "/" : pathname.replace(/[0-9a-f-]{20,}/i, ":id");
  } catch {
    return url;
  }
}

function average(numbers) {
  const valid = numbers.filter(
    (n) => typeof n === "number" && !Number.isNaN(n),
  );
  if (!valid.length) return null;
  return valid.reduce((sum, n) => sum + n, 0) / valid.length;
}

const lhrs = loadRawLhrs();

if (lhrs.length === 0) {
  console.warn(
    "No Lighthouse run reports found in .lighthouseci/ — skipping README update.",
  );
  process.exit(0);
}

const links = loadJson(`${REPORT_DIR}/links.json`, {});

const byUrl = new Map();
for (const lhr of lhrs) {
  const key = lhr.requestedUrl || lhr.finalUrl;
  if (!key) continue;
  if (!byUrl.has(key)) byUrl.set(key, []);
  byUrl.get(key).push(lhr);
}

const rows = [...byUrl.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([url, runs]) => {
    const scores = {};
    for (const category of CATEGORIES) {
      scores[category] = average(
        runs.map((r) => r.categories?.[category]?.score),
      );
    }

    const reportUrl = links[url] || links[runs[0].finalUrl];
    const pagePath = shortPath(url);
    const linkCell = reportUrl ? `[View →](${reportUrl})` : "—";
    return `| \`${pagePath}\` | ${scorePercent(scores.performance)} | ${scorePercent(scores.accessibility)} | ${scorePercent(scores["best-practices"])} | ${scorePercent(scores.seo)} | ${linkCell} |`;
  });

const timestamp =
  new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
const commitSha = (process.env.GITHUB_SHA || "").slice(0, 7);
const runCount = lhrs.length;
const noteLine = `_Auto-updated by CI on every push to \`main\`. Last run: ${timestamp}${commitSha ? ` (commit \`${commitSha}\`)` : ""}, averaged across ${runCount} Lighthouse runs. Report links are temporary and expire after about 7 days — the numbers below are the permanent record._`;

const tableLines = [
  "| Page | Performance | Accessibility | Best Practices | SEO | Report |",
  "|---|---|---|---|---|---|",
  ...rows,
];

const summaryMarkdown = [
  "### Latest Lighthouse scores",
  "",
  noteLine,
  "",
  ...tableLines,
].join("\n");
console.log(summaryMarkdown);

const readmeBlock = [
  START_MARKER,
  "### Latest Lighthouse scores",
  "",
  noteLine,
  "",
  ...tableLines,
  "",
  END_MARKER,
].join("\n");

const readme = readFileSync(README_PATH, "utf-8");
const pattern = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`);

if (!pattern.test(readme)) {
  console.warn(
    `Markers not found in ${README_PATH} — skipping README update (summary above still printed).`,
  );
  process.exit(0);
}

writeFileSync(README_PATH, readme.replace(pattern, readmeBlock));
console.error("README.md Lighthouse section updated.");
