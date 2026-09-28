import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import {
  installedModuleId,
  rewriteRegistryImports,
  scanPayloadDocument,
  unresolvableImports,
} from "../scripts/installed-imports"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

describe("rewriteRegistryImports", () => {
  it("maps catalog aliases onto the directories shadcn installs", () => {
    const source = [
      'import { downloadCsv } from "@/registry/retana/lib/csv"',
      'import { EmptyState } from "@/registry/retana/ui/entity-form"',
      'import { useDateRange } from "@/registry/retana/hooks/use-date-range"',
      'import { AdminKit } from "@/registry/retana/blocks/admin-kit"',
    ].join("\n")

    expect(rewriteRegistryImports(source)).toBe(
      [
        'import { downloadCsv } from "@/lib/csv"',
        'import { EmptyState } from "@/components/ui/entity-form"',
        'import { useDateRange } from "@/hooks/use-date-range"',
        'import { AdminKit } from "@/components/ui/admin-kit"',
      ].join("\n"),
    )
  })
})

describe("unresolvableImports", () => {
  it("accepts host primitives, bundled files, and a sibling relative import", () => {
    const errors = unresolvableImports({
      name: "data-table",
      registryDependencies: ["button"],
      files: [
        {
          path: "registry/ui/data-table.tsx",
          target: "@ui/data-table.tsx",
          content: [
            'import { Button } from "@/components/ui/button"',
            'import { cn } from "@/lib/utils"',
            'import { downloadCsv } from "@/lib/csv"',
            'import { EmptyState } from "@/components/ui/entity-form"',
          ].join("\n"),
        },
        {
          path: "registry/lib/csv.ts",
          target: "@lib/csv.ts",
          content: "export const downloadCsv = () => {}",
        },
        {
          path: "registry/ui/entity-form.tsx",
          target: "@ui/entity-form.tsx",
          content: "export const EmptyState = () => null",
        },
        {
          path: "registry/lib/supabase-admin.ts",
          target: "@lib/supabase-admin.ts",
          content: 'import type { MediaAsset } from "./admin-types"',
        },
        {
          path: "registry/lib/admin-types.ts",
          target: "@lib/admin-types.ts",
          content: "export type MediaAsset = { id: string }",
        },
      ],
    })
    expect(errors).toEqual([])
  })

  it("rejects catalog aliases and imports that miss the installed files", () => {
    const errors = unresolvableImports({
      name: "data-table",
      registryDependencies: ["button"],
      files: [
        {
          path: "registry/ui/data-table.tsx",
          target: "@ui/data-table.tsx",
          content: [
            'import { downloadCsv } from "@/registry/retana/lib/csv"',
            'import { gone } from "@/lib/missing"',
            'import { nested } from "@/lib/utils/missing"',
            'import { x } from "./nope"',
          ].join("\n"),
        },
      ],
    })
    expect(errors.join("\n")).toMatch(/registry\/retana/)
    expect(errors.join("\n")).toMatch(/@\/lib\/missing/)
    expect(errors.join("\n")).toMatch(/@\/lib\/utils\/missing/)
    expect(errors.join("\n")).toMatch(/\.\/nope/)
  })
})

describe("built registry payloads", () => {
  it("ships no registry/retana import and no specifier a host cannot resolve", () => {
    const dir = path.join(root, "public", "r")
    const failures: string[] = []
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".json")) continue
      const text = fs.readFileSync(path.join(dir, name), "utf8")
      if (text.includes("registry/retana")) failures.push(`${name} contains registry/retana`)
      const json = JSON.parse(text) as unknown
      for (const error of scanPayloadDocument(json)) failures.push(`${name}: ${error}`)
    }
    expect(failures).toEqual([])
  })
})

describe("installedModuleId", () => {
  it("follows the @ui, @lib, and @hooks targets shadcn writes", () => {
    expect(installedModuleId("@ui/data-table.tsx")).toBe("@/components/ui/data-table")
    expect(installedModuleId("@lib/csv.ts")).toBe("@/lib/csv")
    expect(installedModuleId("@hooks/use-date-range.ts")).toBe("@/hooks/use-date-range")
  })
})
