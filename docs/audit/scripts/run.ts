import fs from "node:fs"
import path from "node:path"

import { analyze, verdictOf } from "./analyze.ts"
import { renderReport } from "./report.ts"

const rebuild = !process.argv.includes("--no-rebuild")
const data = analyze({ rebuild })
const outDir = path.resolve(import.meta.dirname, "../output")
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, "audit.json"), JSON.stringify(data, null, 2))
fs.writeFileSync(path.resolve(import.meta.dirname, "../2026-10-06-ui-system.md"), renderReport(data))

const byRule: Record<string, number> = {}
for (const finding of data.findings) byRule[finding.ruleId] = (byRule[finding.ruleId] ?? 0) + 1
console.log(JSON.stringify({
  verdict: verdictOf(data),
  counts: data.counts,
  byRule,
  rebuild: data.payload.rebuild,
  validatorErrors: data.validatorErrors.length,
  readme: data.readme,
  coverage: {
    withTest: data.coverage.withTest,
    withoutTest: data.coverage.withoutTest.length,
    withStress: data.coverage.withStress,
    withoutStress: data.coverage.withoutStress.length,
    withPreview: data.coverage.withPreview,
    withExamplePage: data.coverage.withExamplePage,
  },
  openPrs: data.openPrs,
}, null, 2))
