"use client"

/**
 * Clean-room collection that switches board, list, and timeline.
 * Reference behavior only: a public recording with no published license.
 * No source, copy, colors, or assets were copied. See NOTICE.
 * This file is the skeleton. The morph lands on the shared-element contract
 * in collection-morph.ts and does not know the example domain.
 */

import * as React from "react"
import { GanttChart, LayoutGrid, List } from "lucide-react"

import { cn } from "@/lib/utils"
import { SegmentedControl } from "@/registry/retana/ui/segmented-control"
import { collectionMorphMode } from "@/registry/retana/lib/collection-morph"

export type CollectionPerson = {
  id: string
  name: string
}

export type CollectionGroup = {
  id: string
  label: string
}

export type CollectionItem = {
  id: string
  groupId: string
  title: string
  detail?: string
  people?: readonly CollectionPerson[]
  /** Inclusive calendar day, YYYY-MM-DD, read in UTC. */
  start?: string
  end?: string
}

export type CollectionView = "board" | "list" | "timeline"

export type CollectionViewsLabels = {
  view: string
  board: string
  list: string
  timeline: string
  search: string
  searchPlaceholder: string
  clearSearch: string
  emptyTitle: string
  empty: string
  noMatches: string
  loading: string
  retry: string
  ungrouped: string
  people: (names: string) => string
  count: (count: number) => string
  openItem: (title: string) => string
  columnTitle: string
  columnPeople: string
  columnDetail: string
  viewNow: (view: string) => string
  region: string
}

export const collectionViewsLabelsEn: CollectionViewsLabels = {
  view: "View",
  board: "Board",
  list: "List",
  timeline: "Timeline",
  search: "Search",
  searchPlaceholder: "Search by title",
  clearSearch: "Clear search",
  emptyTitle: "Nothing here",
  empty: "This collection has no items.",
  noMatches: "No item matches the search.",
  loading: "Loading the collection",
  retry: "Try again",
  ungrouped: "Ungrouped",
  people: (names) => `People: ${names}`,
  count: (count) => String(count),
  openItem: (title) => `Open ${title}`,
  columnTitle: "Title",
  columnPeople: "People",
  columnDetail: "Detail",
  viewNow: (view) => `View: ${view}`,
  region: "Collection",
}

const labelsEs: CollectionViewsLabels = {
  view: "Vista",
  board: "Tablero",
  list: "Lista",
  timeline: "Tiempo",
  search: "Buscar",
  searchPlaceholder: "Buscar por título",
  clearSearch: "Borrar búsqueda",
  emptyTitle: "Nada por aquí",
  empty: "Esta colección no tiene elementos.",
  noMatches: "Ningún elemento coincide con la búsqueda.",
  loading: "Cargando la colección",
  retry: "Reintentar",
  ungrouped: "Sin grupo",
  people: (names) => `Personas: ${names}`,
  count: (count) => String(count),
  openItem: (title) => `Abrir ${title}`,
  columnTitle: "Título",
  columnPeople: "Personas",
  columnDetail: "Detalle",
  viewNow: (view) => `Vista: ${view}`,
  region: "Colección",
}

export type CollectionViewsClassNames = {
  root?: string
  toolbar?: string
  group?: string
  item?: string
}

export type CollectionViewsProps = {
  items?: readonly CollectionItem[]
  groups?: readonly CollectionGroup[]
  view?: CollectionView
  defaultView?: CollectionView
  onViewChange?: (view: CollectionView) => void
  query?: string
  defaultQuery?: string
  onQueryChange?: (query: string) => void
  title?: string
  description?: string
  labels?: Partial<CollectionViewsLabels>
  locale?: string
  /** UTC day YYYY-MM-DD used by the timeline mark. */
  today?: string
  loading?: boolean
  error?: string
  onRetry?: () => void
  onItemOpen?: (id: string) => void
  activeId?: string
  className?: string
  classNames?: CollectionViewsClassNames
}

const VIEWS: CollectionView[] = ["board", "list", "timeline"]

function isView(value: string): value is CollectionView {
  return VIEWS.includes(value as CollectionView)
}

export function CollectionViews({
  items = [],
  groups = [],
  view,
  defaultView = "board",
  onViewChange,
  title,
  description,
  labels: labelOverrides,
  loading = false,
  error,
  className,
  classNames,
}: CollectionViewsProps) {
  const labels = { ...labelsEs, ...labelOverrides }
  const [internal, setInternal] = React.useState(defaultView)
  const selected = view ?? internal
  const reduced = false

  function change(next: string) {
    if (!isView(next)) return
    if (view === undefined) setInternal(next)
    onViewChange?.(next)
  }

  const viewLabel = selected === "board" ? labels.board : selected === "list" ? labels.list : labels.timeline

  return (
    <div
      data-slot="collection-views"
      data-view={selected}
      data-motion={collectionMorphMode(reduced)}
      className={cn("flex w-full min-w-0 max-w-full flex-col gap-3", className, classNames?.root)}
    >
      <div className={cn("flex min-w-0 flex-col gap-2", classNames?.toolbar)}>
        {title ? <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">{title}</h2> : null}
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        <SegmentedControl
          label={labels.view}
          value={selected}
          onValueChange={change}
          options={[
            { value: "board", label: labels.board, icon: <LayoutGrid aria-hidden="true" /> },
            { value: "list", label: labels.list, icon: <List aria-hidden="true" /> },
            { value: "timeline", label: labels.timeline, icon: <GanttChart aria-hidden="true" /> },
          ]}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {loading ? labels.loading : error ? error : `${viewLabel} · ${labels.count(items.length)} · ${labels.count(groups.length)}`}
      </p>
    </div>
  )
}
