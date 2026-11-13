// map-browser · pure helpers, types and copy. The only DOM code is
// `tokenColor` and the media-query hooks, and they guard for SSR.
import { useEffect, useState, type ReactNode } from "react"
import type { StyleSpecification } from "maplibre-gl"

export type GeoPoint = { lng: number; lat: number }
export type MapTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5"

export type MapPlace<TMeta = unknown> = {
  id: string
  title: string
  /** "Ciudad, país", an address, a short line. */
  subtitle?: string
  position: GeoPoint
  /** Id of a MapCategory. */
  category?: string
  /** Opaque to the piece. The host reads it in renderCard / renderDetail. */
  meta?: TMeta
}

export type MapCategory = {
  id: string
  label: string
  /** A host chart token. Never a color. */
  tone?: MapTone
  icon?: ReactNode
}

/**
 * A style URL, a style object, or a factory that builds the style from host
 * tokens. The factory gets `token("--background")` and returns a style whose
 * canvas colors come from the theme, so the piece carries no literals.
 */
export type MapStyle =
  | string
  | StyleSpecification
  | ((token: (name: string) => string) => StyleSpecification | string)

export type MapProvider = {
  styles: { light: MapStyle; dark?: MapStyle }
  /** Required. Shown expanded, never collapsed. Plain text. */
  attribution: string
  /** Self-hosted maplibre worker. The piece never falls back to a CDN. */
  workerUrl?: string
  maxZoom?: number
}

export type MapViewState = "loading" | "error" | "empty" | "nomatch" | "ready"
export type MapStatus = "ready" | "loading" | "error"
export type MapClusterOption = boolean | { radius?: number; minPoints?: number }

export type MapBrowserLabels = {
  count: (n: number) => string
  loading: string
  errorTitle: string
  errorDescription: string
  retry: string
  emptyTitle: string
  emptyDescription: string
  nomatchTitle: string
  nomatchDescription: string
  clearFilters: string
  list: string
  map: string
  mapCanvas: string
  mapHint: (n: number) => string
  mapError: string
  pins: string
  pin: (title: string, category?: string) => string
  cluster: (n: number) => string
  zoomIn: string
  zoomOut: string
  close: string
  detail: string
  selected: (title: string) => string
}

export const mapBrowserLabelsEs: MapBrowserLabels = {
  count: (n) => (n === 1 ? "1 resultado" : `${n.toLocaleString("es-MX")} resultados`),
  loading: "Cargando resultados",
  errorTitle: "No pudimos cargar los resultados.",
  errorDescription: "Revisa tu conexión e inténtalo otra vez.",
  retry: "Reintentar",
  emptyTitle: "Aún no hay lugares.",
  emptyDescription: "Cuando haya lugares, aparecerán aquí y en el mapa.",
  nomatchTitle: "Ningún resultado con estos filtros.",
  nomatchDescription: "Quita algún filtro para ver más lugares.",
  clearFilters: "Limpiar filtros",
  list: "Resultados",
  map: "Mapa",
  mapCanvas: "Mapa con los resultados",
  mapHint: (n) => `Los mismos ${n.toLocaleString("es-MX")} resultados están en la lista.`,
  mapError: "No se pudo mostrar el mapa. La lista sigue disponible.",
  pins: "Lugares en el mapa",
  pin: (title, category) => (category ? `${title}, ${category}` : title),
  cluster: (n) => `${n.toLocaleString("es-MX")} resultados, acercar`,
  zoomIn: "Acercar",
  zoomOut: "Alejar",
  close: "Cerrar detalle",
  detail: "Detalle",
  selected: (title) => `Seleccionado: ${title}`,
}

export const mapBrowserLabelsEn: MapBrowserLabels = {
  count: (n) => (n === 1 ? "1 result" : `${n.toLocaleString("en-US")} results`),
  loading: "Loading results",
  errorTitle: "We could not load the results.",
  errorDescription: "Check your connection and try again.",
  retry: "Try again",
  emptyTitle: "No places yet.",
  emptyDescription: "When there are places, they show up here and on the map.",
  nomatchTitle: "No results match these filters.",
  nomatchDescription: "Remove a filter to see more places.",
  clearFilters: "Clear filters",
  list: "Results",
  map: "Map",
  mapCanvas: "Map with the results",
  mapHint: (n) => `The same ${n.toLocaleString("en-US")} results are in the list.`,
  mapError: "The map could not be shown. The list still works.",
  pins: "Places on the map",
  pin: (title, category) => (category ? `${title}, ${category}` : title),
  cluster: (n) => `${n.toLocaleString("en-US")} results, zoom in`,
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  close: "Close detail",
  detail: "Detail",
  selected: (title) => `Selected: ${title}`,
}

export function resolveMapBrowserLabels(labels?: Partial<MapBrowserLabels>): MapBrowserLabels {
  return { ...mapBrowserLabelsEs, ...labels }
}

export function viewState({
  places,
  total,
  status = "ready",
}: {
  places: readonly unknown[]
  total: number
  status?: MapStatus
}): MapViewState {
  if (status === "loading") return "loading"
  if (status === "error") return "error"
  if (places.length > 0) return "ready"
  return total > 0 ? "nomatch" : "empty"
}

export type LngLatBounds = [[number, number], [number, number]]

export function boundsOf(places: readonly Pick<MapPlace, "position">[]): LngLatBounds | null {
  if (places.length === 0) return null
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity
  for (const { position } of places) {
    minLng = Math.min(minLng, position.lng)
    minLat = Math.min(minLat, position.lat)
    maxLng = Math.max(maxLng, position.lng)
    maxLat = Math.max(maxLat, position.lat)
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

/** Throws when the provider has no attribution. A map without credit does not render. */
export function assertProvider(provider: MapProvider): MapProvider {
  if (!provider || typeof provider.attribution !== "string" || provider.attribution.trim() === "") {
    throw new Error("map-browser: provider.attribution is required and cannot be empty")
  }
  if (!provider.styles?.light) throw new Error("map-browser: provider.styles.light is required")
  return provider
}

/** Cluster on when asked, or by default above 50 places. */
export function shouldCluster(option: MapClusterOption | undefined, count: number): boolean {
  if (option === undefined) return count > 50
  return option !== false
}

export type PlaceFeature = {
  type: "Feature"
  geometry: { type: "Point"; coordinates: [number, number] }
  properties: Record<string, unknown>
}

export function toFeatureCollection(places: readonly MapPlace[]) {
  return {
    type: "FeatureCollection" as const,
    features: places.map<PlaceFeature>((place) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [place.position.lng, place.position.lat] },
      properties: { id: place.id },
    })),
  }
}

export type MapMarker =
  | { kind: "place"; key: string; id: string; lng: number; lat: number }
  | { kind: "cluster"; key: string; clusterId: number; count: number; lng: number; lat: number }

/**
 * Turns what the native GeoJSON source returns (clusters and single points,
 * repeated across tiles) into one marker per key, ordered like the list:
 * places by list index, then clusters by size.
 */
export function markersFrom(features: readonly PlaceFeature[], order: readonly string[]): MapMarker[] {
  const rank = new Map(order.map((id, index) => [id, index]))
  const seen = new Map<string, MapMarker>()
  for (const feature of features) {
    const [lng, lat] = feature.geometry.coordinates
    const props = feature.properties ?? {}
    if (props.cluster) {
      const clusterId = Number(props.cluster_id)
      const key = `cluster-${clusterId}`
      if (!seen.has(key)) seen.set(key, { kind: "cluster", key, clusterId, count: Number(props.point_count), lng, lat })
    } else if (typeof props.id === "string" && rank.has(props.id)) {
      const key = `place-${props.id}`
      if (!seen.has(key)) seen.set(key, { kind: "place", key, id: props.id, lng, lat })
    }
  }
  return [...seen.values()].sort((a, b) => {
    if (a.kind === "place" && b.kind === "place") return (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0)
    if (a.kind === "cluster" && b.kind === "cluster") return b.count - a.count || a.clusterId - b.clusterId
    return a.kind === "place" ? -1 : 1
  })
}

/** Places plus the sum of cluster counts. Equals the list length when in sync. */
export function renderedCount(markers: readonly MapMarker[]): number {
  return markers.reduce((sum, marker) => sum + (marker.kind === "cluster" ? marker.count : 1), 0)
}

let probe: CanvasRenderingContext2D | null | undefined

/**
 * Reads a CSS custom property from the host theme and returns it in a form
 * WebGL styles accept. The token stays the source of truth: the piece never
 * holds a color. Falls back to the raw value when no 2D canvas exists (SSR,
 * jsdom).
 */
export function tokenColor(name: string, element?: Element | null): string {
  if (typeof window === "undefined") return ""
  const target = element ?? document.documentElement
  const raw = getComputedStyle(target).getPropertyValue(name).trim() || name
  if (probe === undefined) {
    try {
      probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true })
    } catch {
      probe = null
    }
  }
  if (!probe) return raw
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = raw
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data
  const hex = [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")
  return a === 255 ? "#" + hex : "#" + hex + a.toString(16).padStart(2, "0")
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const list = window.matchMedia(query)
    const update = () => setMatches(list.matches)
    update()
    list.addEventListener?.("change", update)
    return () => list.removeEventListener?.("change", update)
  }, [query])
  return matches
}

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)")

/** The `.dark` class on <html>, the way next-themes sets it. */
export function useDocumentTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  useEffect(() => {
    const html = document.documentElement
    const read = () => setTheme(html.classList.contains("dark") ? "dark" : "light")
    read()
    const observer = new MutationObserver(read)
    observer.observe(html, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])
  return theme
}
