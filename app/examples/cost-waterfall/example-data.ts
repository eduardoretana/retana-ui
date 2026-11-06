import type { SceneLocale } from "@/app/catalog/scene-types"
import { costWaterfallLabelsEn, costWaterfallLabelsEs, type CostWaterfallLabels } from "@/registry/ui/cost-waterfall"
import { createRun, reduceRunEvents, type MoneyFormat, type PricingTable, type Run, type RunEvent, type RunStep } from "@/registry/lib/cost-waterfall"

/** Illustrative prices. Not a vendor price card. */
export const examplePricing: PricingTable = {
  currency: "USD",
  models: {
    "ejemplo-rapido": { input: BigInt(150_000), output: BigInt(600_000), cacheRead: BigInt(15_000), cacheWrite: BigInt(187_500) },
    "ejemplo-amplio": { input: BigInt(3_000_000), output: BigInt(15_000_000), cacheRead: BigInt(300_000), cacheWrite: BigInt(3_750_000) },
  },
}

export const exampleMxn: MoneyFormat = { locale: "es-MX", currency: "MXN", fx: { numerator: BigInt(1725), denominator: BigInt(100) } }

type Copy = { name: string; input?: string; output?: string; error?: string }
type Seed = {
  id: string
  parentId?: string
  kind: string
  model?: string
  destination?: string
  tokensIn?: number
  tokensOut?: number
  cacheRead?: number
  cacheWrite?: number
  costMicro?: bigint
  latencyMs?: number
  status?: RunStep["status"]
  es: Copy
  en: Copy
}

function fromSeeds(id: string, title: { es: string; en: string }, seeds: readonly Seed[], locale: SceneLocale): Run {
  const steps = seeds.map((seed) => {
    const copy = seed[locale]
    const step: RunStep = {
      id: seed.id,
      name: copy.name,
      kind: seed.kind,
      tokensIn: seed.tokensIn ?? 0,
      tokensOut: seed.tokensOut ?? 0,
      cacheRead: seed.cacheRead ?? 0,
      cacheWrite: seed.cacheWrite ?? 0,
      status: seed.status ?? "success",
    }
    if (seed.parentId) step.parentId = seed.parentId
    if (seed.model) step.model = seed.model
    if (seed.destination) step.destination = seed.destination
    if (seed.costMicro !== undefined) step.costMicro = seed.costMicro
    if (seed.latencyMs !== undefined) step.latencyMs = seed.latencyMs
    if (copy.input) step.input = copy.input
    if (copy.output) step.output = copy.output
    if (copy.error) step.error = copy.error
    return step
  })
  return createRun({ id, title: title[locale], steps })
}

const filledSeeds: Seed[] = [
  { id: "root", kind: "agent", latencyMs: 6400, es: { name: "Ejemplo: expediente", input: "Resume el expediente de ejemplo.", output: "Listo para archivar." }, en: { name: "Example: case file", input: "Summarize the example case file.", output: "Ready to file." } },
  { id: "plan", parentId: "root", kind: "llm", model: "ejemplo-amplio", tokensIn: 2000, tokensOut: 400, latencyMs: 1800, es: { name: "Planear el resumen", input: "Parte el expediente en tres puntos.", output: "Hechos, duda, cierre." }, en: { name: "Plan the summary", input: "Split the file into three points.", output: "Facts, question, close." } },
  { id: "search", parentId: "root", kind: "tool", destination: "ejemplo-busqueda", costMicro: BigInt(25_000), latencyMs: 900, es: { name: "Buscar el antecedente", input: "consulta: expediente ejemplo", output: "2 notas" }, en: { name: "Search the prior note", input: "query: example file", output: "2 notes" } },
  { id: "draft", parentId: "root", kind: "agent", latencyMs: 2200, es: { name: "Redactar", input: "Escribe en voz neutra.", output: "Borrador corto." }, en: { name: "Draft", input: "Write in a neutral voice.", output: "Short draft." } },
  { id: "write", parentId: "draft", kind: "llm", model: "ejemplo-rapido", tokensIn: 800, tokensOut: 1200, cacheRead: 4000, cacheWrite: 500, latencyMs: 1400, es: { name: "Escribir con caché", input: "Usa el plan en caché.", output: "Párrafo de ejemplo." }, en: { name: "Write with cache", input: "Use the cached plan.", output: "Example paragraph." } },
  { id: "save", parentId: "draft", kind: "save", destination: "ejemplo-archivo", costMicro: BigInt(1_000), latencyMs: 300, es: { name: "Guardar el borrador", input: "ruta: /ejemplo/borrador", output: "guardado" }, en: { name: "Save the draft", input: "path: /example/draft", output: "saved" } },
  { id: "review", parentId: "root", kind: "llm", model: "ejemplo-amplio", tokensIn: 3000, tokensOut: 2000, latencyMs: 2100, es: { name: "Revisar el cierre", input: "Marca lo que falta.", output: "Falta la fecha." }, en: { name: "Review the close", input: "Mark what is missing.", output: "The date is missing." } },
]

export function filledRun(locale: SceneLocale) {
  return fromSeeds("ejemplo", { es: "Ejemplo: expediente", en: "Example: case file" }, filledSeeds, locale)
}

export function cacheHeavyRun(locale: SceneLocale) {
  return fromSeeds("cache", { es: "Ejemplo: mucha caché", en: "Example: cache heavy" }, [
    { id: "root", kind: "llm", model: "ejemplo-amplio", tokensIn: 1000, tokensOut: 200, cacheRead: 80_000, cacheWrite: 4000, latencyMs: 900, es: { name: "Releer el contexto", input: "El prefijo ya está en caché.", output: "Respuesta corta." }, en: { name: "Reread the context", input: "The prefix is already cached.", output: "Short answer." } },
  ], locale)
}

export function stepErrorRun(locale: SceneLocale) {
  return fromSeeds("fallo", { es: "Ejemplo: un paso falló", en: "Example: one step failed" }, [
    { id: "root", kind: "agent", es: { name: "Ejemplo: archivo", input: "Guarda el resumen." }, en: { name: "Example: file", input: "Save the summary." } },
    { id: "save", parentId: "root", kind: "save", destination: "ejemplo-archivo", status: "error", latencyMs: 400, es: { name: "Guardar", input: "ruta: /ejemplo", error: "El archivo de ejemplo no aceptó la escritura." }, en: { name: "Save", input: "path: /example", error: "The example file rejected the write." } },
  ], locale)
}

export function deepRun(locale: SceneLocale) {
  const seeds: Seed[] = []
  for (let depth = 0; depth < 8; depth += 1) {
    const leaf = depth === 7
    seeds.push({
      id: `nivel-${depth}`,
      parentId: depth === 0 ? undefined : `nivel-${depth - 1}`,
      kind: leaf ? "llm" : "agent",
      model: leaf ? "ejemplo-rapido" : undefined,
      tokensIn: leaf ? 2000 : 0,
      tokensOut: leaf ? 100 : 0,
      costMicro: leaf ? undefined : BigInt(depth),
      latencyMs: 200 + depth * 50,
      es: { name: `Nivel ${depth + 1} de ejemplo`, input: "sigue", output: leaf ? "hoja" : "rama" },
      en: { name: `Example level ${depth + 1}`, input: "continue", output: leaf ? "leaf" : "branch" },
    })
  }
  return fromSeeds("profundo", { es: "Ejemplo: ocho niveles", en: "Example: eight levels" }, seeds, locale)
}

const liveScript: RunEvent[] = [
  { type: "step.started", at: 1, stepId: "root", name: "Ejemplo en vivo", kind: "agent" },
  { type: "step.started", at: 2, stepId: "plan", parentId: "root", name: "Planear", kind: "llm", model: "ejemplo-rapido", input: "Haz un plan corto." },
  { type: "step.completed", at: 4, stepId: "plan", tokensIn: 900, tokensOut: 180, latencyMs: 800, output: "Tres puntos." },
  { type: "step.started", at: 5, stepId: "search", parentId: "root", name: "Buscar", kind: "tool", destination: "ejemplo-busqueda", input: "consulta ejemplo" },
  { type: "step.progress", at: 6, stepId: "search", costMicro: BigInt(8_000), latencyMs: 400 },
]

export function liveRun(locale: SceneLocale) {
  const base = reduceRunEvents(createRun({ id: "vivo", title: locale === "en" ? "Example: live run" : "Ejemplo: corrida en vivo" }), liveScript)
  if (locale === "es") return base
  return { ...base, steps: base.steps.map((step) => (step.id === "root" ? { ...step, name: "Live example" } : step.id === "plan" ? { ...step, name: "Plan" } : { ...step, name: "Search" })) }
}

export const liveTail: RunEvent[] = [
  { type: "step.progress", at: 7, stepId: "search", costMicro: BigInt(18_000), latencyMs: 700 },
  { type: "step.completed", at: 8, stepId: "search", costMicro: BigInt(25_000), latencyMs: 900, output: "1 nota" },
  { type: "step.started", at: 9, stepId: "write", parentId: "root", name: "Escribir", kind: "llm", model: "ejemplo-amplio" },
  { type: "step.completed", at: 11, stepId: "write", tokensIn: 2200, tokensOut: 600, latencyMs: 1600, output: "Texto de ejemplo." },
  { type: "run.completed", at: 12 },
]

export function labelsFor(locale: SceneLocale): CostWaterfallLabels {
  return locale === "en" ? costWaterfallLabelsEn : costWaterfallLabelsEs
}

export function emptyRun() {
  return createRun({ id: "vacio", title: "Ejemplo vacío" })
}

export const banner = { es: "No se pudo leer el costo. Vuelve a pedir la corrida.", en: "The cost could not be read. Ask for the run again." }
