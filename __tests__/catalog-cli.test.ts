import { spawnSync } from "node:child_process"
import crypto from "node:crypto"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { filterCatalog, getCatalog } from "@/lib/catalog"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const script = path.join(root, "scripts", "catalog.ts")

type Envelope = {
  schema?: string
  ok?: boolean
  code?: string
  sha?: string | null
  command?: string
  message?: string
  suggestions?: string[]
  data?: {
    name?: string
    usage?: string
    api?: unknown[]
    query?: string
    results?: { name?: string }[]
    checks?: { id?: string; status?: string }[]
    summary?: { fail?: number }
  } | null
}

function run(args: string[], cwd = root) {
  return spawnSync(process.execPath, ["--experimental-strip-types", script, ...args], {
    cwd,
    encoding: "utf8",
  })
}

function envelope(args: string[], cwd = root) {
  const result = run(args, cwd)
  let body: Envelope | null = null
  try {
    body = JSON.parse(result.stdout) as Envelope
  } catch {
    body = null
  }
  return { result, body }
}

function treeDigest(dir: string) {
  const files: string[] = []
  const walk = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const abs = path.join(current, entry.name)
      if (entry.isDirectory()) walk(abs)
      else if (entry.isFile()) files.push(path.relative(dir, abs))
    }
  }
  walk(dir)
  files.sort()
  const hash = crypto.createHash("sha256")
  for (const file of files) {
    hash.update(file)
    hash.update("\0")
    hash.update(fs.readFileSync(path.join(dir, file)))
    hash.update("\0")
  }
  return `${files.join("\n")}\n${hash.digest("hex")}`
}

describe("catalog cli", () => {
  it("prints the retana.catalog/v1 envelope for a known piece", () => {
    const { result, body } = envelope(["get", "layered-panel", "--json"])
    expect(result.status).toBe(0)
    expect(body).toMatchObject({
      schema: "retana.catalog/v1",
      ok: true,
      code: "OK",
      command: "get",
    })
    expect(body?.data?.name).toBe("layered-panel")
    expect(body?.data?.usage?.length).toBeGreaterThan(0)
    expect(body?.data?.api?.length).toBeGreaterThan(0)
    expect(body?.sha === null || /^[0-9a-f]{40}$/.test(body?.sha ?? "")).toBe(true)
  })

  it("exits 2 when the piece is not in the registry", () => {
    const { result, body } = envelope(["get", "no-existe", "--json"])
    expect(result.status).toBe(2)
    expect(body).toMatchObject({
      schema: "retana.catalog/v1",
      ok: false,
      code: "ERR_UNKNOWN_ITEM",
      command: "get",
      data: null,
    })
  })

  it("exits 0 with an empty result list when nothing matches", () => {
    const query = "zzz-no-catalog-match"
    const expected = filterCatalog(getCatalog(), {
      query,
      kind: "all",
      category: "all",
    }).map((item) => item.name)
    const { result, body } = envelope(["search", query, "--json"])
    expect(expected).toEqual([])
    expect(result.status).toBe(0)
    expect(body).toMatchObject({
      schema: "retana.catalog/v1",
      ok: true,
      code: "OK",
      command: "search",
    })
    expect(body?.data?.results?.map((item) => item.name)).toEqual([])
  })

  it("searches with the same names as filterCatalog", () => {
    const query = "layered-panel"
    const expected = filterCatalog(getCatalog(), {
      query,
      kind: "all",
      category: "all",
    }).map((item) => item.name)
    const { result, body } = envelope(["search", query, "--json"])
    expect(result.status).toBe(0)
    expect(body?.data?.results?.map((item) => item.name)).toEqual(expected)
  })

  it("exits 1 for a broken registry and writes nothing", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "retana-catalog-"))
    const registry = {
      name: "retana",
      items: [
        {
          name: "broken-widget",
          type: "registry:ui",
          description: "Broken on purpose.",
          categories: ["form"],
          cssVars: { light: { background: "white" } },
          files: [{ path: "registry/ui/broken-widget.tsx" }],
          meta: {
            titleEs: "Roto",
            descriptionEs: "Roto a propósito.",
            preview: "app/examples/broken-widget/preview.tsx",
            previewHref: "/examples/broken-widget",
            usage: "<Broken />",
            api: [{ name: "label", type: "string", description: "Label." }],
          },
        },
      ],
    }
    fs.writeFileSync(path.join(dir, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`)
    const before = treeDigest(dir)
    const { result, body } = envelope(["doctor", "--json"], dir)
    expect(result.status).toBe(1)
    expect(body).toMatchObject({
      schema: "retana.catalog/v1",
      ok: false,
      code: "ERR_DOCTOR_FAIL",
      command: "doctor",
    })
    expect(body?.data?.summary?.fail).toBeGreaterThan(0)
    expect(treeDigest(dir)).toBe(before)
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it("exits 0 when doctor reads this repository", () => {
    const { result, body } = envelope(["doctor", "--json"])
    expect(result.status).toBe(0)
    expect(body).toMatchObject({
      schema: "retana.catalog/v1",
      ok: true,
      code: "OK",
      command: "doctor",
    })
    expect(body?.data?.summary?.fail).toBe(0)
  })

  it("does not reach the network from the catalog script", () => {
    const source = fs.readFileSync(script, "utf8")
    for (const marker of ["fetch(", "node:http", "node:https", "registry.npmjs", "child_process", "npm view"]) {
      expect(source).not.toContain(marker)
    }
  })
})
