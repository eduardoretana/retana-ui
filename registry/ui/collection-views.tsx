"use client"

/**
 * Clean-room collection. Board, list, and timeline share one tree.
 * The morph contract is registry/lib/collection-morph.ts: layoutId on the
 * group, the shell, the title, and the avatars; a critically damped spring;
 * transform and opacity only. It does not know the example domain.
 * Reference: a public recording with no published license. See NOTICE.
 * Reduced motion skips layoutId and crossfades the view.
 */

import * as React from "react"
import { AnimatePresence, LayoutGroup, animate, motion, useReducedMotionConfig } from "motion/react"
import { GanttChart, LayoutGrid, List, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { SegmentedControl } from "@/registry/retana/ui/segmented-control"
import {
  COLLECTION_TIMELINE_SIDEBAR,
  collectionBar,
  collectionBarMotion,
  collectionCoversDay,
  collectionDomain,
  collectionExclusiveMotion,
  collectionLayoutId,
  collectionMark,
  collectionMorphMode,
  collectionQueryMatch,
  collectionReducedFade,
  collectionSharedMotion,
  collectionSurfaceMotion,
  collectionTicks,
  formatCollectionDay,
  parseCollectionDay,
} from "@/registry/retana/lib/collection-morph"

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
  current: string
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
  current: "In progress",
}

const labelsEs: CollectionViewsLabels = {
  view: "Vista",
  board: "Tablero",
  list: "Lista",
  timeline: "Cronograma",
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
  current: "En curso",
}

export type CollectionViewsClassNames = {
  root?: string
  toolbar?: string
  search?: string
  group?: string
  item?: string
  title?: string
  people?: string
  bar?: string
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

const listColumns =
  "grid-cols-1 gap-1 @min-[36rem]:grid-cols-[minmax(0,1.4fr)_auto_minmax(0,1fr)] @min-[36rem]:items-center @min-[36rem]:gap-3"

function isView(value: string): value is CollectionView {
  return VIEWS.includes(value as CollectionView)
}

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function usePrefersReducedMotion() {
  "use no memo"
  const fromConfig = useReducedMotionConfig() === true
  const fromMedia = React.useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false)
  return fromConfig || fromMedia
}

function utcToday() {
  const now = new Date()
  const month = String(now.getUTCMonth() + 1).padStart(2, "0")
  const day = String(now.getUTCDate()).padStart(2, "0")
  return `${now.getUTCFullYear()}-${month}-${day}`
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2)
  const letters = parts.map((part) => part[0] ?? "").join("")
  return letters || name.slice(0, 1)
}

function dateLabel(item: CollectionItem, locale: string) {
  const start = item.start ? parseCollectionDay(item.start) : null
  const end = item.end ? parseCollectionDay(item.end) : null
  if (start == null || end == null) return ""
  return `${formatCollectionDay(start, locale)} – ${formatCollectionDay(end, locale)}`
}

function viewLabel(view: CollectionView, labels: CollectionViewsLabels) {
  if (view === "board") return labels.board
  if (view === "list") return labels.list
  return labels.timeline
}

export function CollectionViews({
  items = [],
  groups = [],
  view,
  defaultView = "board",
  onViewChange,
  query: queryProp,
  defaultQuery = "",
  onQueryChange,
  title,
  description,
  labels: labelOverrides,
  locale = "es-MX",
  today,
  loading = false,
  error,
  onRetry,
  onItemOpen,
  activeId,
  className,
  classNames,
}: CollectionViewsProps) {
  const labels = { ...labelsEs, ...labelOverrides }
  const reduced = usePrefersReducedMotion()
  const scope = React.useId()
  const [internalView, setInternalView] = React.useState(defaultView)
  const [internalQuery, setInternalQuery] = React.useState(defaultQuery)
  const selected = view ?? internalView
  const query = queryProp ?? internalQuery
  const todayMs = parseCollectionDay(today ?? utcToday()) ?? Date.UTC(2026, 0, 1)
  const visible = items.filter((item) => collectionQueryMatch(item, query))
  const searching = query.trim().length > 0

  function changeView(next: string) {
    if (!isView(next)) return
    if (view === undefined) setInternalView(next)
    onViewChange?.(next)
  }

  function changeQuery(next: string) {
    if (queryProp === undefined) setInternalQuery(next)
    onQueryChange?.(next)
  }

  const label = viewLabel(selected, labels)

  return (
    <div
      data-slot="collection-views"
      data-view={selected}
      data-motion={collectionMorphMode(reduced)}
      className={cn("@container flex w-full min-w-0 max-w-full flex-col gap-4 text-foreground", className, classNames?.root)}
    >
      <div className={cn("flex min-w-0 flex-col gap-3 @min-[40rem]:flex-row @min-[40rem]:items-center @min-[40rem]:justify-between", classNames?.toolbar)}>
        <div className="min-w-0 max-w-xl">
          {title ? <h2 className="text-lg font-semibold tracking-tight">{title}</h2> : null}
          {description ? <p className="mt-0.5 max-w-prose text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2 @min-[40rem]:w-auto @min-[40rem]:flex-row @min-[40rem]:items-center">
          <div className={cn("flex w-full min-w-0 items-center gap-1 @min-[40rem]:w-56", classNames?.search)}>
            <Input
              type="search"
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              aria-label={labels.search}
              placeholder={labels.searchPlaceholder}
              className="w-full min-w-0"
            />
            {query ? (
              <Button type="button" variant="ghost" size="icon" aria-label={labels.clearSearch} onClick={() => changeQuery("")}>
                <X aria-hidden="true" />
              </Button>
            ) : null}
          </div>
          <SegmentedControl
            label={labels.view}
            value={selected}
            onValueChange={changeView}
            options={[
              { value: "board", label: labels.board, icon: <LayoutGrid className="size-4" aria-hidden="true" /> },
              { value: "list", label: labels.list, icon: <List className="size-4" aria-hidden="true" /> },
              { value: "timeline", label: labels.timeline, icon: <GanttChart className="size-4" aria-hidden="true" /> },
            ]}
          />
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {labels.viewNow(label)}
      </p>
      <LayoutGroup id={scope}>
        {loading ? (
          <LoadingState view={selected} label={labels.loading} />
        ) : error ? (
          <div role="alert" data-slot="collection-error" className="flex max-w-md flex-col items-start gap-3 rounded-lg bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
            {onRetry ? (
              <Button type="button" variant="outline" onClick={onRetry}>
                {labels.retry}
              </Button>
            ) : null}
          </div>
        ) : visible.length === 0 ? (
          <Empty data-slot="collection-empty" className="min-h-40">
            <EmptyHeader>
              <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
              <EmptyDescription>{searching ? labels.noMatches : labels.empty}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : reduced ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={selected} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={collectionReducedFade}>
              <CollectionBody
                items={visible}
                groups={groups}
                view={selected}
                labels={labels}
                locale={locale}
                todayMs={todayMs}
                scope={scope}
                reduced
                onItemOpen={onItemOpen}
                activeId={activeId}
                classNames={classNames}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <CollectionBody
            items={visible}
            groups={groups}
            view={selected}
            labels={labels}
            locale={locale}
            todayMs={todayMs}
            scope={scope}
            reduced={false}
            onItemOpen={onItemOpen}
            activeId={activeId}
            classNames={classNames}
          />
        )}
      </LayoutGroup>
    </div>
  )
}

function LoadingState({ view, label }: { view: CollectionView; label: string }) {
  return (
    <div role="status" data-slot="collection-loading" aria-busy="true" className="flex min-w-0 flex-col gap-3">
      <span className="sr-only">{label}</span>
      {view === "board" ? (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="w-64 max-w-[85%] shrink-0 space-y-2 rounded-xl bg-muted/70 p-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-10 w-full max-w-full rounded-lg" />)
      )}
    </div>
  )
}

type BodyProps = {
  items: readonly CollectionItem[]
  groups: readonly CollectionGroup[]
  view: CollectionView
  labels: CollectionViewsLabels
  locale: string
  todayMs: number
  scope: string
  reduced: boolean
  onItemOpen?: ((id: string) => void) | undefined
  activeId?: string | undefined
  classNames?: CollectionViewsClassNames | undefined
}

function CollectionBody({ items, groups, view, labels, locale, todayMs, scope, reduced, onItemOpen, activeId, classNames }: BodyProps) {
  const sections = groupItems(groups, items, labels.ungrouped)
  const domain = collectionDomain(items, todayMs)
  const ticks = collectionTicks(domain, locale)
  const todayPercent = collectionMark(todayMs, domain)
  const columns = `minmax(7.5rem, ${COLLECTION_TIMELINE_SIDEBAR * 100}%) minmax(0, 1fr)`
  const fade = collectionExclusiveMotion(reduced)

  return (
    <div className="min-w-0" role="region" aria-label={labels.region}>
      {view === "timeline" ? (
          <div className="mb-2 grid items-end" style={{ gridTemplateColumns: columns }}>
            <span className="sr-only">{labels.timeline}</span>
            <div />
            <div className="relative h-6" dir="ltr">
              {ticks.map((tick) => (
                <span key={tick.time} className="absolute top-0 text-xs text-muted-foreground tabular-nums" style={{ insetInlineStart: `${tick.percent}%` }}>
                  {tick.label}
                </span>
              ))}
              {todayPercent != null ? (
                <span aria-hidden="true" data-slot="collection-today" className="absolute inset-y-0 w-px bg-foreground" style={{ insetInlineStart: `${todayPercent}%` }} />
              ) : null}
            </div>
          </div>
        ) : null}
        <AnimatePresence initial={false}>
          {view === "list" ? (
            <motion.div
              key="list-head"
              {...fade}
              className={cn("mb-2 hidden px-3 text-xs font-medium text-muted-foreground @min-[36rem]:grid", listColumns)}
            >
              <span>{labels.columnTitle}</span>
              <span>{labels.columnPeople}</span>
              <span>{labels.columnDetail}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div className={cn("min-w-0", view === "board" ? "flex gap-3 overflow-x-auto pb-1" : "flex flex-col gap-5")}>
          {sections.map((section) => (
            <motion.section
              key={section.group.id}
              initial={false}
              {...collectionSharedMotion(reduced, scope, "group", section.group.id)}
              layoutDependency={view}
              data-slot="collection-group"
              data-shared={reduced ? undefined : collectionLayoutId(scope, "group", section.group.id)}
              className={cn(
                "relative min-w-0",
                view === "board" ? "flex w-64 max-w-[85%] shrink-0 flex-col gap-2" : "flex w-full flex-col gap-1",
                classNames?.group,
              )}
            >
              <motion.div
                aria-hidden="true"
                data-slot="collection-group-surface"
                className="pointer-events-none absolute inset-0 rounded-xl bg-muted/70"
                {...collectionSurfaceMotion(view === "board", reduced)}
              />
              <div
                className={cn("relative", view === "timeline" && "grid")}
                style={view === "timeline" ? { gridTemplateColumns: columns } : undefined}
              >
                <div className={cn("flex min-w-0 items-baseline gap-2", view === "board" ? "px-2 pt-2" : "px-3")}>
                <h3 className="min-w-0 truncate text-sm font-medium">{section.group.label}</h3>
                <span className="text-xs font-normal text-muted-foreground tabular-nums">{labels.count(section.items.length)}</span>
                </div>
              </div>
              <div className={cn("relative flex flex-col", view === "board" ? "gap-2 px-2 pb-2" : "gap-2")}>
                {section.items.map((item) => (
                  <CollectionRow
                    key={item.id}
                    item={item}
                    view={view}
                    labels={labels}
                    locale={locale}
                    todayMs={todayMs}
                    domain={domain}
                    ticks={ticks}
                    todayPercent={todayPercent}
                    columns={columns}
                    scope={scope}
                    reduced={reduced}
                    onItemOpen={onItemOpen}
                    active={activeId === item.id}
                    classNames={classNames}
                  />
                ))}
              </div>
            </motion.section>
          ))}
        </div>
    </div>
  )
}

function groupItems(groups: readonly CollectionGroup[], items: readonly CollectionItem[], ungrouped: string) {
  const known = new Set(groups.map((group) => group.id))
  const sections = groups
    .map((group) => ({ group, items: items.filter((item) => item.groupId === group.id) }))
    .filter((section) => section.items.length > 0)
  const rest = items.filter((item) => !known.has(item.groupId))
  if (rest.length > 0) sections.push({ group: { id: "__ungrouped", label: ungrouped }, items: rest })
  return sections
}

type RowProps = {
  item: CollectionItem
  view: CollectionView
  labels: CollectionViewsLabels
  locale: string
  todayMs: number
  domain: ReturnType<typeof collectionDomain>
  ticks: ReturnType<typeof collectionTicks>
  todayPercent: number | null
  columns: string
  scope: string
  reduced: boolean
  onItemOpen?: ((id: string) => void) | undefined
  active: boolean
  classNames?: CollectionViewsClassNames | undefined
}

function CollectionRow({
  item,
  view,
  labels,
  locale,
  todayMs,
  domain,
  ticks,
  todayPercent,
  columns,
  scope,
  reduced,
  onItemOpen,
  active,
  classNames,
}: RowProps) {
  const titleId = React.useId()
  const dates = dateLabel(item, locale)
  const extra = item.detail || dates
  const fade = collectionExclusiveMotion(reduced)
  const current = collectionCoversDay(item.start, item.end, todayMs)
  const shared = collectionSharedMotion(reduced, scope, "shell", item.id)
  const shellClass = cn(
    "relative min-w-0 rounded-lg bg-background text-start text-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    view === "board" && "flex w-full flex-col gap-2 p-3",
    view === "list" && "w-full px-3 py-2",
    view === "timeline" && "px-3 py-2",
    onItemOpen && "cursor-pointer",
    classNames?.item,
  )
  const inner = (
    <>
      {active ? <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-ring" /> : null}
      <div className={cn("relative min-w-0", view === "list" && "grid", view === "list" && listColumns)}>
        <motion.span
          initial={false}
          {...collectionSharedMotion(reduced, scope, "title", item.id)}
          layoutDependency={view}
          id={titleId}
          data-slot="collection-title"
          data-shared={reduced ? undefined : collectionLayoutId(scope, "title", item.id)}
          className={cn("min-w-0 text-sm font-medium", view === "board" ? "break-words" : "truncate", classNames?.title)}
        >
          {item.title}
        </motion.span>
        <People
          people={item.people ?? []}
          label={labels.people}
          reduced={reduced}
          scope={scope}
          id={item.id}
          view={view}
          className={classNames?.people}
        />
        <AnimatePresence initial={false}>
          {view === "list" && extra ? (
            <motion.span key="list-extra" {...fade} className="min-w-0 break-words text-xs text-muted-foreground">
              {extra}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      <AnimatePresence initial={false}>
        {view === "board" && item.detail ? (
          <motion.p key="card-detail" {...fade} className="line-clamp-2 text-xs text-muted-foreground">
            {item.detail}
          </motion.p>
        ) : null}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {view === "board" && dates ? (
          <motion.p key="card-dates" {...fade} className="text-xs text-muted-foreground tabular-nums">
            {dates}
          </motion.p>
        ) : null}
      </AnimatePresence>
      {current ? <span className="sr-only">{labels.current}</span> : null}
      {view === "timeline" && dates ? <span className="sr-only">{dates}</span> : null}
    </>
  )

  const shell = onItemOpen ? (
    <motion.button
      type="button"
      initial={false}
      {...shared}
      layoutDependency={view}
      data-slot="collection-item"
      data-shared={reduced ? undefined : collectionLayoutId(scope, "shell", item.id)}
      className={shellClass}
      onClick={() => onItemOpen(item.id)}
    >
      {inner}
    </motion.button>
  ) : (
    <motion.article
      initial={false}
      {...shared}
      layoutDependency={view}
      data-slot="collection-item"
      data-shared={reduced ? undefined : collectionLayoutId(scope, "shell", item.id)}
      aria-labelledby={titleId}
      className={shellClass}
    >
      {inner}
    </motion.article>
  )

  if (view !== "timeline") return shell

  return (
    <div className="grid items-center gap-3" style={{ gridTemplateColumns: columns }}>
      {shell}
      <BarLane
        item={item}
        domain={domain}
        ticks={ticks}
        todayPercent={todayPercent}
        current={current}
        reduced={reduced}
        className={classNames?.bar}
      />
    </div>
  )
}

function People({
  people,
  label,
  reduced,
  scope,
  id,
  view,
  className,
}: {
  people: readonly CollectionPerson[]
  label: CollectionViewsLabels["people"]
  reduced: boolean
  scope: string
  id: string
  view: CollectionView
  className?: string | undefined
}) {
  if (people.length === 0) return null
  const shown = people.slice(0, 3)
  const extra = people.length - shown.length
  const names = people.map((person) => person.name).join(", ")
  return (
    <motion.div
      initial={false}
      {...collectionSharedMotion(reduced, scope, "people", id)}
      layoutDependency={view}
      data-slot="collection-people"
      data-shared={reduced ? undefined : collectionLayoutId(scope, "people", id)}
      className={cn("flex min-w-0 items-center", className)}
    >
      <span className="sr-only">{label(names)}</span>
      <ul aria-hidden="true" className="flex items-center">
        {shown.map((person) => (
          <li key={person.id} className="-ms-1.5 first:ms-0">
            <Avatar size="sm">
              <AvatarFallback>{initials(person.name)}</AvatarFallback>
            </Avatar>
          </li>
        ))}
      </ul>
      {extra > 0 ? <span className="ms-1 text-xs text-muted-foreground tabular-nums">+{extra}</span> : null}
    </motion.div>
  )
}

function BarLane({
  item,
  domain,
  ticks,
  todayPercent,
  current,
  reduced,
  className,
}: {
  item: CollectionItem
  domain: ReturnType<typeof collectionDomain>
  ticks: ReturnType<typeof collectionTicks>
  todayPercent: number | null
  current: boolean
  reduced: boolean
  className?: string | undefined
}) {
  const start = item.start ? parseCollectionDay(item.start) : null
  const end = item.end ? parseCollectionDay(item.end) : null
  const bar = start != null && end != null ? collectionBar(start, end, domain) : null
  return (
    <div data-slot="collection-clip" dir="ltr" className="relative h-8 min-w-0 overflow-hidden">
      <span aria-hidden="true" className="absolute inset-y-0 start-0 w-px bg-border" />
      {ticks.map((tick) => (
        <span key={tick.time} aria-hidden="true" className="absolute inset-y-0 w-px bg-border/70" style={{ insetInlineStart: `${tick.percent}%` }} />
      ))}
      {todayPercent != null ? (
        <span aria-hidden="true" className="absolute inset-y-0 w-px bg-foreground" style={{ insetInlineStart: `${todayPercent}%` }} />
      ) : null}
      {bar ? (
        <BarMark
          reduced={reduced}
          current={current}
          origin={bar.origin}
          scale={bar.scale}
          className={className}
        />
      ) : null}
    </div>
  )
}

function BarMark({
  reduced,
  current,
  origin,
  scale,
  className,
}: {
  reduced: boolean
  current: boolean
  origin: number
  scale: number
  className?: string | undefined
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    node.style.transformOrigin = "left center"
    if (reduced) {
      node.style.opacity = "1"
      node.style.transform = "scaleX(1)"
      return
    }
    const controls = animate(node, { opacity: [0, 1], scaleX: [0, 1] }, collectionBarMotion(false).transition)
    return () => controls.stop()
  }, [reduced])
  return (
    <span
      ref={ref}
      data-slot="collection-bar"
      data-current={current ? "true" : "false"}
      className={cn("absolute top-1/2 h-2 -mt-1 rounded-md", current ? "bg-primary" : "bg-muted-foreground", className)}
      style={{ width: `${scale * 100}%`, insetInlineStart: `${origin * 100}%`, transformOrigin: "left center", opacity: 1 }}
    />
  )
}
