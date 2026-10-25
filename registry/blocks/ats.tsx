"use client"

/**
 * Clean-room hiring workspace.
 * Pass candidates, stages, and getStage. Nothing here writes a backend.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useOptimisticStage } from "@/registry/retana/hooks/use-optimistic-stage"
import {
  candidateMatchesFilters,
  countAppliedInMonth,
  daysOpen,
  emptyAtsFilters,
  feedbackStageIds,
  formatAtsDate,
  formatPercent,
  funnelSteps,
  personById,
  personInitials,
  resolveAtsLabels,
  type AtsCandidate,
  type AtsCriterion,
  type AtsCriterionRating,
  type AtsFilters,
  type AtsGetStage,
  type AtsInterviewSlot,
  type AtsJob,
  type AtsLabels,
  type AtsPerson,
  type AtsScorecardDraft,
  type AtsStage,
  type AtsSlotInfo,
  type AtsView,
} from "@/registry/retana/lib/ats"
import { AssessmentForm } from "@/registry/retana/ui/assessment-form"
import { CandidateDetail } from "@/registry/retana/ui/candidate-detail"
import { PipelineBoard } from "@/registry/retana/blocks/pipeline-board"

export type AtsProps<TMeta = Record<string, unknown>, TJobMeta = Record<string, unknown>> = {
  job: AtsJob<TJobMeta>
  candidates: readonly AtsCandidate<TMeta>[]
  stages: readonly AtsStage[]
  getStage: AtsGetStage<TMeta>
  people?: readonly AtsPerson[]
  criteria?: readonly AtsCriterion[]
  author?: AtsPerson
  view?: AtsView
  defaultView?: AtsView
  onViewChange?: (view: AtsView) => void
  filters?: AtsFilters
  defaultFilters?: AtsFilters
  onFilterChange?: (filters: AtsFilters) => void
  selectedId?: string | null
  defaultSelectedId?: string | null
  onSelectedIdChange?: (id: string | null) => void
  canMove?: (from: string, to: string) => boolean
  onMoveCandidate?: (id: string, from: string, to: string) => void | Promise<void>
  onRateCriterion?: (candidateId: string, key: string, rating: AtsCriterionRating) => void
  onSubmitScorecard?: (candidateId: string, scorecard: AtsScorecardDraft) => void | Promise<void>
  onCreateAssessment?: (id: string) => void
  onScheduleInterview?: (id: string, slot: AtsInterviewSlot) => void | Promise<void>
  onSendEmail?: (id: string) => void
  onAddNote?: (id: string, body: string) => void | Promise<void>
  onOpenCandidate?: (id: string) => void
  onShare?: (jobId: string) => void
  renderProgress?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
  renderActions?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
  onRetry?: () => void
  readOnly?: boolean
  loading?: boolean
  error?: string | null
  now?: string | Date
  locale?: string
  timeZone?: string
  labels?: Partial<AtsLabels>
  className?: string
  sheetClassName?: string
}

export function Ats<TMeta extends Record<string, unknown> = Record<string, unknown>, TJobMeta extends Record<string, unknown> = Record<string, unknown>>({
  job,
  candidates,
  stages,
  getStage,
  people = [],
  criteria = [],
  author,
  view: viewProp,
  defaultView = "kanban",
  onViewChange,
  filters: filtersProp,
  defaultFilters = emptyAtsFilters,
  onFilterChange,
  selectedId: selectedProp,
  defaultSelectedId = null,
  onSelectedIdChange,
  canMove,
  onMoveCandidate,
  onRateCriterion,
  onSubmitScorecard,
  onCreateAssessment,
  onScheduleInterview,
  onSendEmail,
  onAddNote,
  onOpenCandidate,
  onShare,
  renderProgress,
  renderActions,
  onRetry,
  readOnly = false,
  loading = false,
  error = null,
  now,
  locale = "es-MX",
  timeZone = "America/Mexico_City",
  labels: labelOverrides,
  className,
  sheetClassName,
}: AtsProps<TMeta, TJobMeta>) {
  const labels = resolveAtsLabels(labelOverrides)
  const narrow = useNarrowScreen()
  const [view, setView] = useControllable(viewProp, defaultView, onViewChange)
  const [filters, setFilters] = useControllable(filtersProp, defaultFilters, onFilterChange)
  const [selectedId, setSelectedId] = useControllable(selectedProp, defaultSelectedId, onSelectedIdChange)
  const [mode, setMode] = React.useState<"detail" | "assessment">("detail")
  const [announcement, setAnnouncement] = React.useState("")
  const clock = now ?? new Date()
  const feedbackIds = React.useMemo(() => feedbackStageIds(stages), [stages])
  const optimistic = useOptimisticStage(candidates, getStage, {
    canMove,
    onMoveCandidate,
  })
  const resolve = optimistic.resolve

  const funnel = React.useMemo(() => funnelSteps(candidates, stages, resolve), [candidates, resolve, stages])
  const monthCount = countAppliedInMonth(candidates, clock, timeZone)
  const manager = personById(people, job.hiringManagerId)
  const openDays = job.status === "paused" || job.status === "closed" ? null : daysOpen(job.openedAt, clock, timeZone)
  const baseFilters = { ...filters, stageId: null, needsFeedback: false }
  const base = candidates.filter((candidate) =>
    candidateMatchesFilters(candidate, baseFilters, {
      getStage: resolve,
      people,
      stages,
      criteria,
      feedbackStageIds: feedbackIds,
      labels,
      timeZone,
    }),
  )
  const ordered = stages.flatMap((stage) => candidates.filter((candidate) => resolve(candidate) === stage.id))
  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? null
  const selectedIndex = selected ? ordered.findIndex((candidate) => candidate.id === selected.id) : -1
  const previous = selectedIndex > 0 ? ordered[selectedIndex - 1] : null
  const next = selectedIndex >= 0 ? ordered[selectedIndex + 1] : null

  function stageLabel(id: string) {
    return stages.find((stage) => stage.id === id)?.label ?? id
  }

  async function commit(id: string, from: string, to: string) {
    const result = await optimistic.move(id, from, to)
    const name = candidates.find((candidate) => candidate.id === id)?.name ?? id
    if (result.ok) setAnnouncement(labels.moved(name, stageLabel(to)))
    else if (result.reason === "rejected") setAnnouncement(labels.moveFailed(name, stageLabel(from)))
    else setAnnouncement(labels.moveBlocked)
  }

  function open(id: string) {
    setSelectedId(id)
    setMode("detail")
    onOpenCandidate?.(id)
  }

  function assess(id: string) {
    setSelectedId(id)
    setMode("assessment")
    onCreateAssessment?.(id)
  }

  const meta = [job.department, job.location, job.employment, manager ? `${labels.hiringManager} ${manager.name}` : ""]
    .filter(Boolean)
    .join(" · ")
  const goal = job.goalAt ? labels.goalBy(formatAtsDate(job.goalAt, locale, timeZone, "medium")) : ""
  const hired =
    job.hired != null && job.headcount != null ? labels.hiredProgress(job.hired, job.headcount) : ""

  return (
    <div data-slot="ats" data-view={view} className={cn("flex h-full min-h-0 w-full min-w-0 flex-col gap-4", className)}>
      <header className="flex shrink-0 flex-col gap-3">
        <p className="truncate text-sm text-muted-foreground">
          {labels.jobs} / {job.title}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">{job.title}</h2>
          {job.status === "paused" ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{labels.statusPaused}</span> : null}
          {job.status === "closed" ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{labels.statusClosed}</span> : null}
          {openDays != null ? <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">{labels.statusOpen(openDays)}</span> : null}
        </div>
        {meta ? <p className="text-sm text-muted-foreground">{meta}</p> : null}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" aria-label={labels.boardLabel}>
            {funnel.map((step, index) => {
              const previousStage = funnel[index - 1]?.stage
              const caption =
                index === 0
                  ? labels.thisMonth(monthCount)
                  : step.stage.id === stages[stages.length - 1]?.id && job.hired != null
                    ? labels.accepted(job.hired)
                    : previousStage
                      ? labels.ofPrevious(formatPercent(step.ofPrevious), previousStage.label)
                      : ""
              return (
                <div key={step.stage.id} className="min-w-0 rounded-xl border border-border bg-card px-3 py-2">
                  <p className="truncate text-xs text-muted-foreground">{step.stage.label}</p>
                  <p className="text-2xl font-semibold tabular-nums">{step.count}</p>
                  <p className="truncate text-xs text-muted-foreground">{caption}</p>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {people.slice(0, 4).map((person) => (
                <Avatar key={person.id} className="-ms-1.5 size-8 ring-2 ring-background first:ms-0" aria-label={person.name}>
                  <AvatarFallback className="text-[10px]">{personInitials(person.name)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            {onShare ? (
              <Button type="button" variant="outline" size="sm" onClick={() => onShare(job.id)}>
                {labels.share}
              </Button>
            ) : null}
          </div>
        </div>
        {hired || goal ? <p className="text-sm text-muted-foreground">{[hired, goal].filter(Boolean).join(" · ")}</p> : null}
        <div role="group" aria-label={labels.filters} className="flex gap-2 overflow-x-auto pb-1">
          <FilterTab
            pressed={!filters.stageId && !filters.needsFeedback}
            label={`${labels.all} ${base.length}`}
            onClick={() => setFilters({ ...filters, stageId: null, needsFeedback: false })}
          />
          {stages.map((stage) => (
            <FilterTab
              key={stage.id}
              pressed={filters.stageId === stage.id && !filters.needsFeedback}
              label={`${stage.label} ${base.filter((candidate) => resolve(candidate) === stage.id).length}`}
              onClick={() => setFilters({ ...filters, stageId: stage.id, needsFeedback: false })}
            />
          ))}
          <FilterTab
            pressed={filters.needsFeedback}
            label={`${labels.needsFeedback} ${
              base.filter((candidate) =>
                candidateMatchesFilters(candidate, { ...baseFilters, needsFeedback: true }, {
                  getStage: resolve,
                  people,
                  stages,
                  criteria,
                  feedbackStageIds: feedbackIds,
                  labels,
                  timeZone,
                }),
              ).length
            }`}
            onClick={() => setFilters({ ...filters, stageId: null, needsFeedback: true })}
          />
        </div>
      </header>

      <PipelineBoard
        className="min-h-0 flex-1"
        candidates={candidates}
        stages={stages}
        getStage={resolve}
        people={people}
        criteria={criteria}
        view={view}
        onViewChange={setView}
        filters={filters}
        onFilterChange={setFilters}
        optimistic={false}
        canMove={canMove}
        onMoveCandidate={commit}
        onOpenCandidate={open}
        onCreateAssessment={assess}
        renderProgress={renderProgress}
        renderActions={renderActions}
        readOnly={readOnly}
        loading={loading}
        error={error}
        onRetry={onRetry}
        locale={locale}
        timeZone={timeZone}
        labels={labels}
      />

      <div role="status" aria-live="polite" aria-atomic="true" data-slot="ats-announcement" className="sr-only">
        {announcement}
      </div>

      <Sheet open={Boolean(selected)} onOpenChange={(openSheet) => { if (!openSheet) setSelectedId(null) }}>
        <SheetContent
          side="right"
          showCloseButton={false}
          style={narrow ? { width: "100%", maxWidth: "none" } : { width: "min(80vw, 72rem)", maxWidth: "none" }}
          className={cn("gap-0 overflow-hidden p-0 sm:max-w-none", sheetClassName)}
        >
          <SheetTitle className="sr-only">{selected ? selected.name : labels.detailTitle}</SheetTitle>
          <SheetDescription className="sr-only">{labels.shortcuts}</SheetDescription>
          {selected && mode === "assessment" ? (
            <AssessmentForm
              candidate={selected}
              criteria={criteria}
              author={author}
              labels={labels}
              readOnly={readOnly}
              onCancel={() => setMode("detail")}
              onRateCriterion={onRateCriterion}
              onSubmit={async (scorecard) => {
                await onSubmitScorecard?.(selected.id, scorecard)
                setMode("detail")
              }}
            />
          ) : null}
          {selected && mode === "detail" ? (
            <CandidateDetail
              candidate={selected}
              stageId={resolve(selected)}
              stages={stages}
              people={people}
              criteria={criteria}
              position={selectedIndex + 1}
              total={ordered.length}
              locale={locale}
              timeZone={timeZone}
              labels={labels}
              readOnly={readOnly}
              canMove={canMove}
              onClose={() => setSelectedId(null)}
              onPrevious={previous ? () => open(previous.id) : undefined}
              onNext={next ? () => open(next.id) : undefined}
              onMoveCandidate={commit}
              onSendEmail={onSendEmail}
              onScheduleInterview={onScheduleInterview}
              onAddNote={onAddNote}
              onCreateAssessment={assess}
              renderProgress={renderProgress}
              renderActions={renderActions}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function FilterTab({ pressed, label, onClick }: { pressed: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "shrink-0 rounded-full border border-border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        pressed && "bg-foreground text-background",
      )}
      onClick={onClick}
    >
      {label}
    </button>
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

export type {
  AtsCandidate,
  AtsCriterion,
  AtsFilters,
  AtsGetStage,
  AtsJob,
  AtsLabels,
  AtsPerson,
  AtsScorecardDraft,
  AtsStage,
  AtsView,
} from "@/registry/retana/lib/ats"
