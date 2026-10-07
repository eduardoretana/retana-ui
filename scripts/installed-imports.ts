/**
 * Catalog source imports other registry files as `@/registry/retana/<kind>/...`
 * so this repo's path aliases resolve. `shadcn build` copies those specifiers
 * into `public/r/*.json` unchanged. A host install writes the files to
 * `@/lib`, `@/components/ui`, and `@/hooks`, where `registry/retana` does not
 * exist. Rewrite the published payloads to those install targets.
 */

const INSTALL_PREFIXES: { from: string; to: string }[] = [
  { from: "@/registry/retana/ui/", to: "@/components/ui/" },
  { from: "@/registry/retana/hooks/", to: "@/hooks/" },
  { from: "@/registry/retana/lib/", to: "@/lib/" },
  { from: "@/registry/retana/blocks/", to: "@/components/ui/" },
]

const SPECIFIER =
  /(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g

const CODE_FILE = /\.(tsx|ts|jsx|js)$/

export function rewriteRegistryImports(source: string) {
  let next = source
  for (const { from, to } of INSTALL_PREFIXES) next = next.replaceAll(from, to)
  return next
}

type PayloadFile = {
  path?: string
  target?: string
  content?: string
}

type PayloadItem = {
  name?: string
  registryDependencies?: string[]
  files?: PayloadFile[]
}

function asItem(value: unknown): PayloadItem | null {
  if (!value || typeof value !== "object") return null
  return value as PayloadItem
}

function itemsOf(json: unknown): PayloadItem[] {
  const root = asItem(json)
  if (!root) return []
  const nested = (json as { items?: unknown }).items
  if (Array.isArray(nested)) {
    return nested.map(asItem).filter((item): item is PayloadItem => item != null)
  }
  if (Array.isArray(root.files)) return [root]
  return []
}

/** Installed module id, without an extension. `@lib/csv.ts` → `@/lib/csv`. */
export function installedModuleId(target: string): string | null {
  const bare = target.replace(/\.(tsx|ts|jsx|js)$/, "")
  if (bare.startsWith("@ui/")) return `@/components/ui/${bare.slice("@ui/".length)}`
  if (bare.startsWith("@lib/")) return `@/lib/${bare.slice("@lib/".length)}`
  if (bare.startsWith("@hooks/")) return `@/hooks/${bare.slice("@hooks/".length)}`
  if (bare.startsWith("@components/")) return `@/components/${bare.slice("@components/".length)}`
  return null
}

function resolveRelative(fromModule: string, specifier: string) {
  const dir = fromModule.split("/").slice(0, -1)
  const parts = [...dir]
  for (const part of specifier.split("/")) {
    if (part === "." || part === "") continue
    if (part === "..") parts.pop()
    else parts.push(part)
  }
  return parts.join("/").replace(/\.(tsx|ts|jsx|js)$/, "")
}

function providesModule(dependencies: Set<string>, name: string) {
  if (dependencies.has(name)) return true
  return dependencies.has(`@retana/${name}`)
}

function hostCanResolve(specifier: string, dependencies: Set<string>, modules: Set<string>) {
  if (modules.has(specifier)) return true
  if (specifier === "@/lib/utils") return true
  if (specifier.startsWith("@/components/ui/")) {
    const name = specifier.slice("@/components/ui/".length)
    return !name.includes("/") && providesModule(dependencies, name)
  }
  if (specifier.startsWith("@/hooks/")) {
    const name = specifier.slice("@/hooks/".length)
    return !name.includes("/") && providesModule(dependencies, name)
  }
  if (specifier.startsWith("@/components/")) {
    const name = specifier.slice("@/components/".length)
    return !name.includes("/") && providesModule(dependencies, name)
  }
  return false
}

export function unresolvableImports(item: PayloadItem): string[] {
  const label = item.name || "(unnamed item)"
  const dependencies = new Set(item.registryDependencies ?? [])
  const files = item.files ?? []
  const modules = new Set<string>()
  for (const file of files) {
    if (!file.target) continue
    const id = installedModuleId(file.target)
    if (id) modules.add(id)
  }

  const errors: string[] = []
  for (const file of files) {
    if (typeof file.content !== "string") continue
    if (file.content.includes("registry/retana") || file.content.includes("@/registry/")) {
      errors.push(`${label} (${file.target ?? file.path ?? "file"}) still contains a registry/retana import.`)
    }
    const where = file.path ?? file.target ?? "file"
    if (!CODE_FILE.test(where) && !(file.target && CODE_FILE.test(file.target))) continue
    const fromModule = file.target ? installedModuleId(file.target) : null
    for (const match of file.content.matchAll(SPECIFIER)) {
      const specifier = match[1]
      if (!specifier) continue
      if (specifier.startsWith(".")) {
        if (!fromModule) continue
        const resolved = resolveRelative(fromModule, specifier)
        if (!modules.has(resolved)) {
          errors.push(`${label} ${where} imports "${specifier}", which does not match an installed file in this item.`)
        }
        continue
      }
      if (!specifier.startsWith("@/")) continue
      if (hostCanResolve(specifier, dependencies, modules)) continue
      errors.push(`${label} ${where} imports "${specifier}", which a host install cannot resolve.`)
    }
  }
  return errors
}

export function scanPayloadDocument(json: unknown): string[] {
  return itemsOf(json).flatMap(unresolvableImports)
}
