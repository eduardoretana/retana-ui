"use client"

/**
 * Clean-room walkthrough of a fictional pull request.
 * Idea only, no license. The story is props and local demo state.
 * It does not fetch, merge, or run an agent.
 * Taller Ladrillo is invented. People, SHAs, and times are invented.
 */

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  AgentFixTimeline,
  agentFixTimelineLabels,
  agentFixTimelineLabelsEs,
  type FixStep,
} from "@/registry/retana/ui/agent-fix-timeline"
import {
  ChecksPanel,
  checksPanelLabels,
  checksPanelLabelsEs,
  type CheckItem,
} from "@/registry/retana/ui/checks-panel"
import { MergeButton, mergeButtonLabels, mergeButtonLabelsEs, type MergePhase } from "@/registry/retana/ui/merge-button"
import {
  PrCreateCard,
  prCreateCardLabels,
  prCreateCardLabelsEs,
  type CommitNode,
  type PrState,
} from "@/registry/retana/ui/pr-create-card"

export const storyPhases = ["empty", "creating", "open", "failing", "fixing", "passing", "merged"] as const

export type StoryPhase = (typeof storyPhases)[number]

export type CiChecksStoryLabels = {
  locale: "es" | "en"
  next: string
  done: string
  region: string
  live: (phase: StoryPhase) => string
}

export const ciChecksStoryLabels: CiChecksStoryLabels = {
  locale: "en",
  next: "Next step",
  done: "Done",
  region: "Pull request story",
  live: (phase) => `Story step: ${phase}.`,
}

export const ciChecksStoryLabelsEs: CiChecksStoryLabels = {
  locale: "es",
  next: "Siguiente paso",
  done: "Listo",
  region: "Historia del pull request",
  live: (phase) => `Paso de la historia: ${phase}.`,
}

const title = {
  es: "Guardar el folio del horno al recargar",
  en: "Keep the kiln folio across a reload",
}

const storyNow = Date.parse("2026-11-02T18:00:00Z")

const commits: CommitNode[] = [
  {
    sha: "b7e21aa",
    message: "Leer el folio desde la ficha",
    author: "Noa Ferrer",
    timeLabel: "hace 40 min",
    committedAt: "2026-11-02T17:20:00Z",
    branches: ["feat/folio-horno"],
  },
  {
    sha: "c4d90f1",
    message: "Subir el horno de pruebas",
    author: "Sam Ríos",
    timeLabel: "hace 3 h",
    committedAt: "2026-11-02T15:00:00Z",
    branches: ["main"],
  },
]

const thought = {
  es: "El recibo pierde el folio cuando el horno recarga",
  en: "The receipt drops the folio when the kiln reloads",
}

function checksFor(phase: StoryPhase): { passed: number; checks: CheckItem[] } {
  const lint: CheckItem = { id: "lint", name: "lint", status: "passed", durationMs: 11_000, progress: 1 }
  const types: CheckItem = { id: "typecheck", name: "typecheck", status: "passed", durationMs: 19_000, progress: 1 }
  if (phase === "empty" || phase === "creating" || phase === "open") {
    return {
      passed: phase === "empty" ? 0 : 2,
      checks:
        phase === "empty"
          ? []
          : [
              lint,
              types,
              { id: "unit", name: "unit", status: "running", durationMs: 8_000, progress: 0.4, estimated: true },
              { id: "preview", name: "preview", status: "queued", progress: 0 },
              { id: "e2e", name: "e2e", status: "queued", progress: 0, durationMs: undefined },
            ],
    }
  }
  if (phase === "failing" || phase === "fixing") {
    return {
      passed: 4,
      checks: [
        lint,
        types,
        { id: "unit", name: "unit", status: "passed", durationMs: 33_000, progress: 1 },
        { id: "preview", name: "preview", status: "passed", durationMs: 38_000, progress: 1 },
        { id: "e2e", name: "e2e", status: "failed", durationMs: 29_000, progress: 1 },
      ],
    }
  }
  return {
    passed: 5,
    checks: [
      lint,
      types,
      { id: "unit", name: "unit", status: "passed", durationMs: 33_000, progress: 1 },
      { id: "preview", name: "preview", status: "passed", durationMs: 38_000, progress: 1 },
      { id: "e2e", name: "e2e", status: "passed", durationMs: 41_000, progress: 1, estimated: true },
    ],
  }
}

function stepsFor(phase: StoryPhase, locale: "es" | "en"): FixStep[] {
  if (phase !== "fixing" && phase !== "passing" && phase !== "merged") return []
  const copy = locale === "es"
  return [
    { id: "thought", kind: "thought", label: copy ? thought.es : thought.en, status: "done" },
    {
      id: "edit",
      kind: "edit",
      label: copy ? "Edité horno.ts" : "Edited horno.ts",
      status: "done",
      files: [{ path: "horno.ts" }, { path: "folio.spec.ts" }],
    },
    { id: "test", kind: "test", label: copy ? "12 pruebas de punta a punta pasaron" : "12 end-to-end tests passed", status: "done" },
    { id: "push", kind: "push", label: copy ? "Empujé b7e21aa al pull request 42" : "Pushed b7e21aa to pull request 42", status: "done" },
    { id: "done", kind: "done", label: copy ? "El folio se conserva" : "The folio stays", status: phase === "fixing" ? "active" : "done" },
  ]
}

function prState(phase: StoryPhase): PrState {
  if (phase === "creating") return "creating"
  if (phase === "merged") return "merged"
  if (phase === "empty") return "closed"
  return "open"
}

function mergePhase(phase: StoryPhase): MergePhase {
  if (phase === "passing") return "ready"
  if (phase === "merged") return "merged"
  return "disabled"
}

export type CiChecksStoryProps = {
  phase?: StoryPhase
  defaultPhase?: StoryPhase
  onPhaseChange?: (phase: StoryPhase) => void
  showTransport?: boolean
  variant?: "rail" | "compact"
  labels?: CiChecksStoryLabels
  className?: string
}

export function CiChecksStory({
  phase: phaseProp,
  defaultPhase = "empty",
  onPhaseChange,
  showTransport = false,
  variant = "rail",
  labels = ciChecksStoryLabelsEs,
  className,
}: CiChecksStoryProps) {
  const [index, setIndex] = React.useState(() => Math.max(0, storyPhases.indexOf(defaultPhase)))
  const phase = phaseProp ?? storyPhases[index] ?? "empty"
  const [panel, setPanel] = React.useState(false)
  const locale = labels.locale
  const prLabels = locale === "es" ? prCreateCardLabelsEs : prCreateCardLabels
  const checkLabels = locale === "es" ? checksPanelLabelsEs : checksPanelLabels
  const fixLabels = locale === "es" ? agentFixTimelineLabelsEs : agentFixTimelineLabels
  const mergeLabels = locale === "es" ? mergeButtonLabelsEs : mergeButtonLabels
  const snapshot = checksFor(phase)
  const steps = stepsFor(phase, locale)
  const panelOpen = panel || phase === "failing" || phase === "fixing" || phase === "passing" || phase === "merged"
  const atEnd = phase === "merged"

  function advance() {
    const current = storyPhases.indexOf(phase)
    const next = storyPhases[Math.min(storyPhases.length - 1, current + 1)] ?? phase
    onPhaseChange?.(next)
    if (phaseProp === undefined) setIndex(storyPhases.indexOf(next))
  }

  return (
    <section aria-label={labels.region} className={cn("flex w-full min-w-0 flex-col gap-4", className)}>
      <p role="status" aria-live="polite" className="sr-only">
        {labels.live(phase)}
      </p>
      <PrCreateCard
        title={title[locale]}
        number={phase === "empty" ? undefined : 42}
        state={prState(phase)}
        diffStat={phase === "empty" ? { add: 0, del: 0 } : { add: 86, del: 12 }}
          commits={phase === "empty" || phase === "creating" ? [] : commits}
          open={phase !== "empty"}
          variant={variant}
          labels={prLabels}
          now={storyNow}
          locale={locale === "es" ? "es-MX" : "en"}
      />
      {phase === "empty" ? null : (
        <ChecksPanel
          passed={snapshot.passed}
          total={5}
          sha="b7e21aa"
          message={title[locale]}
          checks={snapshot.checks}
          open={panelOpen}
          onOpenChange={setPanel}
          variant={variant}
          labels={checkLabels}
        />
      )}
      {steps.length > 0 ? <AgentFixTimeline steps={steps} variant={variant} labels={fixLabels} /> : null}
      {phase === "empty" || phase === "creating" ? null : (
        <MergeButton phase={mergePhase(phase)} variant={variant} labels={mergeLabels} onMerge={() => advance()} />
      )}
      {showTransport ? (
        <Button type="button" variant="outline" onClick={advance} disabled={atEnd}>
          {atEnd ? labels.done : labels.next}
        </Button>
      ) : null}
    </section>
  )
}
