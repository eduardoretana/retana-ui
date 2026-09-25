import registry from "@/registry.json"

export type CatalogKind = "component" | "block" | "hook" | "lib"

export type CatalogApiRow = {
  name: string
  type: string
  description: string
}

export type CatalogExample = {
  title: string
  href: string
  description?: string
}

export type CatalogFile = {
  path: string
  type?: string
  target?: string
}

export type CatalogItem = {
  name: string
  type: string
  kind: CatalogKind
  title: string
  titleEs: string
  description: string
  descriptionEs: string
  categories: string[]
  dependencies: string[]
  registryDependencies: string[]
  docs: string
  files: CatalogFile[]
  examples: CatalogExample[]
  previewHref: string
  api: CatalogApiRow[]
  usage: string
}

export type CatalogFilters = {
  query: string
  kind: "all" | CatalogKind
  category: string
}

type RegistryMeta = {
  titleEs?: string
  descriptionEs?: string
  preview?: string
  previewHref?: string
  examples?: CatalogExample[]
  api?: CatalogApiRow[]
  usage?: string
}

type RegistryItem = {
  name: string
  type: string
  title?: string
  description?: string
  categories?: string[]
  dependencies?: string[]
  registryDependencies?: string[]
  docs?: string
  files?: CatalogFile[]
  meta?: RegistryMeta
}

const KIND_FROM_TYPE: Record<string, CatalogKind> = {
  "registry:block": "block",
  "registry:hook": "hook",
  "registry:lib": "lib",
  "registry:ui": "component",
  "registry:component": "component",
}

export function catalogKind(type: string): CatalogKind {
  return KIND_FROM_TYPE[type] ?? "component"
}

export function filterCatalog(items: CatalogItem[], filters: CatalogFilters) {
  const query = filters.query.trim().toLowerCase()
  return items.filter((item) => {
    if (filters.kind !== "all" && item.kind !== filters.kind) return false
    if (filters.category !== "all" && !item.categories.includes(filters.category)) {
      return false
    }
    if (!query) return true
    const haystack = [
      item.name,
      item.title,
      item.titleEs,
      item.description,
      item.descriptionEs,
      item.kind,
      ...item.categories,
    ]
      .join(" ")
      .toLowerCase()
    return haystack.includes(query)
  })
}

export function catalogCategories(items: CatalogItem[]) {
  return [...new Set(items.flatMap((item) => item.categories))].sort((a, b) =>
    a.localeCompare(b),
  )
}

function asItem(raw: RegistryItem): CatalogItem {
  const meta = raw.meta ?? {}
  return {
    name: raw.name,
    type: raw.type,
    kind: catalogKind(raw.type),
    title: raw.title ?? raw.name,
    titleEs: meta.titleEs ?? raw.title ?? raw.name,
    description: raw.description ?? "",
    descriptionEs: meta.descriptionEs ?? "",
    categories: raw.categories ?? [],
    dependencies: raw.dependencies ?? [],
    registryDependencies: raw.registryDependencies ?? [],
    docs: raw.docs ?? "",
    files: raw.files ?? [],
    examples: meta.examples ?? [],
    previewHref: meta.previewHref ?? "",
    api: meta.api ?? [],
    usage: meta.usage ?? "",
  }
}

export function getCatalog(): CatalogItem[] {
  return (registry.items as RegistryItem[]).map(asItem)
}

export function getCatalogItem(name: string) {
  return getCatalog().find((item) => item.name === name) ?? null
}
