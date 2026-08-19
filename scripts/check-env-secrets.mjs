/**
 * Guard against browser-exposed secrets.
 *
 * Fails (exit 1) if any `VITE_*` variable whose name looks secret-bearing
 * (PASSWORD / SECRET / TOKEN / API_KEY / PRIVATE / CREDENTIAL) is:
 *   - declared in a committed env file (.env*, excluding .env.local), or
 *   - read in source via `import.meta.env.VITE_*` / `process.env.VITE_*`.
 *
 * This prevents the original SEC-001 regression: a server secret shipped to
 * the client bundle through a VITE_ prefix.
 *
 * Usage: node scripts/check-env-secrets.mjs
 */
import { readdirSync, readFileSync } from 'node:fs'
import { resolve, join, basename } from 'node:path'

const ROOT = process.cwd()
const GUARD = resolve('scripts/check-env-secrets.mjs')

const SECRET_KEYWORDS = /(PASSWORD|SECRET|TOKEN|API_?KEY|PRIVATE|CREDENTIAL)/i
const ENV_LINE = /^[ \t]*(?:export[ \t]+)?(VITE_[A-Za-z0-9_]*)[ \t]*=/
const SOURCE_USE = /(?:import\.meta\.env|process\.env)\.(VITE_[A-Za-z0-9_]*)/g

const SCAN_DIRS = ['src', 'api', 'scripts']
const SRC_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json'])

const violations = []

function checkEnvFile(file) {
  const name = basename(file)
  if (name === '.env.local') return
  const text = readFileSync(file, 'utf-8')
  text.split('\n').forEach((line, i) => {
    const m = line.match(ENV_LINE)
    if (!m) return
    const varName = m[1]
    if (SECRET_KEYWORDS.test(varName)) {
      violations.push(`${file}:${i + 1}  secret-bearing VITE_ var "${varName}"`)
    }
  })
}

function walk(dir) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'dist' || e.name.startsWith('.')) continue
      walk(full)
    } else if (e.isFile()) {
      if (resolve(full) === GUARD) continue
      const ext = e.name.slice(e.name.lastIndexOf('.'))
      if (!SRC_EXT.has(ext)) continue
      const text = readFileSync(full, 'utf-8')
      let m
      SOURCE_USE.lastIndex = 0
      while ((m = SOURCE_USE.exec(text)) !== null) {
        if (SECRET_KEYWORDS.test(m[1])) {
          violations.push(`${full}  reads secret-bearing VITE_ var "${m[1]}"`)
        }
      }
    }
  }
}

// Committed env files in repo root (everything matching .env* except .env.local)
for (const e of readdirSync(ROOT)) {
  if (/^\.env/.test(e) && e !== '.env.local') checkEnvFile(resolve(ROOT, e))
}
for (const d of SCAN_DIRS) walk(resolve(ROOT, d))

if (violations.length) {
  console.error('❌ VITE_ secret guard failed:')
  for (const v of violations) console.error('  - ' + v)
  console.error('\nSecret-bearing VITE_* variables must not exist (they are shipped to the browser).')
  process.exit(1)
}

console.log('✅ No browser-exposed (VITE_) secrets found.')
