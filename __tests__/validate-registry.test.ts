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

function input(item: RegistryItemInput, source = "export const Widget = () => null\n") {
  return validateRegistry({
    registry: { name: "retana", items: [item] },
    files: { "registry/ui/widget.tsx": source },
    existingPaths: [
      "registry/ui/widget.tsx",
      "app/examples/widget/preview.tsx",
      "app/examples/widget/page.tsx",
    ],
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
  })

  it("accepts the repository registry", () => {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
    const errors = validateRegistryTree(root)
    expect(errors).toEqual([])
  })
})
