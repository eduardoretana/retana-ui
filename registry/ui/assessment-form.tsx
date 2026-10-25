"use client"

/**
 * Clean-room evaluation form.
 * Submitting emits `{ criteria, overall, verdict }` and does not write the candidate.
 */

import * as React from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  ATS_SCORE_MAX,
  ATS_VERDICTS,
  average,
  buildScorecard,
  formatScore,
  personInitials,
  resolveAtsLabels,
  verdictLabel,
  type AtsCandidate,
  type AtsCriterion,
  type AtsCriterionRating,
  type AtsLabels,
  type AtsPerson,
  type AtsScorecardDraft,
  type AtsVerdict,
} from "@/registry/retana/lib/ats"

export type AssessmentFormProps<TMeta = Record<string, unknown>> = {
  candidate: AtsCandidate<TMeta>
  criteria: readonly AtsCriterion[]
  author?: AtsPerson
  labels?: Partial<AtsLabels>
  readOnly?: boolean
  onRateCriterion?: (candidateId: string, key: string, rating: AtsCriterionRating) => void
  onSubmit?: (scorecard: AtsScorecardDraft) => void | Promise<void>
  onCancel?: () => void
  className?: string
}

type Line = { rating: number; comment: string; saved: boolean }

export function AssessmentForm<TMeta extends Record<string, unknown> = Record<string, unknown>>({
  candidate,
  criteria,
  author,
  labels: labelOverrides,
  readOnly = false,
  onRateCriterion,
  onSubmit,
  onCancel,
  className,
}: AssessmentFormProps<TMeta>) {
  const labels = resolveAtsLabels(labelOverrides)
  const [lines, setLines] = React.useState<Record<string, Line>>({})
  const [openKey, setOpenKey] = React.useState<string | null>(null)
  const [verdict, setVerdict] = React.useState<AtsVerdict | "">("")
  const [sent, setSent] = React.useState("")
  const [pending, setPending] = React.useState(false)

  const rated = criteria.flatMap((criterion) => {
    const line = lines[criterion.key]
    if (!line?.rating) return []
    return [{ key: criterion.key, label: criterion.label, rating: line.rating, comment: line.comment }]
  })
  const live = average(rated.map((item) => item.rating))
  const liveText = formatScore(live)

  function patchLine(criterion: AtsCriterion, patch: Partial<Line>) {
    setLines((current) => {
      const previous = current[criterion.key] ?? { rating: 0, comment: "", saved: false }
      return { ...current, [criterion.key]: { ...previous, ...patch } }
    })
  }

  function rate(criterion: AtsCriterion, rating: number) {
    const comment = lines[criterion.key]?.comment ?? ""
    patchLine(criterion, { rating })
    onRateCriterion?.(candidate.id, criterion.key, {
      key: criterion.key,
      label: criterion.label,
      rating,
      comment: comment.trim() || undefined,
    })
  }

  async function submit() {
    if (!verdict || rated.length === 0 || readOnly || pending) return
    const scorecard = buildScorecard(
      rated.map((item) => ({ ...item, comment: item.comment.trim() || undefined })),
      verdict,
    )
    setPending(true)
    try {
      await onSubmit?.(scorecard)
      setSent(labels.assessmentSent)
      toast.success(labels.assessmentSent)
    } catch {
      setSent("")
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      data-slot="assessment-form"
      data-sent={sent ? "true" : "false"}
      className={cn("flex h-full min-h-0 flex-col bg-background text-foreground", className)}
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{labels.assessmentFor(candidate.name)}</h2>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {liveText ? labels.liveScore(liveText) : labels.liveScoreEmpty}
          </p>
        </div>
        <label className="grid gap-1 text-xs text-muted-foreground">
          {labels.verdictField}
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground"
            value={verdict}
            disabled={readOnly}
            aria-label={labels.verdictField}
            onChange={(event) => setVerdict(event.target.value as AtsVerdict | "")}
          >
            <option value="">{labels.noVerdict}</option>
            {ATS_VERDICTS.map((item) => (
              <option key={item} value={item}>
                {verdictLabel(labels, item)}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {criteria.length === 0 ? <p className="text-sm text-muted-foreground">{labels.criteriaEmpty}</p> : null}
        <ul className="grid gap-2">
          {criteria.map((criterion) => {
            const line = lines[criterion.key]
            const open = openKey === criterion.key
            const collapsed = Boolean(line?.saved && line.rating && !open)
            return (
              <li key={criterion.key} data-criterion={criterion.key} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium break-all" dir="auto">
                      {criterion.label}
                    </p>
                    {criterion.description ? <p className="text-xs text-muted-foreground">{criterion.description}</p> : null}
                  </div>
                  {collapsed ? null : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={readOnly}
                      aria-expanded={open}
                      onClick={() => setOpenKey(open ? null : criterion.key)}
                    >
                      {line?.rating ? labels.editRating(criterion.label) : labels.rateAction(criterion.label)}
                    </Button>
                  )}
                </div>
                {open ? (
                  <div className="mt-3 grid gap-2">
                    <div role="radiogroup" aria-label={labels.rateAction(criterion.label)} className="flex gap-1">
                      {Array.from({ length: ATS_SCORE_MAX }, (_, index) => {
                        const value = index + 1
                        const active = (line?.rating ?? 0) >= value
                        return (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={line?.rating === value}
                            aria-label={labels.stars(value, ATS_SCORE_MAX)}
                            className="rounded-sm p-1 text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            onClick={() => rate(criterion, value)}
                          >
                            <Star className={cn("size-5", active && "fill-current text-primary")} aria-hidden />
                          </button>
                        )
                      })}
                    </div>
                    <Textarea
                      aria-label={labels.commentFor(criterion.label)}
                      placeholder={labels.commentPlaceholder}
                      value={line?.comment ?? ""}
                      disabled={readOnly}
                      onChange={(event) => patchLine(criterion, { comment: event.target.value })}
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={!line?.rating}
                      onClick={() => {
                        const line = lines[criterion.key]
                        patchLine(criterion, { saved: true })
                        if (line?.rating) {
                          onRateCriterion?.(candidate.id, criterion.key, {
                            key: criterion.key,
                            label: criterion.label,
                            rating: line.rating,
                            comment: line.comment.trim() || undefined,
                          })
                        }
                        setOpenKey(null)
                      }}
                    >
                      {labels.saveCriterion(criterion.label)}
                    </Button>
                  </div>
                ) : null}
                {collapsed ? (
                  <div className="mt-3 flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="flex gap-0.5" aria-label={labels.stars(line!.rating, ATS_SCORE_MAX)}>
                        {Array.from({ length: ATS_SCORE_MAX }, (_, index) => (
                          <Star
                            key={index}
                            className={cn("size-3.5", index < line!.rating ? "fill-current text-primary" : "text-muted-foreground")}
                            aria-hidden
                          />
                        ))}
                      </p>
                      {line?.comment ? (
                        <p className="mt-1 text-sm break-all" dir="auto">
                          {line.comment}
                        </p>
                      ) : null}
                      <Button type="button" variant="ghost" size="sm" className="mt-1 px-0" onClick={() => setOpenKey(criterion.key)}>
                        {labels.editRating(criterion.label)}
                      </Button>
                    </div>
                    {author ? (
                      <Avatar className="size-7" aria-label={author.name}>
                        <AvatarFallback className="text-[10px]">{personInitials(author.name)}</AvatarFallback>
                      </Avatar>
                    ) : null}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-background px-4 py-3">
        <p role="status" data-slot="assessment-status" className="text-sm text-muted-foreground">
          {sent}
        </p>
        <div className="flex gap-2">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              {labels.cancel}
            </Button>
          ) : null}
          <Button type="submit" disabled={readOnly || pending || !verdict || rated.length === 0}>
            {labels.submitAssessment}
          </Button>
        </div>
      </footer>
    </form>
  )
}
