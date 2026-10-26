import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import {
  validateRegistry,
  validateRegistryTree,
  type RegistryItemInput,
} from "../scripts/validate-registry"

function passingItem(): RegistryItemInput {
  return {
    name: "widget",
    type: "registry:ui",
    description: "A small widget.",
    categories: ["form"],
    files: [{ path: "registry/ui/widget.tsx" }],
    meta: {
      titleEs: "Widget",
      descriptionEs: "Un widget pequeño.",
      preview: "app/examples/widget/preview.tsx",
      previewHref: "/examples/widget",
      usage: "<Widget />",
      api: [{ name: "label", type: "string", description: "Visible label." }],
    },
  }
}

function input(
  item: RegistryItemInput,
  source = "export const Widget = () => null\n",
  extra: Record<string, string> = {},
) {
  const files: Record<string, string> = {
    "registry/ui/widget.tsx": source,
    "app/examples/widget/preview.tsx": "export default () => null\n",
    ...extra,
  }
  return validateRegistry({
    registry: { name: "retana", items: [item] },
    files: { "registry/ui/widget.tsx": source },
    existingPaths: ["app/examples/widget/page.tsx", ...Object.keys(files)],
    readFile: (filePath) => files[filePath] ?? null,
  })
}

describe("validateRegistry", () => {
  it("accepts an item with a Spanish description and a preview", () => {
    expect(input(passingItem())).toEqual([])
  })

  it("fails when the Spanish description or the preview is missing", () => {
    const noDescription = passingItem()
    noDescription.meta = { ...noDescription.meta, descriptionEs: " " }
    expect(input(noDescription).join("\n")).toMatch(/descriptionEs/)

    const missingPreview = passingItem()
    missingPreview.meta = { ...missingPreview.meta, preview: "app/examples/widget/missing.tsx" }
    expect(input(missingPreview).join("\n")).toMatch(/does not exist/)
  })

  it("fails when an item ships cssVars or hard-coded colors", () => {
    const withVars = passingItem()
    withVars.cssVars = { light: { background: "white" } }
    expect(input(withVars).join("\n")).toMatch(/cssVars/)

    expect(input(passingItem(), "export const x = 'bg-blue-500'\n").join("\n")).toMatch(/palette/)
    expect(input(passingItem(), "const color = '#fff'\n").join("\n")).toMatch(/hex/)
    expect(input(passingItem(), "background: oklch(1 0 0)\n").join("\n")).toMatch(/color function/)
    expect(input(passingItem(), "background: color-mix(in oklch, red 18%, white)\n").join("\n")).toMatch(/color function/)
    expect(input(passingItem(), "background: color-mix(in oklch, var(--chart-1) 18%, var(--background))\n")).toEqual([])
  })

  it("requires fixtures, ScenePreview, and a distinct demo only when meta.scenes is set", () => {
    const item = passingItem()
    item.meta = {
      ...item.meta,
      scenes: ["filled", "empty", "loading"],
    }
    const preview = 'export default () => <ScenePreview scenes={scenes} hero="filled" />\n'
    const demo = "export const Demo = () => <SceneDeck scenes={scenes} />\n"
    const fixtures = "export const filled = {}\nexport const empty = {}\nexport const loading = {}\n"
    const scenes = "export const scenes = []\n"
    const missing = input(item, "export const Widget = () => null\n", {
      "app/examples/widget/preview.tsx": preview,
      "app/examples/widget/demo.tsx": demo,
      "app/examples/widget/fixtures.ts": fixtures,
      "app/examples/widget/scenes.tsx": scenes,
    })
    expect(missing.join("\n")).toMatch(/missing "error"/)
    expect(missing.join("\n")).toMatch(/must export error/)

    item.meta = {
      ...item.meta,
      scenes: [
        { id: "filled", label: "Lleno" },
        { id: "empty", label: "Vacío" },
        { id: "loading", label: "Cargando" },
        { id: "error", label: "Error" },
      ],
    }
    expect(
      input(item, "export const Widget = () => null\n", {
        "app/examples/widget/preview.tsx": preview,
        "app/examples/widget/demo.tsx": demo,
        "app/examples/widget/fixtures.ts": `${fixtures}export const error = {}\n`,
        "app/examples/widget/scenes.tsx": scenes,
      }),
    ).toEqual([])

    expect(
      input(item, "export const Widget = () => null\n", {
        "app/examples/widget/preview.tsx": preview,
        "app/examples/widget/demo.tsx": preview,
        "app/examples/widget/fixtures.ts": `${fixtures}export { error }\nconst error = {}\n`,
        "app/examples/widget/scenes.tsx": scenes,
      }).join("\n"),
    ).toMatch(/identical/)
  })

  it("accepts the repository registry", () => {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
    const errors = validateRegistryTree(root)
    expect(errors).toEqual([])
  })
})
