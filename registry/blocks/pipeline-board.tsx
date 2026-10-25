"use client"

/**
 * Clean-room hiring board. Columns come from `stages`.
 * Placement uses `getStage`. Moves go through `onMoveCandidate` and can roll back.
 */

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS as DndCSS } from "@dnd-kit/utilities"
import { LayoutGrid, List } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { useOptimisticStage, type OptimisticMoveResult } from "@/registry/retana/hooks/use-optimistic-stage"
import {
  ATS_SCORE_MAX,
  ATS_SOURCES,
  ATS_STAGE_DRAG_PREFIX,
  candidateMatchesFilters,
  defaultAtsSort,
  emptyAtsFilters,
  feedbackStageIds,
  groupCandidatesByStage,
  resolveAtsLabels,
  resolveDragStageId,
  sortCandidates,
  sortLabel,
  sourceLabel,
  type AtsCandidate,
  type AtsCriterion,
  type AtsFilters,
  type AtsGetStage,
  type AtsLabels,
  type AtsPerson,
  type AtsSort,
  type AtsStage,
  type AtsSlotInfo,
  type AtsView,
} from "@/registry/retana/lib/ats"
import { CandidateCard } from "@/registry/retana/ui/candidate-card"
import { CandidateTable } from "@/registry/retana/ui/candidate-row"
import { SearchField } from "@/registry/retana/ui/search-field"
import { SegmentedControl } from "@/registry/retana/ui/segmented-control"
import { StagePill } from "@/registry/retana/ui/stage-progress"

export type PipelineBoardProps<TMeta = Record<string, unknown>> = {
  candidates: readonly AtsCandidate<TMeta>[]
  stages: readonly AtsStage[]
  getStage: AtsGetStage<TMeta>
  people?: readonly AtsPerson[]
  criteria?: readonly AtsCriterion[]
  view?: AtsView
  defaultView?: AtsView
  onViewChange?: (view: AtsView) => void
  filters?: AtsFilters
  defaultFilters?: AtsFilters
  onFilterChange?: (filters: AtsFilters) => void
  sort?: AtsSort
  defaultSort?: AtsSort
  onSortChange?: (sort: AtsSort) => void
  selectedIds?: readonly string[]
  defaultSelectedIds?: readonly string[]
  onSelectionChange?: (ids: readonly string[]) => void
  /** When false, the parent already applies the optimistic stage. */
  optimistic?: boolean
  canMove?: (from: string, to: string) => boolean
  onMoveCandidate?: (id: string, from: string, to: string) => void | Promise<unknown>
  onOpenCandidate?: (id: string) => void
  onCreateAssessment?: (id: string) => void
  renderProgress?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
  renderActions?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
  onRetry?: () => void
  readOnly?: boolean
  loading?: boolean
  error?: string | null
  locale?: string
  timeZone?: string
  labels?: Partial<AtsLabels>
  className?: string
  toolbarClassName?: string
  columnClassName?: string
  cardClassName?: string
}

export function PipelineBoard<TMeta extends Record<string, unknown> = Record<string, unknown>>({
  candidates,
  stages,
  getStage,
  people = [],
  criteria = [],
  view: viewProp,
  defaultView = "kanban",
  onViewChange,
  filters: filtersProp,
  defaultFilters = emptyAtsFilters,
  onFilterChange,
  sort: sortProp,
  defaultSort = defaultAtsSort,
  onSortChange,
  selectedIds: selectedProp,
  defaultSelectedIds = [],
  onSelectionChange,
  optimistic = true,
  canMove,
  onMoveCandidate,
  onOpenCandidate,
  onCreateAssessment,
  renderProgress,
  renderActions,
  onRetry,
  readOnly = false,
  loading = false,
  error = null,
  locale = "es-MX",
  timeZone = "America/Mexico_City",
  labels: labelOverrides,
  className,
  toolbarClassName,
  columnClassName,
  cardClassName,
}: PipelineBoardProps<TMeta>) {
  const labels = resolveAtsLabels(labelOverrides)
  const narrow = useNarrowScreen()
  const [view, setView] = useControllable(viewProp, defaultView, onViewChange)
  const [filters, setFilters] = useControllable(filtersProp, defaultFilters, onFilterChange)
  const [sort, setSort] = useControllable(sortProp, defaultSort, onSortChange)
  const [selectedIds, setSelectedIds] = useControllable(selectedProp, defaultSelectedIds, onSelectionChange)
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState("")
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const focusId = React.useRef<string | null>(null)
  const [focusNonce, setFocusNonce] = React.useState(0)
  const feedbackIds = React.useMemo(() => feedbackStageIds(stages), [stages])

  const local = useOptimisticStage(candidates, getStage, optimistic ? { canMove, onMoveCandidate: wrapHost(onMoveCandidate) } : undefined)
  const resolve = optimistic ? local.resolve : getStage

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const visible = React.useMemo(
    () =>
      candidates.filter((candidate) =>
        candidateMatchesFilters(candidate, filters, {
          getStage: resolve,
          people,
          stages,
          criteria,
          feedbackStageIds: feedbackIds,
          labels,
          timeZone,
        }),
      ),
    [candidates, criteria, feedbackIds, filters, labels, people, resolve, stages, timeZone],
  )
  const groups = React.useMemo(() => groupCandidatesByStage(visible, stages, resolve), [resolve, stages, visible])
  const ordered = React.useMemo(() => sortCandidates(visible, sort, stages, resolve), [resolve, sort, stages, visible])
  const placed = React.useMemo(() => candidates.map((candidate) => ({ id: candidate.id, stageId: resolve(candidate) })), [candidates, resolve])
  const active = candidates.find((candidate) => candidate.id === activeId) ?? null

  const state = loading ? "loading" : error ? "error" : candidates.length === 0 ? "empty" : visible.length === 0 ? "nomatch" : "ready"
  const showKanban = state === "ready" && view === "kanban" && !narrow

  React.useEffect(() => {
    const id = focusId.current
    if (!id) return
    focusId.current = null
    const escaped = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(id) : id
    document.querySelector<HTMLElement>(`[data-candidate-focus="${escaped}"]`)?.focus()
  }, [focusNonce, visible, view])

  function stageName(id: string) {
    return stages.find((stage) => stage.id === id)?.label ?? id
  }

  function announce(result: OptimisticMoveResult, id: string, from: string, to: string) {
    const candidate = candidates.find((item) => item.id === id)
    const name = candidate?.name ?? id
    if (result.ok) setAnnouncement(labels.moved(name, stageName(to)))
    else if (result.reason === "rejected") setAnnouncement(labels.moveFailed(name, stageName(from)))
    else setAnnouncement(labels.moveBlocked)
  }

  async function commit(id: string, from: string, to: string, source: "pointer" | "keyboard") {
    if (readOnly || from === to) return
    if (source === "keyboard") {
      focusId.current = id
      setFocusNonce((nonce) => nonce + 1)
    }
    if (optimistic) {
      const result = await local.move(id, from, to)
      announce(result, id, from, to)
      return
    }
    try {
      await onMoveCandidate?.(id, from, to)
    } catch {
      setAnnouncement(labels.moveFailed(candidates.find((item) => item.id === id)?.name ?? id, stageName(from)))
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const overId = event.over ? String(event.over.id) : ""
    const to = resolveDragStageId(overId, placed)
    const id = String(event.active.id)
    const from = placed.find((item) => item.id === id)?.stageId
    if (!to || !from) return
    void commit(id, from, to, "pointer")
  }

  function patchFilters(patch: Partial<AtsFilters>) {
    setFilters({ ...filters, ...patch })
  }

  const showFilters = !narrow || filtersOpen

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(event: DragStartEvent) => setActiveId(String(event.active.id))}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{
        announcements: {
          onDragStart({ active: item }) {
            const name = candidates.find((candidate) => candidate.id === String(item.id))?.name ?? String(item.id)
            return labels.pickedUp(name)
          },
          onDragOver({ over }) {
            if (!over) return ""
            const id = String(over.id)
            return labels.overColumn(id.startsWith(ATS_STAGE_DRAG_PREFIX) ? stageName(id.slice(ATS_STAGE_DRAG_PREFIX.length)) : stageName(resolveDragStageId(id, placed) ?? ""))
          },
          onDragEnd({ active: item, over }) {
            const name = candidates.find((candidate) => candidate.id === String(item.id))?.name ?? String(item.id)
            return over ? labels.moved(name, stageName(resolveDragStageId(String(over.id), placed) ?? "")) : labels.dropped
          },
          onDragCancel() {
            return labels.cancelled
          },
        },
      }}
    >
      <div
        data-slot="pipeline-board"
        data-state={state}
        data-view={view}
        data-layout={showKanban ? "kanban" : "stack"}
        data-readonly={readOnly ? "true" : "false"}
        role="region"
        aria-label={labels.boardLabel}
        aria-busy={loading || undefined}
        className={cn("flex h-full min-h-0 w-full min-w-0 flex-col gap-3", className)}
      >
        <div className={cn("flex shrink-0 flex-col gap-3", toolbarClassName)}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <SearchField
              className="min-w-0 flex-1"
              label={labels.searchLabel}
              placeholder={labels.searchPlaceholder}
              value={filters.query}
              onValueChange={(query) => patchFilters({ query })}
            />
            {narrow ? (
              <Button
                type="button"
                variant="outline"
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen((open) => !open)}
              >
                {filtersOpen ? labels.hideFilters : labels.showFilters}
              </Button>
            ) : null}
            <SegmentedControl
              className="shrink-0"
              label={labels.viewLabel}
              value={view}
              onValueChange={(next) => {
                if (next === "kanban" || next === "list") setView(next)
              }}
              options={[
                { value: "kanban", label: labels.kanbanView, icon: <LayoutGrid aria-hidden /> },
                { value: "list", label: labels.listView, icon: <List aria-hidden /> },
              ]}
            />
          </div>
          {showFilters ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="grid gap-1 text-xs text-muted-foreground">
                {labels.from}
                <input
                  type="date"
                  aria-label={labels.from}
                  className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground"
                  value={filters.from ?? ""}
                  onChange={(event) => patchFilters({ from: event.target.value || null })}
                />
              </label>
              <label className="grid gap-1 text-xs text-muted-foreground">
                {labels.to}
                <input
                  type="date"
                  aria-label={labels.to}
                  className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground"
                  value={filters.to ?? ""}
                  onChange={(event) => patchFilters({ to: event.target.value || null })}
                />
              </label>
              <label className="grid gap-1 text-xs text-muted-foreground">
                {labels.sourceLabel}
                <select
                  aria-label={labels.sourceLabel}
                  className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground"
                  value={filters.source ?? ""}
                  onChange={(event) => patchFilters({ source: event.target.value || null })}
                >
                  <option value="">{labels.allSources}</option>
                  {ATS_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {sourceLabel(labels, source)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">{labels.scoreRange}</span>
                <Slider
                  aria-label={labels.scoreRange}
                  min={0}
                  max={ATS_SCORE_MAX}
                  step={0.1}
                  value={[filters.scoreMin ?? 0, filters.scoreMax ?? ATS_SCORE_MAX]}
                  onValueChange={(value) => {
                    const [min, max] = value
                    patchFilters({
                      scoreMin: min == null || min <= 0 ? null : min,
                      scoreMax: max == null || max >= ATS_SCORE_MAX ? null : max,
                    })
                  }}
                />
              </div>
            </div>
          ) : null}
          {readOnly ? <p className="text-xs text-muted-foreground">{labels.readOnlyNote}</p> : null}
        </div>

        {state === "loading" ? (
          <div role="status" aria-label={labels.loadingLabel} className="flex min-h-40 gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex w-72 flex-col gap-2 rounded-xl bg-muted/40 p-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : null}
        {state === "error" ? (
          <div role="alert" className="flex min-h-40 flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium">{labels.errorTitle}</p>
            <p className="max-w-sm text-sm break-all text-muted-foreground">{error}</p>
            {onRetry ? (
              <Button type="button" onClick={onRetry}>
                {labels.retry}
              </Button>
            ) : null}
          </div>
        ) : null}
        {state === "empty" || state === "nomatch" ? (
          <div className="flex min-h-40 flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium">{state === "empty" ? labels.emptyTitle : labels.noMatchesTitle}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{state === "empty" ? labels.emptyHint : labels.noMatchesHint}</p>
          </div>
        ) : null}

        {showKanban ? (
          <div className="flex min-h-0 w-full min-w-0 flex-1 snap-x gap-3 overflow-x-auto pb-1">
            {groups.map((group) => (
              <StageColumn key={group.stage.id} id={`${ATS_STAGE_DRAG_PREFIX}${group.stage.id}`} label={group.stage.label} className={columnClassName}>
                <header className="flex items-center gap-2 px-1">
                  <StagePill stage={group.stage} />
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground tabular-nums">{group.candidates.length}</span>
                </header>
                <SortableContext items={group.candidates.map((candidate) => candidate.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto">
                    {group.candidates.length === 0 ? <p className="px-1 py-6 text-center text-xs text-muted-foreground">{labels.emptyColumn}</p> : null}
                    {group.candidates.map((candidate) => (
                      <SortableCard
                        key={candidate.id}
                        candidate={candidate}
                        stageId={resolve(candidate)}
                        stages={stages}
                        disabled={readOnly}
                        locale={locale}
                        timeZone={timeZone}
                        labels={labels}
                        className={cardClassName}
                        canMove={canMove}
                        onOpen={onOpenCandidate}
                        onMoveCandidate={(id, from, to) => commit(id, from, to, "keyboard")}
                        onCreateAssessment={onCreateAssessment}
                        renderProgress={renderProgress}
                        renderActions={renderActions}
                      />
                    ))}
                  </div>
                </SortableContext>
              </StageColumn>
            ))}
          </div>
        ) : null}

        {state === "ready" && !showKanban ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <CandidateTable
              candidates={ordered}
              stages={stages}
              getStage={resolve}
              people={people}
              sort={sort}
              onSortChange={setSort}
              selectedIds={selectedIds}
              onToggle={(id, on) => {
                const next = on ? [...selectedIds, id] : selectedIds.filter((item) => item !== id)
                setSelectedIds(next)
              }}
              onToggleAll={(on, ids) => setSelectedIds(on ? ids : [])}
              locale={locale}
              timeZone={timeZone}
              labels={labels}
              layout={narrow ? "stack" : "table"}
              readOnly={readOnly}
              onOpen={onOpenCandidate}
              onMoveCandidate={(id, from, to) => commit(id, from, to, "keyboard")}
              renderProgress={renderProgress}
              renderActions={renderActions}
            />
            <p className="sr-only">
              {labels.showing(ordered.length, candidates.length)} · {labels.sortedBy(sortLabel(labels, sort.key))}
            </p>
          </div>
        ) : null}

        <div role="status" aria-live="polite" aria-atomic="true" data-slot="pipeline-announcement" className="sr-only">
          {announcement}
        </div>
      </div>
      <DragOverlay>
        {active ? (
          <article className="rounded-lg border border-border bg-card p-3 shadow-md">
            <p className="line-clamp-2 text-sm font-medium break-all" dir="auto">
              {active.name}
            </p>
          </article>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function wrapHost(onMoveCandidate?: (id: string, from: string, to: string) => void | Promise<unknown>) {
  if (!onMoveCandidate) return undefined
  return async (id: string, from: string, to: string) => {
    await onMoveCandidate(id, from, to)
  }
}

function StageColumn({ id, label, className, children }: { id: string; label: string; className?: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <section
      ref={setNodeRef}
      data-slot="ats-column"
      aria-label={label}
      className={cn("flex w-72 max-w-full shrink-0 snap-start flex-col gap-2 rounded-xl bg-muted/40 p-2", isOver && "ring-2 ring-ring", className)}
    >
      {children}
    </section>
  )
}

function SortableCard<TMeta extends Record<string, unknown>>(props: {
  candidate: AtsCandidate<TMeta>
  stageId: string
  stages: readonly AtsStage[]
  disabled: boolean
  locale: string
  timeZone: string
  labels: AtsLabels
  className?: string
  canMove?: (from: string, to: string) => boolean
  onOpen?: (id: string) => void
  onMoveCandidate: (id: string, from: string, to: string) => void | Promise<unknown>
  onCreateAssessment?: (id: string) => void
  renderProgress?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
  renderActions?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.candidate.id,
    disabled: props.disabled,
  })
  const style: React.CSSProperties = {
    transform: DndCSS.Transform.toString(transform),
    transition,
  }
  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-40")}>
      <CandidateCard
        candidate={props.candidate}
        stageId={props.stageId}
        stages={props.stages}
        locale={props.locale}
        timeZone={props.timeZone}
        labels={props.labels}
        readOnly={props.disabled}
        canMove={props.canMove}
        onOpen={props.onOpen}
        onMoveCandidate={props.onMoveCandidate}
        onCreateAssessment={props.onCreateAssessment}
        renderProgress={props.renderProgress}
        renderActions={props.renderActions}
        dragHandleProps={props.disabled ? undefined : { ...attributes, ...listeners }}
        className={props.className}
      />
    </div>
  )
}

function useControllable<T>(value: T | undefined, fallback: T, onChange?: (value: T) => void) {
  const [uncontrolled, setUncontrolled] = React.useState(fallback)
  const current = value !== undefined ? value : uncontrolled
  const setValue = React.useCallback(
    (next: T) => {
      if (value === undefined) setUncontrolled(next)
      onChange?.(next)
    },
    [onChange, value],
  )
  return [current, setValue] as const
}

function useNarrowScreen() {
  return React.useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia("(max-width: 767px)")
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  )
}
