import registry from "@/registry.json"

import {
  projectRegistry,
  type RegistryRecord,
} from "./catalog-core.ts"

export type {
  CatalogApiRow,
  CatalogExample,
  CatalogFile,
  CatalogFilters,
  CatalogItem,
  CatalogKind,
} from "./catalog-core.ts"

export { catalogCategories, catalogKind, filterCatalog, projectRegistry } from "./catalog-core.ts"

export function getCatalog() {
  return projectRegistry((registry.items ?? []) as RegistryRecord[])
}

export function getCatalogItem(name: string) {
  return getCatalog().find((item) => item.name === name) ?? null
}
