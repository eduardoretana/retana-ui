import type { SceneLocale } from "@/app/catalog/scene-types"
import type { ModelRouterLabels, ModelRouterStatus } from "@/registry/ui/model-router"
import { withShare, type RouterPolicy } from "@/registry/lib/model-router"

export const environments = [
  { id: "bandeja", label: "Bandeja demo" },
  { id: "borrador", label: "Borrador demo" },
] as const

const routes: RouterPolicy["routes"] = [
  {
    id: "bruma",
    name: "Bruma breve",
    vendor: "Taller norte",
    share: 17,
    metrics: { p95Ms: 840, p99Ms: 2160, amountPer1k: 0.21, errorRate: 0.0042 },
  },
  {
    id: "cumbre",
    name: "Cumbre media",
    vendor: "Nube demo",
    share: 42,
    metrics: { p95Ms: 510, p99Ms: 1340, amountPer1k: 0.48, errorRate: 0.0027 },
  },
  {
    id: "litoral",
    name: "Litoral claro",
    vendor: "Archivo",
    share: 27,
    metrics: { p95Ms: 230, p99Ms: 840, amountPer1k: 0.7, errorRate: 0.0061 },
  },
  {
    id: "patio",
    name: "Patio local",
    vendor: "Equipo interno",
    share: 14,
    metrics: { p95Ms: 1100, p99Ms: 1980, amountPer1k: 0.19, errorRate: 0.0108 },
  },
]

export const filledPolicy: RouterPolicy = {
  id: "pol-v3",
  name: "Política v3",
  environmentId: "bandeja",
  preset: "balanced",
  routes,
  fallback: { enabled: true, modelIds: ["cumbre", "bruma"] },
}

export const filled: RouterPolicy = filledPolicy
export const deployed = filledPolicy

export const unsaved: RouterPolicy = withShare(filledPolicy, "cumbre", 55)

export const empty: RouterPolicy = { ...filledPolicy, routes: [], fallback: { enabled: false, modelIds: [] } }

export const loading: RouterPolicy = filledPolicy

export const error: RouterPolicy = filledPolicy

export const readOnly: RouterPolicy = filledPolicy

export const deploying: RouterPolicy = unsaved

export const invalid: RouterPolicy = {
  ...filledPolicy,
  routes: [
    ...routes.slice(0, 3),
    { id: "hueco", name: "Hueco sin métricas", vendor: "Sin ficha", share: 14 },
  ],
  fallback: { enabled: true, modelIds: ["bruma", "bruma", "fantasma"] },
}

export type RouterScene = {
  policy: RouterPolicy
  deployed: RouterPolicy
  status: ModelRouterStatus
  readOnly?: boolean
  deployPhase?: "pending" | "error"
  error?: { es: string; en: string }
}

export const scenesData = {
  filled: { policy: filled, deployed: filled, status: "ready" },
  empty: { policy: empty, deployed: empty, status: "ready" },
  loading: { policy: loading, deployed: loading, status: "loading" },
  error: {
    policy: error,
    deployed: error,
    status: "error",
    error: {
      es: "No se pudo leer la política de la bandeja demo.",
      en: "The demo inbox policy could not be read.",
    },
  },
  unsaved: { policy: unsaved, deployed: filled, status: "ready" },
  deploying: { policy: unsaved, deployed: filled, status: "ready", deployPhase: "pending" },
  "read-only": { policy: readOnly, deployed: readOnly, status: "ready", readOnly: true },
  invalid: { policy: invalid, deployed: filled, status: "ready" },
} as const satisfies Record<string, RouterScene>

export function routerLabels(locale: SceneLocale): Partial<ModelRouterLabels> {
  if (locale === "en") return {}
  return {
    title: "Enrutador de modelos",
    environment: "Entorno",
    blended: "Costo mezclado",
    perThousand: "por 1K tokens",
    vsLive: "contra lo publicado",
    sameAsLive: "Igual que lo publicado",
    incomplete: "Precio incompleto",
    preset: "Reparto",
    cost: "Costo",
    balanced: "Equilibrado",
    quality: "Calidad",
    diagram: "Reparto de tráfico",
    gateway: "Entrada",
    routes: "Rutas",
    model: "Modelo",
    share: "Parte",
    latency: "p95 / p99",
    price: "Moneda / 1K",
    errors: "Errores",
    fallback: "Respaldo",
    fallbackHint: "Si el primero falla, se intenta el siguiente.",
    moveUp: "Subir",
    moveDown: "Bajar",
    removeFallback: "Quitar del respaldo",
    addFallback: "Agregar al respaldo",
    unsaved: "Cambios sin desplegar",
    live: "En vivo",
    deploy: "Desplegar política",
    deploying: "Desplegando política",
    deployed: "Política desplegada",
    deployError: "La política no se desplegó. El editor volvió a mostrar este borrador.",
    readOnly: "Puedes ver la política. Este rol no puede desplegar.",
    emptyTitle: "Sin modelos",
    emptyDescription: "El catálogo todavía no tiene modelos para enrutar.",
    loading: "Cargando la política",
    errorTitle: "La política no cargó",
    shareInvalid: "Las partes deben sumar 100%.",
    noMetrics: "Sin métricas",
    diffPreset: "Reparto",
    diffEnvironment: "Entorno",
    diffFallbackOn: "Respaldo activo",
    diffFallbackOff: "Respaldo apagado",
    diffFallbackOrder: "Orden del respaldo",
    diffRouteAdded: "Ruta nueva",
    diffRouteRemoved: "Ruta quitada",
    shareLabel: (name) => `Parte de ${name}`,
    missingMetrics: (name) => `${name} no tiene métricas`,
    fallbackDuplicate: (name) => `${name} está dos veces en el respaldo`,
    fallbackCycle: (name) => `El respaldo regresa a ${name}`,
    fallbackUnknown: (name) => `${name} no es una ruta`,
    diagramSummary: (parts) => `Reparto de tráfico. ${parts}`,
    diffShare: (name, from, to) => `Parte de ${name}: ${from}% a ${to}%`,
    chainLabel: (name, index, total) => `${name}, paso ${index} de ${total}`,
  }
}

export function routerLocale(locale: SceneLocale) {
  return locale === "en" ? "en-US" : "es-MX"
}

/** Demo amounts are already in MXN. The host would pass another currency's amounts. */
export const routerCurrency = "MXN"
