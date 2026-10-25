"use client"

/**
 * Clean-room candidate row. Stage, score, and actions are props.
 * The row does not read a stage field from the candidate.
 */

import * as React from "react"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ATS_SCORE_MAX,
  candidateScore,
  defaultAtsSort,
  formatAtsDate,
  formatScore,
  personById,
  personInitials,
  resolveAtsLabels,
  sortCandidates,
  sortLabel,
  sourceLabel,
  type AtsCandidate,
  type AtsGetStage,
  type AtsLabels,
  type AtsPerson,
  type AtsSort,
  type AtsSortKey,
  type AtsSlotInfo,
  type AtsStage,
} from "@/registry/retana/lib/ats"
import { StagePill, StageProgress } from "@/registry/retana/ui/stage-progress"

export type CandidateRowProps<TMeta = Record<string, unknown>> = {
  candidate: AtsCandidate<TMeta>
  stageId: string
  stages?: readonly AtsStage[]
  people?: readonly AtsPerson[]
  selected?: boolean
  locale?: string
  timeZone?: string
  labels?: AtsLabels
  layout?: "table" | "stack"
  readOnly?: boolean
  onOpen?: (id: string) => void
  onMoveCandidate?: (id: string, from: string, to: string) => void | Promise<unknown>
  onToggle?: (id: string, selected: boolean) => void
  renderProgress?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
  renderActions?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
}

export type CandidateTableProps<TMeta = Record<string, unknown>> = {
  candidates: readonly AtsCandidate<TMeta>[]
  stages: readonly AtsStage[]
  getStage: AtsGetStage<TMeta>
  people?: readonly AtsPerson[]
  sort?: AtsSort
  onSortChange?: (sort: AtsSort) => void
  selectedIds?: readonly string[]
  onToggle?: (id: string, selected: boolean) => void
  onToggleAll?: (selected: boolean, ids: string[]) => void
  locale?: string
  timeZone?: string
  labels?: Partial<AtsLabels>
  layout?: "table" | "stack"
  readOnly?: boolean
  onOpen?: (id: string) => void
  onMoveCandidate?: (id: string, from: string, to: string) => void | Promise<unknown>
  renderProgress?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
  renderActions?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
  className?: string
}

const COLUMNS: AtsSortKey[] = ["name", "stage", "score", "source", "next"]

function columnLabel(labels: AtsLabels, key: AtsSortKey) {
  if (key === "name") return labels.candidate
  if (key === "stage") return labels.stage
  if (key === "score") return labels.scoreLabel
  if (key === "source") return labels.source
  return labels.nextStep
}

function ScoreBits({ score, label }: { score: number | null; label: string }) {
  const text = formatScore(score)
  const width = score == null ? 0 : Math.max(0, Math.min(100, (score / ATS_SCORE_MAX) * 100))
  return (
    <span className="inline-flex min-w-0 items-center gap-2" aria-label={text ? label : undefined}>
      <span className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-muted" aria-hidden>
        <span className="block h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </span>
      <Star className={cn("size-3.5 shrink-0", text ? "fill-current text-primary" : "text-muted-foreground")} aria-hidden />
      <span className="tabular-nums">{text || "—"}</span>
    </span>
  )
}

export function CandidateRow<TMeta extends Record<string, unknown> = Record<string, unknown>>({
  candidate,
  stageId,
  stages = [],
  people = [],
  selected = false,
  locale = "es-MX",
  timeZone = "America/Mexico_City",
  labels,
  layout = "table",
  readOnly = false,
  onOpen,
  onMoveCandidate,
  onToggle,
  renderProgress,
  renderActions,
}: CandidateRowProps<TMeta>) {
  const copy = labels ?? resolveAtsLabels()
  const stage = stages.find((item) => item.id === stageId)
  const owner = personById(people, candidate.ownerId)
  const score = candidateScore(candidate)
  const when = candidate.nextStep?.at ? formatAtsDate(candidate.nextStep.at, locale, timeZone, "time") : ""
  const slot = { candidate, stageId, stages }
  const years = candidate.years == null ? "" : copy.years(candidate.years)
  const place = [candidate.location, years].filter(Boolean).join(" · ")
  const progress = renderProgress ? (
    renderProgress(slot)
  ) : (
    <StageProgress stages={stages} stageId={stageId} label={stage?.label ?? stageId} />
  )
  const actions = renderActions ? (
    <div className="flex flex-wrap items-center gap-1" aria-label={copy.extraActions}>
      {renderActions(slot)}
    </div>
  ) : null

  const identity = (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="text-xs">{personInitials(candidate.name)}</AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <button
          type="button"
          data-candidate-focus={candidate.id}
          className="block max-w-full truncate rounded-sm text-left text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={copy.openCandidate(candidate.name)}
          onClick={() => onOpen?.(candidate.id)}
          onKeyDown={(event) => {
            if (readOnly || !onMoveCandidate) return
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
            const index = stages.findIndex((item) => item.id === stageId)
            if (index < 0) return
            const delta = event.key === "ArrowRight" ? 1 : -1
            const next = stages[index + delta]
            if (!next) return
            event.preventDefault()
            void onMoveCandidate(candidate.id, stageId, next.id)
          }}
        >
          <span className="break-all" dir="auto">
            {candidate.name}
          </span>
        </button>
        {place ? <span className="block truncate text-xs text-muted-foreground">{place}</span> : null}
      </span>
    </div>
  )

  const checkbox = (
    <Checkbox
      checked={selected}
      onCheckedChange={(value) => onToggle?.(candidate.id, value === true)}
      aria-label={copy.selectCandidate(candidate.name)}
    />
  )

  if (layout === "stack") {
    return (
      <li
        data-slot="candidate-row"
        data-candidate-id={candidate.id}
        data-stage-id={stageId}
        data-selected={selected ? "true" : "false"}
        className={cn("grid gap-2 rounded-lg border border-border bg-card p-3", selected && "bg-accent/40")}
      >
        <div className="flex items-start gap-2">
          {checkbox}
          <div className="min-w-0 flex-1">{identity}</div>
          {owner ? (
            <Avatar className="size-7" aria-label={owner.name}>
              <AvatarFallback className="text-[10px]">{personInitials(owner.name)}</AvatarFallback>
            </Avatar>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StagePill stage={stage} />
          {progress}
          <ScoreBits score={score} label={score == null ? copy.noScore : copy.scoreValue(formatScore(score))} />
        </div>
        <p className="text-xs text-muted-foreground">
          {sourceLabel(copy, candidate.source)}
          {candidate.nextStep ? ` · ${candidate.nextStep.label}${when ? ` · ${when}` : ""}` : ""}
        </p>
        {actions}
      </li>
    )
  }

  return (
    <tr
      data-slot="candidate-row"
      data-candidate-id={candidate.id}
      data-stage-id={stageId}
      data-selected={selected ? "true" : "false"}
      className={cn("border-b border-border", selected && "bg-accent/40")}
    >
      <td className="px-2 py-2 align-middle">{checkbox}</td>
      <td className="min-w-48 px-2 py-2 align-middle">{identity}</td>
      <td className="px-2 py-2 align-middle">
        <div className="flex flex-col items-start gap-1">
          <StagePill stage={stage} />
          {progress}
        </div>
      </td>
      <td className="px-2 py-2 align-middle whitespace-nowrap">
        <ScoreBits score={score} label={score == null ? copy.noScore : copy.scoreValue(formatScore(score))} />
      </td>
      <td className="px-2 py-2 align-middle text-sm">{sourceLabel(copy, candidate.source)}</td>
      <td className="px-2 py-2 align-middle">
        <span className="block max-w-48 truncate text-sm">{candidate.nextStep?.label ?? "—"}</span>
        {when ? <span className="block text-xs text-muted-foreground">{when}</span> : null}
      </td>
      <td className="px-2 py-2 align-middle">
        {owner ? (
          <Avatar className="size-7" aria-label={owner.name}>
            <AvatarFallback className="text-[10px]">{personInitials(owner.name)}</AvatarFallback>
          </Avatar>
        ) : (
          <span className="text-xs text-muted-foreground">{copy.unassigned}</span>
        )}
      </td>
      <td className="px-2 py-2 align-middle">{actions}</td>
    </tr>
  )
}

export function CandidateTable<TMeta extends Record<string, unknown> = Record<string, unknown>>({
  candidates,
  stages,
  getStage,
  people = [],
  sort = defaultAtsSort,
  onSortChange,
  selectedIds = [],
  onToggle,
  onToggleAll,
  locale = "es-MX",
  timeZone = "America/Mexico_City",
  labels: labelOverrides,
  layout = "table",
  readOnly = false,
  onOpen,
  onMoveCandidate,
  renderProgress,
  renderActions,
  className,
}: CandidateTableProps<TMeta>) {
  const labels = resolveAtsLabels(labelOverrides)
  const ordered = React.useMemo(() => sortCandidates(candidates, sort, stages, getStage), [candidates, getStage, sort, stages])
  const ids = ordered.map((candidate) => candidate.id)
  const selected = new Set(selectedIds)
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id))
  const someSelected = ids.some((id) => selected.has(id))

  function toggleSort(key: AtsSortKey) {
    const direction = sort.key === key && sort.direction === "desc" ? "asc" : "desc"
    onSortChange?.({ key, direction })
  }

  const rows = ordered.map((candidate) => (
    <CandidateRow
      key={candidate.id}
      candidate={candidate}
      stageId={getStage(candidate)}
      stages={stages}
      people={people}
      selected={selected.has(candidate.id)}
      locale={locale}
      timeZone={timeZone}
      labels={labels}
      layout={layout}
      readOnly={readOnly}
      onOpen={onOpen}
      onMoveCandidate={onMoveCandidate}
      onToggle={onToggle}
      renderProgress={renderProgress}
      renderActions={renderActions}
    />
  ))

  if (layout === "stack") {
    return (
      <ul data-slot="candidate-table" data-layout="stack" aria-label={labels.listLabel} className={cn("grid gap-2", className)}>
        {rows}
      </ul>
    )
  }

  return (
    <div className={cn("min-w-0 overflow-x-auto", className)}>
      <table data-slot="candidate-table" data-layout="table" className="w-full min-w-[52rem] border-collapse text-left">
        <caption className="sr-only">{labels.listLabel}</caption>
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="px-2 py-2 font-medium" scope="col">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={(value) => onToggleAll?.(value === true, ids)}
                aria-label={labels.selectAll}
              />
            </th>
            {COLUMNS.map((key) => {
              const active = sort.key === key
              const ariaSort = active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"
              return (
                <th key={key} scope="col" aria-sort={ariaSort} className="px-2 py-2 font-medium">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label={labels.sortBy(columnLabel(labels, key))}
                    onClick={() => toggleSort(key)}
                  >
                    {columnLabel(labels, key)}
                    {active ? <span aria-hidden>{sort.direction === "asc" ? "↑" : "↓"}</span> : null}
                  </button>
                </th>
              )
            })}
            <th className="px-2 py-2 font-medium" scope="col">
              {labels.owner}
            </th>
            <th className="px-2 py-2 font-medium" scope="col">
              <span className="sr-only">{labels.extraActions}</span>
            </th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      <p className="px-2 py-2 text-xs text-muted-foreground">
        {labels.showing(ordered.length, ordered.length)} · {labels.sortedBy(sortLabel(labels, sort.key))}
      </p>
    </div>
  )
}
