"use client"

/**
 * geo-map · internal map surface for map-browser. Not a registry item of its own.
 *
 * Adapted from MapCN by Anmoldeep Singh (MIT License · Copyright (c) 2025
 * Anmoldeep Singh, https://github.com/AnmolSaini16/mapcn, pin b243a4d3). Kept:
 * the client-only maplibre instance owned by one component and DOM markers
 * rendered through React portals. Changed: no CSS import (the host loads the
 * maplibre stylesheet), no worker CDN (the host passes provider.workerUrl), no
 * compact attribution (the provider credit is always expanded), no color
 * literals (canvas paint comes from host tokens), clusters from the native
 * GeoJSON source drawn as accessible DOM buttons.
 *
 * maplibre-gl is BSD-3-Clause, Copyright (c) 2023, MapLibre contributors.
 */

import { useEffect, useEffectEvent, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import type {
  GeoJSONSource,
  GeoJSONSourceSpecification,
  Map as MaplibreMap,
  StyleSpecification,
} from "maplibre-gl"
import { Minus, Plus, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  boundsOf,
  markersFrom,
  toFeatureCollection,
  tokenColor,
  useDocumentTheme,
  type MapBrowserLabels,
  type MapCategory,
  type MapMarker,
  type MapPlace,
  type MapProvider,
  type MapStyle,
  type MapTone,
  type PlaceFeature,
} from "@/registry/retana/lib/map-browser"

export const GEO_MAP_SOURCE = "map-browser-places"
const HIT_LAYER = "map-browser-places-hit"

export type GeoMapState = "loading" | "moving" | "idle" | "error"

export type GeoMapClassNames = {
  root?: string
  pin?: string
  cluster?: string
  controls?: string
  attribution?: string
  fallback?: string
}

export type GeoMapProps = {
  provider: MapProvider
  places: readonly MapPlace[]
  categories?: readonly MapCategory[]
  activeId: string | null
  selectedId: string | null
  onActivate: (id: string | null) => void
  onSelect: (id: string) => void
  cluster: boolean
  clusterRadius?: number
  clusterMinPoints?: number
  labels: MapBrowserLabels
  reducedMotion: boolean
  /** Dims the canvas, for the data error state. */
  dimmed?: boolean
  /** Pixels covered at the inline start by a panel. A selected pin under it is eased into view. */
  revealInset?: number
  className?: string
  classNames?: GeoMapClassNames
}

type MaplibreModule = typeof import("maplibre-gl")
type GeoJSONData = Extract<GeoJSONSourceSpecification["data"], object>

let maplibreModule: Promise<MaplibreModule> | null = null

/** Loads maplibre-gl once, on the client, the first time a map mounts. */
function loadMaplibre(): Promise<MaplibreModule> {
  maplibreModule ??= import("maplibre-gl").then(
    (mod) => ((mod as { default?: MaplibreModule }).default ?? mod) as MaplibreModule,
  )
  return maplibreModule
}

const toneDot: Record<MapTone, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
}

const NAV_KEYS = new Set(["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"])

function resolveStyle(style: MapStyle, token: (name: string) => string): StyleSpecification | string {
  return typeof style === "function" ? style(token) : style
}

type Engine = { lib: MaplibreModule; map: MaplibreMap }

/** One maplibre Marker whose element React fills through a portal. */
function MarkerPortal({
  engine,
  marker,
  onNavigate,
  children,
}: {
  engine: Engine
  marker: MapMarker
  onNavigate: (key: string, event: KeyboardEvent) => void
  children: ReactNode
}) {
  const [element] = useState(() => {
    const el = document.createElement("div")
    el.dataset.slot = "map-marker"
    el.dataset.markerKey = marker.key
    return el
  })
  const navigate = useEffectEvent((event: KeyboardEvent) => onNavigate(marker.key, event))

  useLayoutEffect(() => {
    // Native listener: maplibre pans on arrow keys from the canvas container,
    // so the pin handles them first and stops them there.
    const onKeyDown = (event: KeyboardEvent) => navigate(event)
    element.addEventListener("keydown", onKeyDown)
    const instance = new engine.lib.Marker({ element, anchor: "center" }).setLngLat([marker.lng, marker.lat]).addTo(engine.map)
    return () => {
      element.removeEventListener("keydown", onKeyDown)
      instance.remove()
    }
  }, [element, engine, marker.lat, marker.lng])

  return createPortal(children, element)
}

export function GeoMap({
  provider,
  places,
  categories,
  activeId,
  selectedId,
  onActivate,
  onSelect,
  cluster,
  clusterRadius = 50,
  clusterMinPoints = 2,
  labels,
  reducedMotion,
  dimmed = false,
  revealInset = 0,
  className,
  classNames,
}: GeoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Engine | null>(null)
  const [engine, setEngine] = useState<Engine | null>(null)
  const [state, setState] = useState<GeoMapState>("loading")
  const [clustered, setClustered] = useState<MapMarker[]>([])
  const [rovingKey, setRovingKey] = useState<string | null>(null)
  const theme = useDocumentTheme()
  const hintId = useId()

  const order = useMemo(() => places.map((place) => place.id), [places])
  const byId = useMemo(() => new Map(places.map((place) => [place.id, place])), [places])
  const categoryById = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c])), [categories])

  const markers: MapMarker[] = useMemo(() => {
    if (cluster) return clustered
    return places.map((place) => ({
      kind: "place" as const,
      key: `place-${place.id}`,
      id: place.id,
      lng: place.position.lng,
      lat: place.position.lat,
    }))
  }, [cluster, clustered, places])

  const token = (name: string) => tokenColor(name, containerRef.current)
  const styleFor = (mode: "light" | "dark") =>
    resolveStyle((mode === "dark" && provider.styles.dark) || provider.styles.light, token)

  const installPlaces = useEffectEvent((map: MaplibreMap) => {
    if (map.getLayer(HIT_LAYER)) map.removeLayer(HIT_LAYER)
    if (map.getSource(GEO_MAP_SOURCE)) map.removeSource(GEO_MAP_SOURCE)
    map.addSource(GEO_MAP_SOURCE, {
      type: "geojson",
      data: toFeatureCollection(places) as GeoJSONData,
      cluster,
      clusterRadius,
      clusterMinPoints,
      clusterMaxZoom: (provider.maxZoom ?? 18) - 1,
    })
    // Invisible layer so the source loads tiles. Its paint still comes from a token.
    map.addLayer({
      id: HIT_LAYER,
      type: "circle",
      source: GEO_MAP_SOURCE,
      paint: { "circle-radius": 1, "circle-opacity": 0, "circle-color": tokenColor("--primary", containerRef.current) },
    })
  })

  const refreshClusters = useEffectEvent((map: MaplibreMap) => {
    if (!cluster) return
    const features = map.querySourceFeatures(GEO_MAP_SOURCE) as unknown as PlaceFeature[]
    setClustered(markersFrom(features, order))
  })

  const createMap = useEffectEvent((lib: MaplibreModule, container: HTMLDivElement): MaplibreMap | null => {
    if (provider.workerUrl && lib.getWorkerUrl?.() !== provider.workerUrl) lib.setWorkerUrl(provider.workerUrl)
    const bounds = boundsOf(places)
    try {
      return new lib.Map({
        container,
        style: styleFor(document.documentElement.classList.contains("dark") ? "dark" : "light"),
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        maxZoom: provider.maxZoom ?? 18,
        ...(bounds
          ? { bounds, fitBoundsOptions: { padding: 48, maxZoom: 14 } }
          : { center: [0, 20] as [number, number], zoom: 1.5 }),
        locale: { "Map.Title": labels.mapCanvas },
      })
    } catch {
      return null
    }
  })

  const fitAll = useEffectEvent((map: MaplibreMap, duration: number) => {
    const bounds = boundsOf(places)
    if (bounds) map.fitBounds(bounds, { padding: 48, maxZoom: 14, duration })
  })

  // Create the map once, on the client only.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let cancelled = false
    let map: MaplibreMap | null = null
    let loaded = false
    loadMaplibre()
      .then((lib) => {
        if (cancelled) return
        map = createMap(lib, container)
        if (!map) {
          setState("error")
          return
        }
        const ready = map
        const group = ready.getCanvasContainer?.()
        if (group) {
          group.setAttribute("role", "group")
          group.setAttribute("aria-label", labels.pins)
        }
        ready.on("load", () => {
          loaded = true
          ready.resize()
          fitAll(ready, 0)
          installPlaces(ready)
          engineRef.current = { lib, map: ready }
          setEngine(engineRef.current)
        })
        ready.on("style.load", () => {
          if (loaded) installPlaces(ready)
        })
        ready.on("movestart", () => setState((s) => (s === "error" ? s : "moving")))
        ready.on("idle", () => {
          setState((s) => (s === "error" ? s : "idle"))
          refreshClusters(ready)
        })
        ready.on("error", () => {
          if (!loaded) setState("error")
        })
      })
      .catch(() => {
        if (!cancelled) setState("error")
      })
    // Keep the canvas sized to its box: the piece can mount inside a sheet, a
    // tab or a scaled thumbnail.
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => map?.resize())
    observer?.observe(container)
    return () => {
      cancelled = true
      observer?.disconnect()
      engineRef.current = null
      map?.remove()
    }
    // The map is created once. Later prop changes go through the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Theme: rebuild the style so canvas colors follow the host tokens.
  const applyTheme = useEffectEvent((map: MaplibreMap, mode: "light" | "dark") => {
    if (!provider.styles.dark && typeof provider.styles.light !== "function") return
    map.setStyle(styleFor(mode), { diff: false })
  })
  const themed = useRef<string | null>(null)
  useEffect(() => {
    if (!engine) return
    if (themed.current === null) {
      themed.current = theme
      return
    }
    if (themed.current === theme) return
    themed.current = theme
    applyTheme(engine.map, theme)
  }, [engine, theme])

  // Data and cluster mode.
  const shape = useRef<{ ids: string; cluster: boolean } | null>(null)
  const syncData = useEffectEvent((map: MaplibreMap) => {
    const ids = order.join("|")
    const previous = shape.current
    shape.current = { ids, cluster }
    if (!previous) return
    if (previous.cluster !== cluster) installPlaces(map)
    else if (previous.ids !== ids)
      (map.getSource(GEO_MAP_SOURCE) as GeoJSONSource | undefined)?.setData(toFeatureCollection(places) as GeoJSONData)
    if (previous.ids !== ids) fitAll(map, reducedMotion ? 0 : 400)
  })
  useEffect(() => {
    if (engine) syncData(engine.map)
  }, [engine, order, cluster])

  // Bring the selected place into view when it is off screen.
  const reveal = useEffectEvent((map: MaplibreMap, id: string) => {
    const place = byId.get(id)
    if (!place) return
    const point: [number, number] = [place.position.lng, place.position.lat]
    const duration = reducedMotion ? 0 : 400
    const box = containerRef.current
    if (typeof map.project === "function" && box) {
      const { x, y } = map.project(point)
      const edge = 24
      const hidden = x < revealInset + edge || x > box.clientWidth - edge || y < edge || y > box.clientHeight - edge
      if (hidden) map.easeTo({ center: point, offset: [revealInset / 2, 0], duration })
      return
    }
    if (!map.getBounds().contains(point)) map.easeTo({ center: point, duration })
  })
  useEffect(() => {
    if (engine && selectedId) reveal(engine.map, selectedId)
  }, [engine, selectedId])

  const roving = markers.some((marker) => marker.key === rovingKey) ? rovingKey : (markers[0]?.key ?? null)

  const navigate = (key: string, event: KeyboardEvent) => {
    if (event.key === "+" || event.key === "-" || event.key === "=") {
      event.stopPropagation()
      return
    }
    if (!NAV_KEYS.has(event.key)) return
    const index = markers.findIndex((marker) => marker.key === key)
    if (index < 0) return
    const last = markers.length - 1
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? last
          : event.key === "ArrowRight" || event.key === "ArrowDown"
            ? (index + 1) % markers.length
            : (index - 1 + markers.length) % markers.length
    event.preventDefault()
    event.stopPropagation()
    const target = markers[next]
    setRovingKey(target.key)
    containerRef.current
      ?.querySelector<HTMLButtonElement>(`[data-marker-key="${CSS.escape(target.key)}"] button`)
      ?.focus()
  }

  const zoomToCluster = (marker: Extract<MapMarker, { kind: "cluster" }>) => {
    const current = engineRef.current
    const source = current?.map.getSource(GEO_MAP_SOURCE) as GeoJSONSource | undefined
    if (!current || !source) return
    void Promise.resolve(source.getClusterExpansionZoom(marker.clusterId)).then((zoom) => {
      current.map.easeTo({ center: [marker.lng, marker.lat], zoom, duration: reducedMotion ? 0 : 400 })
    })
  }

  const zoom = (direction: 1 | -1) => {
    const map = engineRef.current?.map
    if (!map) return
    const options = reducedMotion ? { duration: 0 } : undefined
    if (direction > 0) map.zoomIn(options)
    else map.zoomOut(options)
  }

  const failed = state === "error"

  return (
    <div
      role="region"
      aria-label={labels.map}
      aria-describedby={hintId}
      data-slot="geo-map"
      data-map-state={state}
      className={cn("relative isolate h-full min-h-48 overflow-hidden bg-muted", className, classNames?.root)}
    >
      <p id={hintId} className="sr-only">
        {labels.mapHint(places.length)}
      </p>
      <div
        ref={containerRef}
        data-slot="geo-map-canvas"
        className={cn(
          "absolute inset-0 transition-opacity duration-200 ease-out motion-reduce:transition-none",
          (dimmed || failed) && "opacity-40",
          state === "loading" && "opacity-0",
        )}
      />
      {state === "loading" ? <Skeleton aria-hidden data-slot="geo-map-skeleton" className="absolute inset-0 rounded-none" /> : null}

      {failed ? (
        <div data-slot="geo-map-fallback" className={cn("absolute inset-0 z-10 grid place-items-center p-6 text-center", classNames?.fallback)}>
          <p className="flex max-w-xs items-start gap-2 rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>{labels.mapError}</span>
          </p>
        </div>
      ) : null}

      <div
        data-slot="geo-map-controls"
        className={cn("absolute right-2 top-2 z-10 flex flex-col overflow-hidden rounded-md border bg-background shadow-sm", classNames?.controls)}
      >
        <Button type="button" variant="ghost" size="icon" aria-label={labels.zoomIn} disabled={failed} onClick={() => zoom(1)} className="rounded-none">
          <Plus aria-hidden />
        </Button>
        <span aria-hidden className="h-px bg-border" />
        <Button type="button" variant="ghost" size="icon" aria-label={labels.zoomOut} disabled={failed} onClick={() => zoom(-1)} className="rounded-none">
          <Minus aria-hidden />
        </Button>
      </div>

      <p
        data-slot="geo-map-attribution"
        className={cn(
          "absolute bottom-0 right-0 z-10 max-w-full rounded-tl-md bg-background px-2 py-0.5 text-xs leading-5 text-foreground",
          classNames?.attribution,
        )}
      >
        {provider.attribution}
      </p>

      {engine && !failed
        ? markers.map((marker) => {
            const tabIndex = marker.key === roving ? 0 : -1
            if (marker.kind === "cluster") {
              return (
                <MarkerPortal key={marker.key} engine={engine} marker={marker} onNavigate={navigate}>
                  <button
                    type="button"
                    data-slot="map-cluster"
                    aria-label={labels.cluster(marker.count)}
                    tabIndex={tabIndex}
                    onFocus={() => setRovingKey(marker.key)}
                    onClick={() => zoomToCluster(marker)}
                    className={cn(
                      "grid h-9 min-w-9 place-items-center rounded-full border-2 border-background bg-primary px-2 text-xs font-medium tabular-nums text-primary-foreground shadow-sm outline-none",
                      "transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                      classNames?.cluster,
                    )}
                  >
                    <span aria-hidden>{marker.count.toLocaleString()}</span>
                  </button>
                </MarkerPortal>
              )
            }
            const place = byId.get(marker.id)
            if (!place) return null
            const category = place.category ? categoryById.get(place.category) : undefined
            const active = activeId === place.id
            const selected = selectedId === place.id
            return (
              <MarkerPortal key={marker.key} engine={engine} marker={marker} onNavigate={navigate}>
                <button
                  type="button"
                  data-slot="map-pin"
                  data-place-id={place.id}
                  data-active={active ? "true" : "false"}
                  data-selected={selected ? "true" : "false"}
                  aria-label={labels.pin(place.title, category?.label)}
                  aria-pressed={selected}
                  tabIndex={tabIndex}
                  onPointerEnter={() => onActivate(place.id)}
                  onPointerLeave={() => onActivate(null)}
                  onFocus={() => {
                    setRovingKey(marker.key)
                    onActivate(place.id)
                  }}
                  onBlur={() => onActivate(null)}
                  onClick={(event) => {
                    setRovingKey(marker.key)
                    event.currentTarget.focus()
                    onSelect(place.id)
                  }}
                  className={cn(
                    "grid size-7 place-items-center rounded-full border-2 border-background bg-foreground shadow-sm outline-none",
                    "transition-transform duration-150 ease-out motion-reduce:transition-none",
                    "data-[active=true]:-translate-y-1 motion-reduce:data-[active=true]:translate-y-0",
                    "data-[active=true]:ring-2 data-[active=true]:ring-ring data-[selected=true]:bg-primary data-[selected=true]:ring-2 data-[selected=true]:ring-ring data-[selected=true]:ring-offset-2 data-[selected=true]:ring-offset-background",
                    "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    classNames?.pin,
                  )}
                >
                  <span aria-hidden className={cn("size-2.5 rounded-full bg-background", category?.tone && toneDot[category.tone])} />
                </button>
              </MarkerPortal>
            )
          })
        : null}
    </div>
  )
}
