"use client"

import { useEffect, useRef, useState } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { sceneText, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { DispatchBoard } from "@/registry/blocks/dispatch-board"
import { dispatchLabelsEn, type AssignRequest, type Job } from "@/registry/lib/dispatch-board"

import { anchor, conflicts, empty, error, filled, filters, loading, modelOf, now, readonly, rejected, rows500, timeOff, timeZone, unassignedQueue, type DispatchFixture } from "./fixtures"

const frame: SceneFrame = { size: "desk", surface: "app", padding: "none" }

function applyRequest(jobs: readonly Job[], request: AssignRequest): Job[] {
  return jobs.map((job) => (job.id === request.jobId ? { ...job, resourceId: request.resourceId, startsAt: request.startsAt, endsAt: request.endsAt } : job))
}

function Board({ fixture, locale, loading: isLoading = false, error: errorText, onRetry, readOnly = false, filtersOpen = false, rejection, log }: {
  fixture: DispatchFixture
  locale: SceneLocale
  loading?: boolean
  error?: string
  onRetry?: () => void
  readOnly?: boolean
  filtersOpen?: boolean
  rejection?: { detail: string }
  log?: (line: string) => void
}) {
  const base = modelOf(fixture, locale)
  const [jobs, setJobs] = useState(base.jobs)
  return (
    <DispatchBoard
      className="h-[40rem]"
      model={{ ...base, jobs }}
      labels={locale === "en" ? dispatchLabelsEn : undefined}
      locale={locale === "en" ? "en-US" : "es-MX"}
      timeZone={timeZone}
      now={now}
      anchor={anchor}
      hourStart={9}
      hourEnd={16}
      loading={isLoading}
      error={errorText}
      onRetry={onRetry}
      readOnly={readOnly}
      defaultFiltersOpen={filtersOpen}
      defaultRailOpen
      rejection={rejection ? { reason: "skill", detail: rejection.detail, jobId: "cola-4" } : null}
      onBack={() => log?.(sceneText(locale, "volver()", "back()"))}
      onAssignRequest={async (request) => { setJobs((current) => applyRequest(current, request)); log?.(sceneText(locale, `asignar(${request.jobId})`, `assign(${request.jobId})`)); return { ok: true } }}
      onMoveRequest={async (request) => { setJobs((current) => applyRequest(current, request)); log?.(sceneText(locale, `mover(${request.jobId})`, `move(${request.jobId})`)); return { ok: true } }}
      onResizeRequest={async (request) => { setJobs((current) => applyRequest(current, request)); log?.(sceneText(locale, `redimensionar(${request.jobId})`, `resize(${request.jobId})`)); return { ok: true } }}
      onExport={(payload) => { log?.(sceneText(locale, `exportar(${payload.format})`, `export(${payload.format})`)); return false }}
    />
  )
}

function scene(fixture: DispatchFixture, extra?: { readOnly?: boolean; filtersOpen?: boolean; rejection?: boolean }) {
  return function Render({ locale, log }: SceneRenderProps) {
    return <Board key={locale} fixture={fixture} locale={locale} log={log} readOnly={extra?.readOnly} filtersOpen={extra?.filtersOpen} rejection={extra?.rejection ? { detail: fixture.rejection[locale] } : undefined} />
  }
}

function LoadingScene({ locale }: SceneRenderProps) {
  const [ready, setReady] = useState(false)
  useEffect(() => { const id = window.setTimeout(() => setReady(true), 900); return () => window.clearTimeout(id) }, [])
  return (
    <div className="flex flex-col gap-3">
      {ready ? null : <SceneStatus tone="loading">{sceneText(locale, "Leyendo el tablero de Campo Norte…", "Reading the Campo Norte board…")}</SceneStatus>}
      <Board key={locale} fixture={loading} locale={locale} loading={!ready} />
    </div>
  )
}

function ErrorScene({ locale, log }: SceneRenderProps) {
  const [phase, setPhase] = useState<"error" | "loading" | "ready">("error")
  const attempt = useRef(0)
  if (phase === "ready") return <Board key={locale} fixture={error} locale={locale} log={log} />
  return (
    <Board
      key={`${locale}-${phase}`}
      fixture={error}
      locale={locale}
      log={log}
      loading={phase === "loading"}
      error={phase === "error" ? error.error[locale] : undefined}
      onRetry={() => { attempt.current += 1; const fail = attempt.current === 1; log(sceneText(locale, "reintentar()", "retry()")); setPhase("loading"); window.setTimeout(() => setPhase(fail ? "error" : "ready"), 400) }}
    />
  )
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
  { id: "conflicts", label: "Choques", labelEn: "Conflicts", render: scene(conflicts), frame },
  { id: "time-off", label: "Ausencia", labelEn: "Time off", render: scene(timeOff), frame },
  { id: "unassigned-queue", label: "Cola", labelEn: "Queue", render: scene(unassignedQueue), frame },
  { id: "rows500", label: "500 filas", labelEn: "500 rows", render: scene(rows500), frame },
  { id: "readonly", label: "Solo lectura", labelEn: "Read only", render: scene(readonly, { readOnly: true }), frame },
  { id: "filters", label: "Filtros", labelEn: "Filters", render: scene(filters, { filtersOpen: true }), frame },
  { id: "rejected", label: "Drop inválido", labelEn: "Invalid drop", render: scene(rejected, { rejection: true }), frame },
]
