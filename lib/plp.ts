/**
 * Preview Listo para Presentar.
 * Opt-in: a registry item joins PLP by setting `meta.scenes`.
 * Pieces that omit it keep the previous preview and demo.
 */

export const PLP_REQUIRED_SCENES = ["filled", "empty", "loading", "error"] as const

export type PlpSceneInput = string | { id?: string; label?: string; labelEn?: string }

export type PlpScene = {
  id: string
  label: string
  labelEn: string
}

const KNOWN_SCENES: Record<string, { label: string; labelEn: string }> = {
  filled: { label: "Lleno", labelEn: "Filled" },
  empty: { label: "Vacío", labelEn: "Empty" },
  loading: { label: "Cargando", labelEn: "Loading" },
  error: { label: "Error", labelEn: "Error" },
}

export function plpSceneId(scene: PlpSceneInput) {
  if (typeof scene === "string") return scene
  return scene.id?.trim() ?? ""
}

export function normalizePlpScenes(value: unknown): PlpScene[] {
  if (!Array.isArray(value)) return []
  const scenes: PlpScene[] = []
  for (const entry of value) {
    if (typeof entry !== "string" && (!entry || typeof entry !== "object")) continue
    const id = plpSceneId(entry as PlpSceneInput)
    if (!id) continue
    const known = KNOWN_SCENES[id]
    const record = typeof entry === "string" ? undefined : entry
    const label = record && "label" in record && typeof record.label === "string" && record.label.trim() ? record.label : (known?.label ?? id)
    const labelEn =
      record && "labelEn" in record && typeof record.labelEn === "string" && record.labelEn.trim()
        ? record.labelEn
        : (known?.labelEn ?? label)
    scenes.push({ id, label, labelEn })
  }
  return scenes
}

export type PlpExample = {
  title: string
  href: string
  description?: string
}

/** Scene links for the item page. The live route is the same demo with `?scene=`. */
export function plpSceneExamples(name: string, scenes: readonly PlpScene[]): PlpExample[] {
  return scenes.map((scene) => ({
    title: scene.label,
    href: `/examples/${name}?scene=${encodeURIComponent(scene.id)}`,
    description: scene.labelEn,
  }))
}

export function mergePlpExamples<T extends { href?: string }>(existing: readonly T[], extras: readonly T[]): T[] {
  const seen = new Set(existing.map((example) => example.href))
  return [...existing, ...extras.filter((example) => example.href && !seen.has(example.href))]
}

/** Names exported from a fixture module. Covers `export const` and `export { filled }`. */
export function exportedBindings(source: string) {
  const names = new Set<string>()
  for (const match of source.matchAll(/export\s+(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(match[1]!)
  }
  for (const match of source.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of match[1]!.split(",")) {
      const piece = part.trim()
      if (!piece || piece.startsWith("type ")) continue
      const alias = piece.split(/\s+as\s+/)
      const name = (alias[1] ?? alias[0] ?? "").replace(/^type\s+/, "").trim()
      if (/^[A-Za-z_$][\w$]*$/.test(name)) names.add(name)
    }
  }
  return names
}
