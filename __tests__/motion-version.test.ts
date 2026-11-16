import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

// Motion 14.2 combina x, y, scale y el resto de transforms independientes en una
// sola animación de transform acelerada (WAAPI). Antes de 14.2 esos atajos corrían
// en el hilo principal. Fuente: CHANGELOG de motiondivision/motion 14.2.0 y
// emilkowalski/skills@0f2e23b, skills/animation-performance (MIT).
const MIN: [number, number] = [14, 2]

function majorMinor(version: string): [number, number] {
  const match = version.match(/(\d+)\.(\d+)/)
  if (!match) throw new Error(`versión ilegible: ${version}`)
  return [Number(match[1]), Number(match[2])]
}

function atLeast([major, minor]: [number, number], [minMajor, minMinor]: [number, number]) {
  return major > minMajor || (major === minMajor && minor >= minMinor)
}

const root = path.resolve(__dirname, "..")
const readJson = (file: string) => JSON.parse(readFileSync(path.join(root, file), "utf8"))

describe("motion acelera x/y/scale", () => {
  it("package.json pide motion 14.2 o superior", () => {
    const range: string = readJson("package.json").dependencies.motion
    expect(atLeast(majorMinor(range), MIN)).toBe(true)
  })

  it("la versión instalada es 14.2 o superior", () => {
    const installed: string = readJson("node_modules/motion/package.json").version
    expect(atLeast(majorMinor(installed), MIN)).toBe(true)
  })
})
