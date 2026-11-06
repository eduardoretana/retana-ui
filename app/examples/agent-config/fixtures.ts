import type { SceneLocale } from "@/app/catalog/scene-types"
import {
  partitionBands,
  peakedDistribution,
  type AgentVersion,
  type ConfiguredAgent,
  type ExampleModel,
  type Guardrail,
  type GuardrailType,
  type TestCase,
} from "@/registry/lib/agent-config"
import type { AgentConfigProps } from "@/registry/ui/agent-config"

type Copy = { es: string; en: string }

const text = (locale: SceneLocale, copy: Copy) => (locale === "en" ? copy.en : copy.es)

export const models: ExampleModel[] = [
  { id: "norte", name: "Ejemplo Norte", vendor: "Ejemplo", currency: "USD", inputPerMillion: 3, outputPerMillion: 15, p95Ms: 1400, example: true },
  { id: "brisa", name: "Ejemplo Brisa", vendor: "Ejemplo", currency: "USD", inputPerMillion: 0.8, outputPerMillion: 4, p95Ms: 900, example: true },
  { id: "cumbre", name: "Ejemplo Cumbre", vendor: "Ejemplo", currency: "USD", inputPerMillion: 5, outputPerMillion: 25, p95Ms: 2100, example: true },
]

export const guardrailTypes: GuardrailType[] = [
  { type: "redact_pii", action: "redact", condition: { op: "eq", path: "hasPii", value: true }, params: [] },
  { type: "payment_approval", action: "require_approval", condition: { op: "gt", path: "amount", param: "threshold" }, params: [{ key: "threshold", kind: "number" }] },
  { type: "cite_fields", action: "require_citation", condition: { op: "missing", path: "citation" }, params: [] },
  { type: "web_lookup", action: "allow", condition: { op: "eq", path: "webLookup", value: true }, params: [] },
]

function guard(locale: SceneLocale): Guardrail[] {
  return [
    {
      id: "pii",
      type: "redact_pii",
      enabled: true,
      action: "redact",
      condition: { op: "eq", path: "hasPii", value: true },
      params: {},
      reasonKey: "redact_pii",
      label: text(locale, { es: "Tapar datos personales antes del modelo", en: "Mask personal data before the model" }),
      detail: text(locale, { es: "Números de cuenta, correos y documentos de identidad de ejemplo.", en: "Example account numbers, emails, and identity documents." }),
    },
    {
      id: "pay",
      type: "payment_approval",
      enabled: true,
      action: "require_approval",
      condition: { op: "gt", path: "amount", param: "threshold" },
      params: { threshold: 10000 },
      reasonKey: "approval_payment",
      label: text(locale, { es: "Pedir aprobación si el pago de ejemplo supera el umbral", en: "Ask for approval when the example payment exceeds the threshold" }),
      detail: text(locale, { es: "El monto es de ejemplo. No es un cargo real.", en: "The amount is an example. It is not a real charge." }),
    },
    {
      id: "cite",
      type: "cite_fields",
      enabled: true,
      action: "require_citation",
      condition: { op: "missing", path: "citation" },
      params: {},
      reasonKey: "require_citation",
      label: text(locale, { es: "Exigir una cita de fuente por campo", en: "Require a source citation for every field" }),
      detail: text(locale, { es: "Sin cita, el campo pasa a revisión.", en: "A field without a citation goes to review." }),
    },
    {
      id: "web",
      type: "web_lookup",
      enabled: false,
      action: "allow",
      condition: { op: "eq", path: "webLookup", value: true },
      params: {},
      reasonKey: "allow_web",
      label: text(locale, { es: "Permitir consultas web", en: "Allow web lookups" }),
      detail: text(locale, { es: "Apagado: el agente solo lee el documento.", en: "Off: the agent can only read the document." }),
    },
  ]
}

const distribution = peakedDistribution(86, 28)

function published(agentId: string, number: number, at: string, author: string, locale: SceneLocale, primaryId = "norte"): AgentVersion {
  return {
    id: `${agentId}-v${number}`,
    agentId,
    number,
    state: "published",
    author,
    at,
    instructions: text(locale, {
      es: "Trabaja solo con los campos del registro de Nimbo. No inventes datos.",
      en: "Use only the fields on the Nimbo record. Do not invent data.",
    }),
    binding: { primaryId, fallbackId: primaryId === "brisa" ? "norte" : "brisa", fallback: { kind: "timeout", afterMs: 8000 } },
    bands: partitionBands(70, 92),
    guardrails: guard(locale),
    evaluation: { periodDays: 30, distribution, accuracy: 91 },
  }
}

const agentSeed: { id: string; icon: ConfiguredAgent["icon"]; workflows: number; accuracy: number; level: ConfiguredAgent["accuracyLevel"]; name: Copy; summary: Copy; primary: string }[] = [
  { id: "leads", icon: "leads", workflows: 3, accuracy: 96, level: "high", primary: "norte", name: { es: "Calificador de prospectos", en: "Lead qualifier" }, summary: { es: "Lee el formulario y propone una prioridad.", en: "Reads the form and suggests a priority." } },
  { id: "documents", icon: "documents", workflows: 2, accuracy: 91, level: "mid", primary: "norte", name: { es: "Extractor de documentos", en: "Document extractor" }, summary: { es: "Saca campos de un PDF de ejemplo.", en: "Pulls fields from an example PDF." } },
  { id: "followup", icon: "followup", workflows: 4, accuracy: 88, level: "mid", primary: "brisa", name: { es: "Seguimiento de tratos", en: "Deal follow-up" }, summary: { es: "Redacta el siguiente mensaje del trato.", en: "Drafts the next note on a deal." } },
  { id: "notes", icon: "notes", workflows: 1, accuracy: 97, level: "high", primary: "brisa", name: { es: "Resumen de notas", en: "Note summary" }, summary: { es: "Condensa la nota interna en tres líneas.", en: "Condenses the internal note into three lines." } },
  { id: "route", icon: "route", workflows: 2, accuracy: 74, level: "low", primary: "cumbre", name: { es: "Enrutador de mensajes", en: "Message router" }, summary: { es: "Elige la cola según el tema del mensaje.", en: "Picks a queue from the message topic." } },
  { id: "duplicates", icon: "duplicates", workflows: 2, accuracy: 99, level: "high", primary: "brisa", name: { es: "Detector de duplicados", en: "Duplicate detector" }, summary: { es: "Marca registros que parecen el mismo trato.", en: "Flags records that look like the same deal." } },
]

export function agentsFor(locale: SceneLocale): ConfiguredAgent[] {
  return agentSeed.map((agent) => ({
    id: agent.id,
    name: text(locale, agent.name),
    summary: text(locale, agent.summary),
    icon: agent.icon,
    workflowCount: agent.workflows,
    accuracy: agent.accuracy,
    accuracyLevel: agent.level,
  }))
}

export function versionsFor(locale: SceneLocale): AgentVersion[] {
  return agentSeed.flatMap((agent) => [
    published(agent.id, 6, "2026-09-02T16:00:00.000Z", "Leo Marín", locale, agent.primary),
    published(agent.id, 7, "2026-10-20T16:00:00.000Z", "Ada Solís", locale, agent.primary),
  ])
}

export function testCasesFor(locale: SceneLocale): TestCase[] {
  return [
    {
      id: "payment",
      label: text(locale, { es: "Pago de ejemplo por encima del umbral", en: "Example payment above the threshold" }),
      prompt: text(locale, { es: "El trato de ejemplo pide un pago de 12000.", en: "The example deal asks for a payment of 12000." }),
      context: { flags: {}, numbers: { amount: 12000 }, missing: [] },
    },
    {
      id: "pii",
      label: text(locale, { es: "Documento con un dato personal de ejemplo", en: "Document with example personal data" }),
      prompt: text(locale, { es: "El documento trae un dato personal de ejemplo.", en: "The document contains an example personal detail." }),
      context: { flags: { hasPii: true }, numbers: {}, missing: [] },
    },
    {
      id: "web",
      label: text(locale, { es: "Consulta web con la guarda apagada", en: "Web lookup while the guard is off" }),
      prompt: text(locale, { es: "Hay que buscar el folio fuera del documento.", en: "The reference number has to be looked up outside the document." }),
      context: { flags: { webLookup: true }, numbers: {}, missing: [] },
    },
  ]
}

function workspace(locale: SceneLocale): AgentConfigProps["workspace"] {
  return {
    title: text(locale, { es: "Configuración de agentes", en: "Agent configuration" }),
    summary: text(locale, {
      es: "6 agentes · 3 modelos de ejemplo · las guardas aplican a cada flujo",
      en: "6 agents · 3 example models · guardrails apply to every workflow",
    }),
    usage: { periodDays: 30, currency: "USD", exampleSpend: 860, exampleBudget: 1400 },
    kpis: [
      { id: "decisions", label: text(locale, { es: "Decisiones", en: "Decisions" }), value: "18,420", delta: "+6.2%", caption: text(locale, { es: "Últimos 30 días", en: "Last 30 days" }), series: [12, 14, 13, 16, 15, 18, 17, 19], tone: "accent" },
      { id: "auto", label: text(locale, { es: "Aprobadas solas", en: "Auto-approved" }), value: "74.1%", delta: "+1.4%", caption: text(locale, { es: "Sobre el umbral", en: "Above the threshold" }), series: [60, 62, 64, 63, 68, 70, 72, 74], tone: "warning" },
      { id: "confidence", label: text(locale, { es: "Confianza media", en: "Average confidence" }), value: "91.4%", delta: "+0.6%", caption: text(locale, { es: "Todos los agentes", en: "All agents" }), series: [88, 89, 90, 89, 91, 90, 91, 91], tone: "success" },
      { id: "spend", label: text(locale, { es: "Gasto del modelo", en: "Model spend" }), value: "$860", delta: "61%", caption: text(locale, { es: "Del presupuesto de ejemplo", en: "Of the example budget" }), series: [20, 24, 28, 30, 36, 40, 48, 52], tone: "danger" },
    ],
  }
}

export type AgentFixture = {
  workspace: AgentConfigProps["workspace"]
  agents: ConfiguredAgent[]
  versions: AgentVersion[]
  draft?: AgentVersion
  loading?: boolean
  error?: Copy
  readOnly?: boolean
  busy?: AgentConfigProps["busy"]
}

function base(locale: SceneLocale): AgentFixture {
  return { workspace: workspace(locale), agents: agentsFor(locale), versions: versionsFor(locale) }
}

export const filled: Record<SceneLocale, AgentFixture> = { es: base("es"), en: base("en") }

export const empty: Record<SceneLocale, AgentFixture> = {
  es: { ...base("es"), agents: [], versions: [] },
  en: { ...base("en"), agents: [], versions: [] },
}

export const loading: Record<SceneLocale, AgentFixture> = {
  es: { ...base("es"), loading: true },
  en: { ...base("en"), loading: true },
}

export const error: Record<SceneLocale, AgentFixture> = {
  es: { ...base("es"), agents: [], error: { es: "No pudimos abrir la configuración de Nimbo.", en: "Nimbo configuration could not be opened." } },
  en: { ...base("en"), agents: [], error: { es: "No pudimos abrir la configuración de Nimbo.", en: "Nimbo configuration could not be opened." } },
}

function dirtyDraft(locale: SceneLocale): AgentVersion {
  const live = versionsFor(locale).find((version) => version.id === "leads-v7")!
  return {
    ...toDraftShape(live),
    instructions: text(locale, {
      es: "Pide una cita de fuente antes de marcar la prioridad del prospecto.",
      en: "Ask for a source citation before setting the lead priority.",
    }),
    binding: { ...live.binding, primaryId: "cumbre" },
    bands: partitionBands(60, 90),
  }
}

function toDraftShape(version: AgentVersion): AgentVersion {
  return { ...version, id: `${version.id}:draft`, state: "draft" }
}

export const draftDirty: Record<SceneLocale, AgentFixture> = {
  es: { ...base("es"), draft: dirtyDraft("es") },
  en: { ...base("en"), draft: dirtyDraft("en") },
}

export const invalidBands: Record<SceneLocale, AgentFixture> = {
  es: {
    ...base("es"),
    draft: {
      ...dirtyDraft("es"),
      bands: { reject: { min: 0, max: 80 }, review: { min: 70, max: 92 }, auto: { min: 92, max: 100 } },
    },
  },
  en: {
    ...base("en"),
    draft: {
      ...dirtyDraft("en"),
      bands: { reject: { min: 0, max: 80 }, review: { min: 70, max: 92 }, auto: { min: 92, max: 100 } },
    },
  },
}

export const publishing: Record<SceneLocale, AgentFixture> = {
  es: { ...draftDirty.es, busy: "publish" },
  en: { ...draftDirty.en, busy: "publish" },
}

export const publishError: Record<SceneLocale, AgentFixture> = draftDirty

export const readonlyRole: Record<SceneLocale, AgentFixture> = {
  es: { ...base("es"), readOnly: true },
  en: { ...base("en"), readOnly: true },
}

export const narrow390: Record<SceneLocale, AgentFixture> = filled

export function manyAgents(locale: SceneLocale): ConfiguredAgent[] {
  const token = "Nimbo".repeat(12)
  return Array.from({ length: 40 }, (_, index) => ({
    id: `agent-${index}`,
    name: index === 1 ? token : text(locale, { es: `Agente de ejemplo ${index + 1}`, en: `Example agent ${index + 1}` }),
    summary: text(locale, { es: "Registro sintético de Nimbo.", en: "Synthetic Nimbo record." }),
    icon: agentSeed[index % agentSeed.length]!.icon,
    workflowCount: index,
    accuracy: index % 17,
    accuracyLevel: index % 3 === 0 ? "high" : index % 3 === 1 ? "mid" : "low",
  }))
}
