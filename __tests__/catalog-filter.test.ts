import { describe, expect, it } from "vitest"

import { filterCatalog, type CatalogItem } from "@/lib/catalog"

function item(partial: Partial<CatalogItem> & Pick<CatalogItem, "name" | "kind">): CatalogItem {
  return {
    type: "registry:block",
    title: partial.name,
    titleEs: partial.name,
    description: "",
    descriptionEs: "",
    categories: [],
    dependencies: [],
    registryDependencies: [],
    docs: "",
    files: [],
    examples: [],
    previewHref: "",
    api: [],
    usage: "",
    ...partial,
  }
}

const items: CatalogItem[] = [
  item({
    name: "layered-panel",
    kind: "block",
    titleEs: "Panel en capas",
    descriptionEs: "Panel de detalle que se abre a la derecha.",
    categories: ["dashboard", "overlay"],
  }),
  item({
    name: "use-clock",
    kind: "hook",
    title: "Clock",
    titleEs: "Reloj",
    descriptionEs: "Hora local del registro.",
    categories: ["time"],
  }),
  ...Array.from({ length: 58 }, (_, index) =>
    item({
      name: `widget-${index}`,
      kind: "component",
      titleEs: `Pieza ${index}`,
      descriptionEs: "Otra pieza del catálogo.",
      categories: ["misc"],
    }),
  ),
]

describe("filterCatalog", () => {
  it("returns every item when the query and filters are open", () => {
    expect(filterCatalog(items, { query: "", kind: "all", category: "all" })).toHaveLength(60)
  })

  it("matches the Spanish description", () => {
    const results = filterCatalog(items, {
      query: "derecha",
      kind: "all",
      category: "all",
    })
    expect(results.map((entry) => entry.name)).toEqual(["layered-panel"])
  })

  it("filters by type and category together", () => {
    const blocks = filterCatalog(items, { query: "", kind: "block", category: "overlay" })
    expect(blocks.map((entry) => entry.name)).toEqual(["layered-panel"])

    const hooks = filterCatalog(items, { query: "reloj", kind: "hook", category: "all" })
    expect(hooks.map((entry) => entry.name)).toEqual(["use-clock"])

    const missed = filterCatalog(items, { query: "reloj", kind: "block", category: "all" })
    expect(missed).toEqual([])
  })
})
