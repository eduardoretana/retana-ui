// map-browser fixtures. Fictitious places in an invented valley, no brand.
// Behavior reference: PropXYZ "Map Browser" (public post), clean-room: no
// PropXYZ code, data, icons or assets. The map style is local and built from
// theme tokens, so the demo makes no network request for tiles or glyphs.
import type { MapCategory, MapPlace, MapProvider } from "@/registry/lib/map-browser"
import { mapBrowserLabelsEn, mapBrowserLabelsEs } from "@/registry/lib/map-browser"

import { localStyle, missingStyle } from "./local-style"

export type Locale = "es" | "en"

export const workerUrl = "/vendor/maplibre-gl-worker"

export const provider: MapProvider = {
  styles: { light: localStyle, dark: localStyle },
  attribution: "Mapa ficticio · Retana UI",
  workerUrl,
  maxZoom: 16,
}

export const brokenProvider: MapProvider = {
  styles: { light: missingStyle },
  attribution: "Mapa ficticio · Retana UI",
  workerUrl,
}

const categoryCopy = {
  office: { es: "Oficina", en: "Office", tone: "chart-1" },
  depot: { es: "Almacén", en: "Depot", tone: "chart-2" },
  pickup: { es: "Punto de entrega", en: "Pickup point", tone: "chart-3" },
  workshop: { es: "Taller", en: "Workshop", tone: "chart-4" },
} as const

export type CategoryId = keyof typeof categoryCopy

export const categoriesFor = (locale: Locale): MapCategory[] =>
  (Object.keys(categoryCopy) as CategoryId[]).map((id) => ({
    id,
    label: categoryCopy[id][locale],
    tone: categoryCopy[id].tone,
  }))

export const labelsFor = (locale: Locale) => (locale === "en" ? mapBrowserLabelsEn : mapBrowserLabelsEs)

type Seed = [id: string, title: string, area: string, category: CategoryId, lng: number, lat: number]

const seeds: Seed[] = [
  ["alba", "Nodo Alba", "Valle Norte", "office", -99.168, 19.452],
  ["brisa", "Nodo Brisa", "Valle Sur", "depot", -99.142, 19.381],
  ["cima", "Nodo Cima", "Loma Alta", "office", -99.205, 19.488],
  ["delta", "Bodega Delta", "Ribera del Lago", "depot", -99.095, 19.402],
  ["eco", "Punto Eco", "Barrio del Puente", "pickup", -99.131, 19.433],
  ["faro", "Taller Faro", "Cerro Azul", "workshop", -99.231, 19.411],
  ["gema", "Punto Gema", "Mercado Viejo", "pickup", -99.118, 19.459],
  ["hoja", "Oficina Hoja", "Jardines del Río", "office", -99.176, 19.398],
  ["isla", "Bodega Isla", "Puerto Seco", "depot", -99.064, 19.447],
  ["jade", "Punto Jade", "Las Torres", "pickup", -99.156, 19.471],
  ["kilo", "Taller Kilo", "Zona Industrial", "workshop", -99.083, 19.371],
  ["luna", "Oficina Luna", "Colinas", "office", -99.212, 19.437],
  ["monte", "Punto Monte", "Monte Claro", "pickup", -99.188, 19.364],
  ["nube", "Taller Nube", "Altavista", "workshop", -99.122, 19.497],
  ["olmo", "Bodega Olmo", "El Olmo", "depot", -99.244, 19.462],
  ["pino", "Punto Pino", "Pinar", "pickup", -99.101, 19.478],
]

export function placesFor(locale: Locale): MapPlace<{ area: string }>[] {
  const english = locale === "en"
  return seeds.map(([id, title, area, category, lng, lat]) => ({
    id,
    title,
    subtitle: english ? `${area} · fictitious` : area,
    category,
    position: { lng, lat },
    meta: { area },
  }))
}

/** Deterministic spread for the cluster scene and the stress page. */
export function manyPlaces(count: number, locale: Locale = "es"): MapPlace[] {
  let seed = 7
  const next = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const ids = Object.keys(categoryCopy) as CategoryId[]
  return Array.from({ length: count }, (_, index) => {
    const ring = next() < 0.6 ? 0.05 : 0.14
    return {
      id: `p${index}`,
      title: `${locale === "en" ? "Place" : "Lugar"} ${index + 1}`,
      subtitle: locale === "en" ? "Invented valley" : "Valle inventado",
      category: ids[index % ids.length],
      position: { lng: -99.15 + (next() - 0.5) * ring * 2, lat: 19.43 + (next() - 0.5) * ring * 1.4 },
    }
  })
}

export type MapFixture = {
  places: (locale: Locale) => MapPlace[]
  total?: (locale: Locale) => number
  status?: "ready" | "loading" | "error"
  provider?: MapProvider
  selectedId?: string
  hoverId?: string
  filters?: CategoryId[]
  cluster?: boolean
}

export const filled: MapFixture = { places: placesFor }
export const empty: MapFixture = { places: () => [], total: () => 0 }
export const loading: MapFixture = { places: () => [], status: "loading" }
export const error: MapFixture = { places: () => [], total: () => 16, status: "error" }
export const nomatch: MapFixture = { places: () => [], total: () => 16, filters: ["workshop"] }
export const mapError: MapFixture = { places: placesFor, provider: brokenProvider }
export const selected: MapFixture = { places: placesFor, selectedId: "eco" }
export const hover: MapFixture = { places: placesFor, hoverId: "delta" }
export const cluster: MapFixture = { places: (locale) => manyPlaces(120, locale), cluster: true }
