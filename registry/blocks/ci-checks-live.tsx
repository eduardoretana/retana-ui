"use client"

/**
 * CI Checks Live. The view reads a transport. The token stays on the server.
 * Merge is off unless `mergeEnabled` is set. The checks panel starts closed.
 * Idea only, no license. Demo data is fictional when the host passes it.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { createAgentFixPort, estimateProgress, notifyCheckFailed, type AgentFixEvent, type AgentFixPort, type NormalizedCheck } from "@/registry/retana/lib/ci-checks"
import { AgentFixTimeline, agentFixTimelineLabels, agentFixTimelineLabelsEs, type FixStep } from "@/registry/retana/ui/agent-fix-timeline"
import { ChecksPanel, checksPanelLabels, checksPanelLabelsEs, type CheckItem } from "@/registry/retana/ui/checks-panel"
import { MergeButton, mergeButtonLabels, mergeButtonLabelsEs, type MergePhase } from "@/registry/retana/ui/merge-button"
import { PrCreateCard, prCreateCardLabels, prCreateCardLabelsEs, type CommitNode } from "@/registry/retana/ui/pr-create-card"
import { useReducedMotion } from "../ui/use-reduced-motion"
import { useCiChecks, type CiTransport } from "@/registry/retana/hooks/use-ci-checks"

export type CiChecksLiveLabels = {
  locale: "es" | "en"
  loading: string
  missing: string
  mergeOffPending: string
  mergeOffReady: string
  estimatedNote: string
  region: string
}

export const ciChecksLiveLabels: CiChecksLiveLabels = {
  locale: "en",
  loading: "Loading checks.",
  missing: "No pull request yet.",
  mergeOffPending: "Merge is off until the checks finish.",
  mergeOffReady: "Merge is off. The checks have passed.",
  estimatedNote: "Bar times are estimated from history or elapsed time.",
  region: "CI checks",
}

export const ciChecksLiveLabelsEs: CiChecksLiveLabels = {
  locale: "es",
  loading: "Cargando comprobaciones.",
  missing: "Todavía no hay pull request.",
  mergeOffPending: "La fusión está apagada. Falta que terminen las comprobaciones.",
  mergeOffReady: "La fusión está apagada. Las comprobaciones ya pasaron.",
  estimatedNote: "Los tiempos de las barras son estimados, a partir del historial o del tiempo transcurrido.",
  region: "Comprobaciones de CI",
}

export type CiChecksLiveProps = {
  transport: CiTransport
  mergeEnabled?: boolean
  pollMs?: number
  agent?: AgentFixPort
  onCheckFailed?: (check: { id: string; name: string; url: string | null }) => void
  variant?: "rail" | "compact"
  labels?: CiChecksLiveLabels
  className?: string
  historyMs?: Readonly<Record<string, readonly number[]>>
  now?: number
}

export function CiChecksLive({
  transport,
  mergeEnabled = false,
  pollMs = 0,
  agent,
  onCheckFailed,
  variant = "rail",
  labels = ciChecksLiveLabelsEs,
  className,
  historyMs = {},
  now,
}: CiChecksLiveProps) {
  const reduced = useReducedMotion()
  const state = useCiChecks({ transport, pollMs })
  const [panelOpen, setPanelOpen] = React.useState(false)
  const [outcome, setOutcome] = React.useState<"idle" | "merging" | "merged" | "rejected">("idle")
  const [mergeReason, setMergeReason] = React.useState<string | undefined>()
  const [tick, setTick] = React.useState(0)
  const seenFailures = React.useRef(new Set<string>())
  const localPort = React.useMemo(() => createAgentFixPort(), [])
  const port = agent ?? localPort
  const events = port.snapshot()
  const mergePhase: MergePhase = !mergeEnabled
    ? "disabled"
    : outcome === "idle"
      ? ready(state.snapshot, true) ? "ready" : "disabled"
      : outcome

  React.useEffect(() => port.subscribe(() => setTick((value) => value + 1)), [port])

  React.useEffect(() => {
    const failed = state.snapshot?.checks.filter((check) => check.status === "failed") ?? []
    for (const check of failed) {
      if (seenFailures.current.has(check.id)) continue
      seenFailures.current.add(check.id)
      notifyCheckFailed(onCheckFailed, { id: check.id, name: check.name, url: check.url })
    }
  }, [onCheckFailed, state.snapshot])

  const locale = labels.locale
  const pull = state.snapshot?.pull
  const checks = state.snapshot?.checks ?? []
  const clock = now ?? 0
  const rows = checks.map((check) => toRow(check, clock, historyMs[check.name] ?? []))
  const anyEstimated = rows.some((row) => row.estimated)

  async function confirmMerge() {
    if (!mergeEnabled || !pull) return
    setOutcome("merging")
    const result = await state.merge({ confirmed: true, grantedBy: "reader" })
    if (result.ok) {
      setOutcome("merged")
      setMergeReason(undefined)
      return
    }
    setOutcome("rejected")
    setMergeReason(result.message)
  }

  return (
    <section
      aria-label={labels.region}
      data-testid="ci-checks-live"
      data-motion={reduced ? "reduced" : "full"}
      data-events={tick}
      className={cn("flex w-full min-w-0 flex-col gap-4", className)}
    >
      <p role="status" aria-live="polite" className="sr-only">
        {state.loading ? labels.loading : state.error?.message ?? (pull ? `${state.snapshot?.passed ?? 0} / ${state.snapshot?.total ?? 0}` : labels.missing)}
      </p>
      {state.loading && !pull ? <p className="text-sm text-muted-foreground">{labels.loading}</p> : null}
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error.message}</p> : null}
      {!pull && !state.loading && !state.error ? <p className="text-sm text-muted-foreground">{labels.missing}</p> : null}
      {pull ? (
        <PrCreateCard
          open
          title={pull.title}
          number={pull.number}
          state={pull.state === "merged" ? "merged" : pull.state === "closed" ? "closed" : "open"}
          diffStat={{ add: pull.additions, del: pull.deletions }}
          commits={pull.commits.map(toCommit)}
          variant={variant}
          now={clock}
          locale={locale === "es" ? "es-MX" : "en"}
          labels={locale === "en" ? prCreateCardLabels : prCreateCardLabelsEs}
        />
      ) : null}
      {pull ? (
        <ChecksPanel
          passed={state.snapshot?.passed ?? 0}
          total={state.snapshot?.total ?? 0}
          sha={pull.sha.slice(0, 7)}
          message={pull.title}
          checks={rows}
          open={panelOpen}
          onOpenChange={setPanelOpen}
          variant={variant}
          labels={locale === "en" ? checksPanelLabels : checksPanelLabelsEs}
        />
      ) : null}
      {anyEstimated ? <p className="text-xs text-muted-foreground">{labels.estimatedNote}</p> : null}
      {events.length > 0 ? (
        <AgentFixTimeline steps={events.map(toStep)} variant={variant} labels={locale === "en" ? agentFixTimelineLabels : agentFixTimelineLabelsEs} />
      ) : null}
      {pull ? (
        <MergeButton
          phase={mergeEnabled ? mergePhase : "disabled"}
          reason={mergeReason}
          {...(mergeEnabled ? {} : { statusLabel: mergeOffLabel(labels, ready(state.snapshot, true)) })}
          variant={variant}
          labels={locale === "en" ? mergeButtonLabels : mergeButtonLabelsEs}
          onMerge={() => void confirmMerge()}
        />
      ) : null}
    </section>
  )
}

function mergeOffLabel(labels: CiChecksLiveLabels, checksReady: boolean) {
  return checksReady ? labels.mergeOffReady : labels.mergeOffPending
}

function ready(snapshot: { checks: NormalizedCheck[]; total: number } | null, mergeEnabled: boolean) {
  if (!mergeEnabled || !snapshot || snapshot.total === 0) return false
  return snapshot.checks.every((check) => check.status === "passed" || check.status === "skipped")
}

function toRow(check: NormalizedCheck, now: number, history: readonly number[]): CheckItem {
  const estimate = estimateProgress({
    status: check.status,
    startedAt: check.startedAt,
    completedAt: check.completedAt,
    measuredDurationMs: check.durationMs,
    now,
    historyMs: history,
  })
  const row: CheckItem = {
    id: check.id,
    name: check.name,
    status: check.status,
    progress: estimate.progress,
    estimated: estimate.estimated,
  }
  if (estimate.durationMs != null) row.durationMs = estimate.durationMs
  if (check.url) row.url = check.url
  return row
}

function toCommit(commit: { sha: string; message: string; author: string; committedAt: string | null }): CommitNode {
  return {
    sha: commit.sha.slice(0, 7),
    message: commit.message,
    author: commit.author,
    timeLabel: "",
    ...(commit.committedAt ? { committedAt: commit.committedAt } : {}),
  }
}

function toStep(event: AgentFixEvent): FixStep {
  return {
    id: event.id,
    kind: event.kind,
    label: event.label,
    status: event.kind === "done" ? "done" : "done",
    files: event.files?.map((path) => ({ path })),
  }
}
