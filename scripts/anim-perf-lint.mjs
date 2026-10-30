/**
 * Local stand-in for ui-system anim_perf_lint on the files this change owns.
 * Flags transition-all, animated layout, bounce, and blur at 20px or more.
 *
 *   node scripts/anim-perf-lint.mjs registry/ui/number-roll.tsx --json
 */
import fs from "node:fs"

const files = process.argv.slice(2).filter((arg) => !arg.startsWith("--"))
const asJson = process.argv.includes("--json")

const rules = [
  {
    id: "RUI-ANIM-PERF-001",
    pattern: /transition-all|transition\s*:\s*["']all["']/,
    message: "transition-all animates every property.",
  },
  {
    id: "RUI-ANIM-PERF-002",
    pattern: /\b(?:width|height|top|left|right|bottom|margin|padding)\s*:\s*(?:"auto"|'auto'|\d)/,
    message: "layout properties are not animation targets. Use transform.",
  },
  {
    id: "RUI-ANIM-PERF-004",
    pattern: /blur\(\s*(?:2\d|[3-9]\d|\d{3,})(?:\.\d+)?px/,
    message: "blur() must stay under 20px.",
  },
  {
    id: "RUI-ANIM-BOUNCE",
    pattern: /bounce\s*:\s*(?!0(?:\s|[,}]|$))/,
    message: "easing must not bounce.",
  },
]

const findings = []
for (const file of files) {
  const source = fs.readFileSync(file, "utf8")
  const lines = source.split("\n")
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) return
    for (const rule of rules) {
      if (rule.pattern.test(line)) {
        findings.push({ file, line: index + 1, id: rule.id, message: rule.message, text: trimmed })
      }
      rule.pattern.lastIndex = 0
    }
  })
}

if (asJson) {
  console.log(JSON.stringify({ ok: findings.length === 0, findings }, null, 2))
} else if (findings.length) {
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} ${finding.id} ${finding.message}`)
  }
} else {
  console.log(`anim_perf_lint: ${files.length} file(s) ok`)
}

process.exit(findings.length ? 1 : 0)
