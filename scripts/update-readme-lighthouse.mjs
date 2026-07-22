import { readFileSync, existsSync, writeFileSync } from 'node:fs'

const REPORT_DIR = '.lighthouseci'
const README_PATH = 'README.md'
const START_MARKER = '<!-- LIGHTHOUSE_RESULTS_START -->'
const END_MARKER = '<!-- LIGHTHOUSE_RESULTS_END -->'

function loadJson(path, fallback) {
  if (!existsSync(path)) return fallback
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return fallback
  }
}

function scorePercent(score) {
  return score === null || score === undefined ? '—' : Math.round(score * 100)
}

function shortPath(url) {
  try {
    const path = new URL(url).pathname
    return path === '/' ? '/' : path.replace(/[0-9a-f-]{20,}/i, ':id')
  } catch {
    return url
  }
}

const manifest = loadJson(`${REPORT_DIR}/manifest.json`, [])
const links = loadJson(`${REPORT_DIR}/links.json`, {})

const representative = manifest.filter((entry) => entry.isRepresentativeRun)

if (representative.length === 0) {
  console.warn('No representative Lighthouse runs found — skipping README update.')
  process.exit(0)
}

const rows = representative
  .sort((a, b) => a.url.localeCompare(b.url))
  .map((entry) => {
    const s = entry.summary ?? {}
    const reportUrl = links[entry.url]
    const pagePath = shortPath(entry.url)
    const linkCell = reportUrl ? `[View →](${reportUrl})` : '—'
    return `| \`${pagePath}\` | ${scorePercent(s.performance)} | ${scorePercent(s.accessibility)} | ${scorePercent(s['best-practices'])} | ${scorePercent(s.seo)} | ${linkCell} |`
  })

const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
const commitSha = (process.env.GITHUB_SHA || '').slice(0, 7)
const noteLine = `_Auto-updated by CI on every push to \`main\`. Last run: ${timestamp}${commitSha ? ` (commit \`${commitSha}\`)` : ''}. Report links are temporary and expire after about 7 days — the numbers below are the permanent record._`

const tableLines = [
  '| Page | Performance | Accessibility | Best Practices | SEO | Report |',
  '|---|---|---|---|---|---|',
  ...rows
]

const summaryMarkdown = ['### Latest Lighthouse scores', '', noteLine, '', ...tableLines].join('\n')
console.log(summaryMarkdown)

const readmeBlock = [START_MARKER, '### Latest Lighthouse scores', '', noteLine, '', ...tableLines, '', END_MARKER].join(
  '\n'
)

const readme = readFileSync(README_PATH, 'utf-8')
const pattern = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`)

if (!pattern.test(readme)) {
  console.warn(`Markers not found in ${README_PATH} — skipping README update (summary above still printed).`)
  process.exit(0)
}

writeFileSync(README_PATH, readme.replace(pattern, readmeBlock))
console.error('README.md Lighthouse section updated.')
