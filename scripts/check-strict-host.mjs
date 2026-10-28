// Type-checks registry pieces the way a strict host compiles them:
// strict + exactOptionalPropertyTypes + noUncheckedIndexedAccess.
// Errors under registry/ fail. Errors in this repo's components/ui primitives
// are reported but not fatal: a host installs its own copy of those.
import { spawnSync } from "node:child_process"

const run = spawnSync("pnpm", ["exec", "tsc", "-p", "tsconfig.strict-host.json", "--noEmit", "--pretty", "false"], {
  encoding: "utf8",
})
if (run.error) throw run.error

const errors = `${run.stdout}${run.stderr}`.split("\n").filter((line) => /^\S.*\(\d+,\d+\): error TS\d+/.test(line))
const registry = errors.filter((line) => line.startsWith("registry/"))
const other = errors.filter((line) => !line.startsWith("registry/"))

for (const line of other) console.log(`note (host primitive, not shipped): ${line}`)
if (run.status !== 0 && errors.length === 0) {
  console.error(run.stdout, run.stderr)
  process.exit(run.status ?? 1)
}
if (registry.length) {
  for (const line of registry) console.error(line)
  console.error(`\n${registry.length} strict-host error(s) under registry/.`)
  process.exit(1)
}
console.log("strict-host: registry/ compiles with exactOptionalPropertyTypes and noUncheckedIndexedAccess.")
