"use client"

/**
 * map-browser · a filterable list and a map that stay in sync.
 *
 * Behavior reference: PropXYZ "Map Browser" (public post 2121215251761016832).
 * Clean-room: no PropXYZ code, data, icons or assets were copied. The map
 * surface is adapted from MapCN (MIT License · Copyright (c) 2025 Anmoldeep
 * Singh) through registry/ui/geo-map.tsx. maplibre-gl is BSD-3-Clause.
 *
 * The list is the accessible source. The map repeats it. Filtering lives in
 * the host: pass the filtered `places` and the unfiltered `total`.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react"
import { AnimatePresence, motion } from "motion/react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BottomSheet } from "@/registry/retana/ui/bottom-sheet"
import { EmptyState } from "@/registry/retana/ui/empty-state"
import { GeoMap } from "@/registry/retana/ui/geo-map"
import { motionPresets } from "@/registry/retana/lib/motion"
import {
  assertProvider,
  resolveMapBrowserLabels,
  shouldCluster,
  usePrefersReducedMotion,
  viewState,
  type MapBrowserLabels,
  type MapCategory,
  type MapClusterOption,
  type MapPlace,
  type MapProvider,
  type MapStatus,
  type MapTone,
} from "@/registry/retana/lib/map-browser"

export * from "@/registry/retana/lib/map-browser"

export type MapBrowserClassNames = {
  root?: string
  toolbar?: string
  body?: string
  list?: string
  card?: string
  map?: string
  pin?: string
  cluster?: string
  detail?: string
}

export type MapCardState = { active: boolean; selected: boolean }

export type MapBrowserProps<TMeta = unknown> = {
  /** Already filtered by the host. */
  places: readonly MapPlace<TMeta>[]
  /** Count before filtering. Tells empty (0) from nomatch. */
  total: number
  status?: MapStatus
  provider: MapProvider
  categories?: readonly MapCategory[]
  /** Usually a host-controlled FilterToolbar. */
  toolbar?: ReactNode
  selectedId?: string | null
  defaultSelectedId?: string | null
  onSelectedChange?: (id: string | null) => void
  renderCard?: (place: MapPlace<TMeta>, state: MapCardState) => ReactNode
  renderDetail?: (place: MapPlace<TMeta>) => ReactNode
  /** On by default above 50 places. */
  cluster?: MapClusterOption
  onRetry?: () => void
  onClearFilters?: () => void
  /** es-MX by default. Pass mapBrowserLabelsEn for English. */
  labels?: Partial<MapBrowserLabels>
  className?: string
  classNames?: MapBrowserClassNames
}

const toneDot: Record<MapTone, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
}

export function MapBrowser<TMeta = unknown>({
  places,
  total,
  status = "ready",
  provider,
  categories,
  toolbar,
  selectedId: selectedProp,
  defaultSelectedId = null,
  onSelectedChange,
  renderCard,
  renderDetail,
  cluster,
  onRetry,
  onClearFilters,
  labels: labelsProp,
  className,
  classNames,
}: MapBrowserProps<TMeta>) {
  assertProvider(provider)
  const labels = useMemo(() => resolveMapBrowserLabels(labelsProp), [labelsProp])
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const compact = useCompactContainer(rootRef)
  // Side panel width (25rem) plus its inset, in px at the default root size.
  const detailInset = 412
  const titleId = useId()
  const detailTitleId = useId()

  const [selectedState, setSelectedState] = useState<string | null>(defaultSelectedId)
  const controlled = selectedProp !== undefined
  const selectedRaw = controlled ? selectedProp : selectedState
  const byId = useMemo(() => new Map(places.map((place) => [place.id, place])), [places])
  const selectedId = selectedRaw && byId.has(selectedRaw) ? selectedRaw : null
  const selected = selectedId ? byId.get(selectedId) : undefined
  const [activeId, setActiveId] = useState<string | null>(null)
  const categoryById = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c])), [categories])

  const state = viewState({ places, total, status })
  const clusterOn = shouldCluster(cluster, places.length)
  const clusterOptions = typeof cluster === "object" ? cluster : {}

  const [announcement, setAnnouncement] = useState("")
  const originRef = useRef<HTMLElement | null>(null)
  const cardRefs = useRef(new Map<string, HTMLButtonElement>())

  const select = useCallback(
    (id: string | null) => {
      if (id !== null && typeof document !== "undefined") {
        const focused = document.activeElement
        if (focused instanceof HTMLElement && focused !== document.body) originRef.current = focused
      }
      if (!controlled) setSelectedState(id)
      const place = id ? byId.get(id) : undefined
      if (place) setAnnouncement(labels.selected(place.title))
      onSelectedChange?.(id)
    },
    [byId, controlled, labels, onSelectedChange],
  )

  const close = useCallback(() => {
    const origin = originRef.current
    select(null)
    if (origin && origin.isConnected) requestAnimationFrame(() => origin.focus())
    else if (origin) {
      const id = origin.closest<HTMLElement>("[data-place-id]")?.dataset.placeId
      if (id) cardRefs.current.get(id)?.focus()
    }
  }, [select])

  // Keep the selected card in view when the map picks it.
  useEffect(() => {
    if (!selectedId) return
    cardRefs.current.get(selectedId)?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" })
  }, [reduced, selectedId])

  // One polite announcement after the count settles (300 ms), never on mount.
  const firstCount = useRef(true)
  useEffect(() => {
    if (firstCount.current) {
      firstCount.current = false
      return
    }
    if (state === "loading") return
    const timer = setTimeout(() => setAnnouncement(labels.count(places.length)), 300)
    return () => clearTimeout(timer)
  }, [labels, places.length, state])

  const detail = selected
    ? renderDetail?.(selected) ?? <DefaultDetail place={selected} category={selected.category ? categoryById.get(selected.category) : undefined} />
    : null

  return (
    <section
      ref={rootRef}
      data-slot="map-browser"
      data-state={state}
      data-layout={compact ? "stacked" : "split"}
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        // Escape closes the side panel from anywhere in the piece. The sheet handles its own.
        if (event.key === "Escape" && selected && !compact && !event.defaultPrevented) {
          event.stopPropagation()
          close()
        }
      }}
      className={cn("@container/map-browser flex h-full min-h-[34rem] min-w-0 flex-col gap-3", className, classNames?.root)}
    >
      {toolbar ? (
        <div data-slot="map-browser-toolbar" className={cn("min-w-0", classNames?.toolbar)}>
          {toolbar}
        </div>
      ) : null}

      <div
        data-slot="map-browser-body"
        className={cn(
          "grid min-h-0 flex-1 gap-3",
          "grid-cols-[minmax(0,1fr)] grid-rows-[minmax(14rem,42%)_minmax(0,1fr)] @3xl/map-browser:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] @3xl/map-browser:grid-rows-1",
          classNames?.body,
        )}
      >
        <div
          data-slot="map-browser-list"
          className={cn("order-2 flex min-h-0 flex-col rounded-xl border bg-card text-card-foreground @3xl/map-browser:order-1", classNames?.list)}
        >
          <h2 id={titleId} className="shrink-0 border-b px-4 py-3 text-sm font-medium tabular-nums">
            {state === "loading" ? <span>{labels.loading}</span> : labels.count(places.length)}
          </h2>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {state === "loading" ? (
              <ul aria-busy="true" aria-label={labels.loading} className="flex flex-col gap-2 p-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <li key={i} aria-hidden className="flex flex-col gap-2 rounded-lg border p-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </li>
                ))}
              </ul>
            ) : state === "error" ? (
              <EmptyState
                title={labels.errorTitle}
                description={labels.errorDescription}
                action={onRetry ? <Button type="button" variant="outline" size="sm" onClick={onRetry}>{labels.retry}</Button> : undefined}
                className="m-3"
              />
            ) : state === "empty" ? (
              <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} className="m-3" />
            ) : state === "nomatch" ? (
              <EmptyState
                title={labels.nomatchTitle}
                description={labels.nomatchDescription}
                action={
                  onClearFilters ? (
                    <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
                      {labels.clearFilters}
                    </Button>
                  ) : undefined
                }
                className="m-3"
              />
            ) : (
              <ul aria-label={labels.list} className="flex flex-col gap-2 p-3">
                {places.map((place) => {
                  const category = place.category ? categoryById.get(place.category) : undefined
                  const cardState = { active: activeId === place.id, selected: selectedId === place.id }
                  return (
                    <li key={place.id} className="min-w-0">
                      <button
                        ref={(node) => {
                          if (node) cardRefs.current.set(place.id, node)
                          else cardRefs.current.delete(place.id)
                        }}
                        type="button"
                        data-slot="map-browser-card"
                        data-place-id={place.id}
                        data-active={cardState.active ? "true" : "false"}
                        data-selected={cardState.selected ? "true" : "false"}
                        aria-current={cardState.selected ? "true" : undefined}
                        onPointerEnter={() => setActiveId(place.id)}
                        onPointerLeave={() => setActiveId(null)}
                        onFocus={() => setActiveId(place.id)}
                        onBlur={() => setActiveId(null)}
                        onClick={() => select(place.id)}
                        className={cn(
                          "w-full min-w-0 rounded-lg border bg-background p-3 text-left outline-none",
                          "hover:bg-accent data-[active=true]:bg-accent data-[selected=true]:border-primary data-[selected=true]:ring-1 data-[selected=true]:ring-primary",
                          "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                          classNames?.card,
                        )}
                      >
                        {renderCard ? (
                          renderCard(place, cardState)
                        ) : (
                          <DefaultCard place={place} category={category} />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div
          data-slot="map-browser-map"
          className={cn("relative order-1 min-h-0 overflow-hidden rounded-xl border @3xl/map-browser:order-2", classNames?.map)}
        >
          <GeoMap
            provider={provider}
            places={state === "ready" ? places : []}
            categories={categories}
            activeId={activeId}
            selectedId={selectedId}
            onActivate={setActiveId}
            onSelect={select}
            cluster={clusterOn}
            clusterRadius={clusterOptions.radius}
            clusterMinPoints={clusterOptions.minPoints}
            labels={labels}
            reducedMotion={reduced}
            dimmed={state === "error"}
            revealInset={selected && !compact ? detailInset : 0}
            classNames={{ pin: classNames?.pin, cluster: classNames?.cluster }}
          />

          <AnimatePresence initial={false}>
            {selected && !compact ? (
              <motion.aside
                key="detail"
                aria-labelledby={detailTitleId}
                data-slot="map-browser-detail"
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: 16 }}
                transition={reduced ? { duration: 0 } : { duration: motionPresets.duration.standard, ease: motionPresets.ease.enter }}
                className={cn(
                  "absolute left-3 top-3 z-20 flex max-h-[calc(100%-3.5rem)] w-[min(25rem,calc(100%-4.5rem))] flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg",
                  classNames?.detail,
                )}
              >
                <div className="flex items-start justify-between gap-2 border-b px-4 py-3">
                  <h3 id={detailTitleId} className="min-w-0 break-words text-base font-medium">
                    {selected.title}
                  </h3>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={labels.close} onClick={close} className="-mr-1 shrink-0">
                    <X aria-hidden />
                  </Button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">{detail}</div>
              </motion.aside>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {compact ? (
        <BottomSheet
          open={Boolean(selected)}
          onOpenChange={(open) => {
            if (!open) close()
          }}
          title={selected?.title ?? labels.detail}
          detents={[0.5, 0.92]}
          closeLabel={labels.close}
        >
          {detail}
        </BottomSheet>
      ) : null}

      <p data-slot="map-browser-status" role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  )
}

/** Stacked layout and the bottom sheet below 48rem of the piece's own width. Unmeasured (SSR, jsdom) counts as wide. */
function useCompactContainer(ref: RefObject<HTMLElement | null>) {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node || typeof ResizeObserver === "undefined") return
    const measure = () => {
      const width = node.getBoundingClientRect().width
      setCompact(width > 0 && width < 768)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])
  return compact
}

function CategoryBadge({ category }: { category: MapCategory }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full bg-foreground", category.tone && toneDot[category.tone])} />
      <span className="truncate">{category.label}</span>
    </span>
  )
}

function DefaultCard({ place, category }: { place: MapPlace<unknown>; category?: MapCategory }) {
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <span className="break-words text-sm font-medium [overflow-wrap:anywhere]">{place.title}</span>
      {place.subtitle ? <span className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">{place.subtitle}</span> : null}
      {category ? (
        <span className="mt-1 flex">
          <CategoryBadge category={category} />
        </span>
      ) : null}
    </span>
  )
}

function DefaultDetail({ place, category }: { place: MapPlace<unknown>; category?: MapCategory }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      {place.subtitle ? <p className="text-muted-foreground [overflow-wrap:anywhere]">{place.subtitle}</p> : null}
      {category ? (
        <span className="flex">
          <CategoryBadge category={category} />
        </span>
      ) : null}
    </div>
  )
}
