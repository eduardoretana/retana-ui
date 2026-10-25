"use client"

/**
 * Clean-room candidate card for a hiring board.
 * The stage id is passed in. This file does not read a stage off the candidate.
 */

import * as React from "react"
import { GripVertical, MoreHorizontal, Plus, Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ATS_SCORE_MAX,
  candidateScore,
  formatAtsDate,
  formatScore,
  personInitials,
  resolveAtsLabels,
  scoresByStage,
  type AtsCandidate,
  type AtsLabels,
  type AtsSlotInfo,
  type AtsStage,
} from "@/registry/retana/lib/ats"
import { StageProgress } from "@/registry/retana/ui/stage-progress"

export type CandidateCardProps<TMeta = Record<string, unknown>> = {
  candidate: AtsCandidate<TMeta>
  stageId: string
  stages?: readonly AtsStage[]
  locale?: string
  timeZone?: string
  labels?: Partial<AtsLabels>
  readOnly?: boolean
  selected?: boolean
  canMove?: (from: string, to: string) => boolean
  onOpen?: (id: string) => void
  onMoveCandidate?: (id: string, from: string, to: string) => void | Promise<unknown>
  onCreateAssessment?: (id: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
  renderProgress?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
  renderActions?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
  className?: string
}

function isRtl(node: HTMLElement) {
  return getComputedStyle(node).direction === "rtl"
}

export function CandidateCard<TMeta extends Record<string, unknown> = Record<string, unknown>>({
  candidate,
  stageId,
  stages = [],
  locale = "es-MX",
  timeZone = "America/Mexico_City",
  labels: labelOverrides,
  readOnly = false,
  selected = false,
  canMove,
  onOpen,
  onMoveCandidate,
  onCreateAssessment,
  dragHandleProps,
  renderProgress,
  renderActions,
  className,
}: CandidateCardProps<TMeta>) {
  const labels = resolveAtsLabels(labelOverrides)
  const stage = stages.find((item) => item.id === stageId)
  const score = candidateScore(candidate)
  const scoreText = formatScore(score)
  const applied = formatAtsDate(candidate.appliedAt, locale, timeZone, "short")
  const breakdown = scoresByStage(candidate, stages)
  const slot = { candidate, stageId, stages }
  const tags = candidate.tags ?? []

  function moveTo(to: string) {
    if (readOnly || !onMoveCandidate || to === stageId) return
    void onMoveCandidate(candidate.id, stageId, to)
  }

  function onTitleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (readOnly || !onMoveCandidate) return
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    const index = stages.findIndex((item) => item.id === stageId)
    if (index < 0) return
    const forward = event.key === "ArrowRight" ? 1 : -1
    const delta = isRtl(event.currentTarget) ? -forward : forward
    const next = stages[index + delta]
    if (!next) return
    event.preventDefault()
    moveTo(next.id)
  }

  return (
    <article
      data-slot="candidate-card"
      data-candidate-id={candidate.id}
      data-stage-id={stageId}
      data-selected={selected ? "true" : "false"}
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm",
        selected && "ring-2 ring-ring",
        className,
      )}
    >
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          className="mt-0.5 text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-default"
          aria-label={labels.dragCandidate(candidate.name)}
          {...(readOnly ? {} : dragHandleProps)}
          disabled={readOnly || !dragHandleProps}
        >
          <GripVertical className="size-3.5" aria-hidden />
        </button>
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{personInitials(candidate.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            data-candidate-focus={candidate.id}
            className="w-full rounded-sm text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={labels.openCandidate(candidate.name)}
            onClick={() => onOpen?.(candidate.id)}
            onKeyDown={onTitleKeyDown}
          >
            <span className="line-clamp-2 text-sm font-medium break-all" dir="auto">
              {candidate.name}
            </span>
          </button>
          <p className="text-xs text-muted-foreground">{applied ? labels.appliedOn(applied) : labels.noAppliedDate}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={labels.actionsFor(candidate.name)}>
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onOpen?.(candidate.id)}>{labels.open}</DropdownMenuItem>
            <DropdownMenuLabel>{labels.moveTo}</DropdownMenuLabel>
            {stages.map((item) => {
              const blocked = item.id === stageId || (canMove ? !canMove(stageId, item.id) : false)
              return (
                <DropdownMenuItem key={item.id} disabled={readOnly || !onMoveCandidate || blocked} onSelect={() => moveTo(item.id)}>
                  {item.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className="inline-flex items-center gap-1 rounded-sm text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={scoreText ? labels.scoreValue(scoreText) : labels.noScore}
              >
                <Star className={cn("size-3.5", scoreText ? "fill-current text-primary" : "text-muted-foreground")} aria-hidden />
                <span className="tabular-nums">{scoreText || labels.noScore}</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <div className="grid gap-1 text-xs">
                <p className="font-medium">{labels.stageScores}</p>
                {breakdown.length === 0 ? (
                  <p>{scoreText ? labels.scoreOf(scoreText, ATS_SCORE_MAX) : labels.noScore}</p>
                ) : (
                  breakdown.map((item) => <p key={item.stageId}>{labels.stageScore(item.label, formatScore(item.score))}</p>)
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {renderProgress ? renderProgress(slot) : <StageProgress stages={stages} stageId={stageId} label={stage?.label ?? stageId} />}
      </div>

      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <li key={tag.id} className="max-w-full truncate rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {tag.label}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-w-0"
          disabled={readOnly}
          aria-label={labels.addAssessmentFor(candidate.name)}
          onClick={() => onCreateAssessment?.(candidate.id)}
        >
          <Plus aria-hidden />
          <span className="truncate">{labels.addAssessment}</span>
        </Button>
        {renderActions ? (
          <div className="flex min-w-0 flex-wrap items-center gap-1" aria-label={labels.extraActions}>
            {renderActions(slot)}
          </div>
        ) : null}
      </div>
    </article>
  )
}
