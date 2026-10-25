"use client"

/**
 * Clean-room candidate detail. The host passes the derived stage id.
 * Moves, mail, notes, and scheduling leave through callbacks.
 */

import * as React from "react"
import { ChevronLeft, ChevronRight, Mail, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ATS_SCORE_MAX,
  candidateScore,
  criterionBars,
  debriefNarrative,
  formatAtsDate,
  formatAtsFileSize,
  formatScore,
  nextStageId,
  personById,
  personInitials,
  recommendationLine,
  resolveAtsLabels,
  sourceLabel,
  verdictLabel,
  type AtsCandidate,
  type AtsCriterion,
  type AtsInterviewSlot,
  type AtsLabels,
  type AtsPerson,
  type AtsSlotInfo,
  type AtsStage,
} from "@/registry/retana/lib/ats"
import { StagePill, StageProgress } from "@/registry/retana/ui/stage-progress"

export type CandidateDetailProps<TMeta = Record<string, unknown>> = {
  candidate: AtsCandidate<TMeta>
  stageId: string
  stages: readonly AtsStage[]
  people?: readonly AtsPerson[]
  criteria?: readonly AtsCriterion[]
  position?: number
  total?: number
  locale?: string
  timeZone?: string
  labels?: Partial<AtsLabels>
  readOnly?: boolean
  canMove?: (from: string, to: string) => boolean
  onClose?: () => void
  onPrevious?: () => void
  onNext?: () => void
  onMoveCandidate?: (id: string, from: string, to: string) => void | Promise<unknown>
  onSendEmail?: (id: string) => void
  onScheduleInterview?: (id: string, slot: AtsInterviewSlot) => void | Promise<unknown>
  onAddNote?: (id: string, body: string) => void | Promise<unknown>
  onCreateAssessment?: (id: string) => void
  renderProgress?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
  renderActions?: (info: AtsSlotInfo<TMeta>) => React.ReactNode
  className?: string
  asideClassName?: string
}

function isField(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("input, textarea, select, [contenteditable='true']"))
}

function Meter({ value, label }: { value: number | null; label: string }) {
  const width = value == null ? 0 : Math.max(0, Math.min(100, (value / ATS_SCORE_MAX) * 100))
  const text = formatScore(value)
  return (
    <div className="grid grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-2 text-sm">
      <span className="truncate">{label}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <span className={cn("block h-full rounded-full", (value ?? 0) >= 4 ? "bg-primary" : "bg-foreground/60")} style={{ width: `${width}%` }} />
      </span>
      <span className="tabular-nums">{text || "—"}</span>
    </div>
  )
}

export function CandidateDetail<TMeta extends Record<string, unknown> = Record<string, unknown>>({
  candidate,
  stageId,
  stages,
  people = [],
  criteria = [],
  position = 1,
  total = 1,
  locale = "es-MX",
  timeZone = "America/Mexico_City",
  labels: labelOverrides,
  readOnly = false,
  canMove,
  onClose,
  onPrevious,
  onNext,
  onMoveCandidate,
  onSendEmail,
  onScheduleInterview,
  onAddNote,
  onCreateAssessment,
  renderProgress,
  renderActions,
  className,
  asideClassName,
}: CandidateDetailProps<TMeta>) {
  const labels = resolveAtsLabels(labelOverrides)
  const stage = stages.find((item) => item.id === stageId)
  const score = candidateScore(candidate)
  const scoreText = formatScore(score)
  const bars = criterionBars(candidate.scorecards ?? [], criteria)
  const narrative = candidate.debrief?.summary || debriefNarrative(bars, labels)
  const recommendation = recommendationLine(stageId, candidate.scorecards, stages, labels)
  const next = nextStageId(stageId, stages)
  const nextStage = stages.find((item) => item.id === next)
  const canAdvance = Boolean(next && onMoveCandidate && !readOnly && (canMove ? canMove(stageId, next) : true))
  const owner = personById(people, candidate.ownerId)
  const askAuthor = personById(people, candidate.debrief?.askAuthorId)
  const slot = { candidate, stageId, stages }
  const [note, setNote] = React.useState("")
  const [scheduling, setScheduling] = React.useState(false)
  const [when, setWhen] = React.useState("")
  const [kind, setKind] = React.useState("Entrevista")
  const cards = candidate.scorecards ?? []

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (isField(event.target)) return
    if (event.key === "ArrowLeft" && onPrevious) {
      event.preventDefault()
      onPrevious()
    }
    if (event.key === "ArrowRight" && onNext) {
      event.preventDefault()
      onNext()
    }
  }

  function move(to: string) {
    if (readOnly || !onMoveCandidate) return
    void onMoveCandidate(candidate.id, stageId, to)
  }

  return (
    <div
      data-slot="candidate-detail"
      data-candidate-id={candidate.id}
      data-stage-id={stageId}
      className={cn("flex h-full min-h-0 flex-col bg-background text-foreground", className)}
      onKeyDown={onKeyDown}
    >
      <header className="flex flex-wrap items-start gap-3 border-b border-border px-4 py-3">
        <Button type="button" variant="ghost" size="icon-sm" aria-label={labels.close} onClick={onClose}>
          <X aria-hidden />
        </Button>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon-sm" aria-label={labels.previous} disabled={!onPrevious} onClick={onPrevious}>
            <ChevronLeft aria-hidden />
          </Button>
          <span className="min-w-16 text-center text-xs tabular-nums text-muted-foreground">{labels.position(position, total)}</span>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={labels.next} disabled={!onNext} onClick={onNext}>
            <ChevronRight aria-hidden />
          </Button>
        </div>
        <Avatar className="size-10">
          <AvatarFallback>{personInitials(candidate.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold" dir="auto">
            {candidate.name}
          </h2>
          <p className="truncate text-sm text-muted-foreground">
            {[candidate.headline, candidate.location, candidate.years == null ? "" : labels.years(candidate.years)].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium tabular-nums" aria-label={scoreText ? labels.scoreValue(scoreText) : labels.noScore}>
            {labels.overview} {scoreText || labels.noScore}
          </span>
          <StagePill stage={stage} />
          {renderProgress ? renderProgress(slot) : <StageProgress stages={stages} stageId={stageId} label={stage?.label ?? labels.currentStage} />}
          <Button type="button" variant="outline" size="sm" disabled={readOnly} onClick={() => onSendEmail?.(candidate.id)}>
            <Mail aria-hidden />
            {labels.sendEmail}
          </Button>
          {renderActions ? <div aria-label={labels.extraActions}>{renderActions(slot)}</div> : null}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-h-0 overflow-y-auto px-4 py-4">
          <Tabs defaultValue="resumen">
            <TabsList variant="line">
              <TabsTrigger value="resumen">{labels.tabOverview}</TabsTrigger>
              <TabsTrigger value="postulacion">{labels.tabApplication}</TabsTrigger>
              <TabsTrigger value="scorecards">{labels.tabScorecards(cards.length)}</TabsTrigger>
              <TabsTrigger value="actividad">{labels.tabActivity}</TabsTrigger>
              <TabsTrigger value="archivos">{labels.tabFiles}</TabsTrigger>
            </TabsList>
            <TabsContent value="resumen" className="grid gap-4 pt-4">
              <section aria-label={labels.process} className="grid gap-2">
                <h3 className="text-sm font-medium">{labels.process}</h3>
                <ol className="flex flex-wrap gap-2">
                  {stages.map((item) => {
                    const current = item.id === stageId
                    const allowed = canMove ? canMove(stageId, item.id) : true
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-current={current ? "step" : undefined}
                          disabled={readOnly || current || !onMoveCandidate || !allowed}
                          className={cn(
                            "rounded-full border border-border px-3 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60",
                            current && atsCurrent(item),
                          )}
                          onClick={() => move(item.id)}
                        >
                          {item.label}
                        </button>
                      </li>
                    )
                  })}
                </ol>
              </section>
              <section aria-label={labels.debriefTitle} className="grid gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">{labels.debriefTitle}</h3>
                  <span className="text-xs text-muted-foreground">{labels.scorecardsOf(cards.length, Math.max(cards.length, 1))}</span>
                </div>
                <p className="text-base font-semibold">{recommendation}</p>
                <p className="text-sm text-muted-foreground">{narrative}</p>
                <div className="grid gap-2">
                  {bars.map((bar) => (
                    <Meter key={bar.key} label={bar.label} value={bar.average} />
                  ))}
                </div>
                {candidate.debrief?.ask ? (
                  <blockquote className="rounded-lg bg-muted/60 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">{labels.askInStage(nextStage?.label ?? stage?.label ?? "")}</p>
                    <p className="mt-1" dir="auto">
                      {candidate.debrief.ask}
                    </p>
                    {askAuthor ? <p className="mt-2 text-xs text-muted-foreground">{labels.fromAuthor(askAuthor.name)}</p> : null}
                  </blockquote>
                ) : null}
              </section>
              <ScorecardList cards={cards} people={people} labels={labels} locale={locale} timeZone={timeZone} />
            </TabsContent>
            <TabsContent value="postulacion" className="grid gap-3 pt-4 text-sm">
              <p>
                {labels.appliedOn(formatAtsDate(candidate.appliedAt, locale, timeZone, "medium"))} · {sourceLabel(labels, candidate.source)}
                {candidate.sourceDetail ? ` · ${candidate.sourceDetail}` : ""}
              </p>
              <p className="whitespace-pre-wrap break-all" dir="auto">
                {candidate.applicationNote || labels.noApplication}
              </p>
            </TabsContent>
            <TabsContent value="scorecards" className="grid gap-3 pt-4">
              <ScorecardList cards={cards} people={people} labels={labels} locale={locale} timeZone={timeZone} />
              <Button type="button" variant="outline" disabled={readOnly} onClick={() => onCreateAssessment?.(candidate.id)}>
                {labels.addAssessment}
              </Button>
            </TabsContent>
            <TabsContent value="actividad" className="pt-4">
              {(candidate.activity ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">{labels.noActivity}</p>
              ) : (
                <ul className="grid gap-3">
                  {(candidate.activity ?? []).map((item) => (
                    <li key={item.id} className="text-sm">
                      <p className="break-all" dir="auto">
                        {item.body}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatAtsDate(item.createdAt, locale, timeZone, "medium")}</p>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
            <TabsContent value="archivos" className="pt-4">
              {(candidate.files ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">{labels.noFiles}</p>
              ) : (
                <ul className="grid gap-2">
                  {(candidate.files ?? []).map((file) => (
                    <li key={file.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                      <span className="min-w-0 truncate">{file.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{file.size == null ? "" : formatAtsFileSize(file.size)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </div>
        <aside className={cn("min-h-0 space-y-4 overflow-y-auto border-t border-border px-4 py-4 lg:border-t-0 lg:border-s", asideClassName)}>
          <section className="grid gap-2 text-sm">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{labels.personal}</h3>
            <Field label={labels.email} value={candidate.email} />
            <Field label={labels.phone} value={candidate.phone} />
            <Field label={labels.location} value={candidate.location} />
            <Field label={labels.notice} value={candidate.notice} />
            <Field label={labels.owner} value={owner?.name ?? labels.unassigned} />
          </section>
          <section className="grid gap-2 text-sm">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{labels.education}</h3>
            {(candidate.education ?? []).length === 0 ? (
              <p className="text-muted-foreground">{labels.noEducation}</p>
            ) : (
              <ul className="grid gap-2">
                {(candidate.education ?? []).map((item) => (
                  <li key={item.id}>
                    <p className="font-medium">{item.school}</p>
                    <p className="text-muted-foreground">{[item.degree, item.years].filter(Boolean).join(" · ")}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="grid gap-2 text-sm">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{labels.notes}</h3>
            {(candidate.notes ?? []).length === 0 ? <p className="text-muted-foreground">{labels.noNotes}</p> : null}
            <ul className="grid gap-2">
              {(candidate.notes ?? []).map((item) => (
                <li key={item.id} className="rounded-lg bg-muted/50 p-2">
                  <p className="break-all" dir="auto">
                    {item.body}
                  </p>
                  <p className="text-xs text-muted-foreground">{personById(people, item.authorId)?.name ?? labels.unknownAuthor}</p>
                </li>
              ))}
            </ul>
            <form
              className="grid gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                const body = note.trim()
                if (!body || readOnly) return
                void onAddNote?.(candidate.id, body)
                setNote("")
              }}
            >
              <Textarea aria-label={labels.notePlaceholder} placeholder={labels.notePlaceholder} value={note} disabled={readOnly} onChange={(event) => setNote(event.target.value)} />
              <Button type="submit" size="sm" disabled={readOnly || !note.trim()}>
                {labels.addNote}
              </Button>
            </form>
          </section>
        </aside>
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
        {nextStage ? (
          <Button type="button" disabled={!canAdvance} onClick={() => next && move(next)}>
            {labels.moveNext(nextStage.label)}
          </Button>
        ) : null}
        <Button type="button" variant="outline" disabled={readOnly} aria-expanded={scheduling} onClick={() => setScheduling((value) => !value)}>
          {labels.schedule}
        </Button>
        {scheduling ? (
          <form
            className="flex flex-wrap items-end gap-2"
            aria-label={labels.scheduleFor(candidate.name)}
            onSubmit={(event) => {
              event.preventDefault()
              if (!when || readOnly) return
              const startsAt = new Date(when).toISOString()
              void onScheduleInterview?.(candidate.id, { startsAt, kind })
              setScheduling(false)
              setWhen("")
            }}
          >
            <label className="grid gap-1 text-xs text-muted-foreground">
              {labels.scheduleKind}
              <input className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground" value={kind} onChange={(event) => setKind(event.target.value)} />
            </label>
            <label className="grid gap-1 text-xs text-muted-foreground">
              {labels.scheduleWhen}
              <input
                type="datetime-local"
                aria-label={labels.scheduleWhen}
                className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground"
                value={when}
                onChange={(event) => setWhen(event.target.value)}
                required
              />
            </label>
            <Button type="submit" size="sm">
              {labels.confirmSchedule}
            </Button>
          </form>
        ) : null}
      </footer>
    </div>
  )
}

function atsCurrent(stage: AtsStage) {
  return cn("border-transparent", stage.className || "bg-primary text-primary-foreground")
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <p>
      <span className="text-muted-foreground">{label}. </span>
      <span className="break-all" dir="auto">
        {value || "—"}
      </span>
    </p>
  )
}

function ScorecardList({
  cards,
  people,
  labels,
  locale,
  timeZone,
}: {
  cards: NonNullable<AtsCandidate["scorecards"]>
  people: readonly AtsPerson[]
  labels: AtsLabels
  locale: string
  timeZone: string
}) {
  if (cards.length === 0) return <p className="text-sm text-muted-foreground">{labels.noScorecards}</p>
  const avg = formatScore(cards.reduce((sum, card) => sum + card.overall, 0) / cards.length)
  return (
    <section className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{labels.tabScorecards(cards.length)}</h3>
        <span className="text-xs text-muted-foreground tabular-nums">{labels.averageShort(avg)}</span>
      </div>
      <ul className="grid gap-2">
        {cards.map((card, index) => {
          const author = personById(people, card.authorId)
          return (
            <li key={card.id ?? `${card.authorId ?? "card"}-${index}`} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">{personInitials(author?.name ?? "?")}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{author?.name ?? labels.unknownAuthor}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {[author?.role, card.createdAt ? formatAtsDate(card.createdAt, locale, timeZone, "medium") : ""].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{verdictLabel(labels, card.verdict)}</span>
              <span className="text-sm font-medium tabular-nums">{formatScore(card.overall)}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
