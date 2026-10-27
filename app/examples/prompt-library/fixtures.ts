import type { SceneLocale } from "@/app/catalog/scene-types"
import type { PromptLibraryLabels, PromptTemplate } from "@/registry/ui/prompt-library"

export type OrderMeta = { pedido: string }

type VariableSeed = { name: string; es: string; en: string }

type TemplateSeed = {
  id: string
  meta?: OrderMeta
  es: { title: string; category: string; body: string }
  en: { title: string; category: string; body: string }
  variables: readonly VariableSeed[]
}

export type LibraryFixture = {
  templates: readonly TemplateSeed[]
  selectedId?: string
  values: { es: Record<string, Record<string, string>>; en: Record<string, Record<string, string>> }
  loading?: boolean
  banner?: { es: string; en: string }
  useError?: { es: string; en: string }
}

const celaya: TemplateSeed = {
  id: "celaya",
  meta: { pedido: "PED-990" },
  es: { title: "Nota para Celaya", category: "Pedidos", body: "Escribe a Celaya sobre el pedido {pedido}. Di que {asunto}. El tono es {tono}." },
  en: { title: "Note for Celaya", category: "Orders", body: "Write to Celaya about order {pedido}. Say that {asunto}. The tone is {tono}." },
  variables: [
    { name: "pedido", es: "Número de pedido", en: "Order number" },
    { name: "asunto", es: "Qué hay que decir", en: "What to say" },
    { name: "tono", es: "Cómo debe sonar", en: "How it should sound" },
  ],
}

const aviso: TemplateSeed = {
  id: "aviso",
  es: { title: "Aviso a Mariana", category: "Clientes", body: "Avísale a {cliente} en {ciudad} que la entrega pasa al {dia}." },
  en: { title: "Note to Mariana", category: "Clients", body: "Tell {cliente} in {ciudad} that delivery moves to {dia}." },
  variables: [
    { name: "cliente", es: "A quién se avisa", en: "Who is told" },
    { name: "ciudad", es: "Dónde está", en: "Where they are" },
    { name: "dia", es: "El día nuevo", en: "The new day" },
  ],
}

const horno: TemplateSeed = {
  id: "horno",
  es: { title: "Nota del horno", category: "Taller", body: "Anota que el horno {horno} {estado} y que el esmalte {esmalte} se queda." },
  en: { title: "Kiln note", category: "Workshop", body: "Note that kiln {horno} is {estado} and that the {esmalte} glaze stays." },
  variables: [
    { name: "horno", es: "Cuál horno", en: "Which kiln" },
    { name: "estado", es: "Qué le pasa", en: "What is wrong" },
    { name: "esmalte", es: "Qué esmalte", en: "Which glaze" },
  ],
}

const partial = { es: { celaya: { pedido: "PED-990" } }, en: { celaya: { pedido: "PED-990" } } }

const readyValues = {
  es: { celaya: { pedido: "PED-990", asunto: "el horno 2 no enciende", tono: "claro" } },
  en: { celaya: { pedido: "PED-990", asunto: "kiln 2 will not light", tono: "plain" } },
}

export const filled: LibraryFixture = { templates: [celaya, aviso, horno], selectedId: "celaya", values: partial }

export const empty: LibraryFixture = { templates: [], values: { es: {}, en: {} } }

export const loading: LibraryFixture = { ...filled, loading: true }

export const error: LibraryFixture = {
  templates: [celaya],
  selectedId: "celaya",
  values: readyValues,
  banner: {
    es: "No se usó el prompt. Sigue en la biblioteca.",
    en: "The prompt was not used. It is still in the library.",
  },
  useError: {
    es: "No se usó el prompt. Sigue en la biblioteca.",
    en: "The prompt was not used. It is still in the library.",
  },
}

export const ready: LibraryFixture = { templates: [celaya, aviso, horno], selectedId: "celaya", values: readyValues }

export function libraryLabels(locale: SceneLocale): Partial<PromptLibraryLabels> {
  if (locale === "en") return {}
  return {
    title: "Biblioteca",
    list: "Prompts guardados",
    search: "Buscar prompts",
    empty: "Todavía no hay prompts guardados.",
    emptySearch: "Ningún prompt coincide con esa búsqueda.",
    loading: "Cargando los prompts",
    field: (name, description) => (description ? `${name}. ${description}` : name),
    progress: (filledCount, total) => `${filledCount} de ${total} llenos`,
    ready: "Listo para usar",
    preview: "Vista previa",
    copy: "Copiar",
    copied: "Prompt copiado",
    use: "Usar el prompt",
    useNamed: (title) => `Usar “${title}”`,
    used: (title) => `Usaste “${title}”`,
    missing: (count) => (count === 1 ? "1 espacio sigue abierto" : `${count} espacios siguen abiertos`),
  }
}

export function templatesFrom(seeds: readonly TemplateSeed[], locale: SceneLocale): PromptTemplate<OrderMeta>[] {
  return seeds.map((seed) => ({
    id: seed.id,
    title: seed[locale].title,
    category: seed[locale].category,
    body: seed[locale].body,
    variables: seed.variables.map((variable) => ({ name: variable.name, description: variable[locale] })),
    meta: seed.meta,
  }))
}
