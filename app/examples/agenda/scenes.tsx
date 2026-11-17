"use client"

import { useEffect, useRef, useState } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { sceneText, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { Agenda } from "@/registry/blocks/agenda"
import { agendaLabelsEn, type AgendaEvent } from "@/registry/lib/agenda"

import {
  anchor,
  conflicts,
  empty,
  error,
  eventsOf,
  filled,
  loading,
  many,
  now,
  over,
  resources,
  resourcesOf,
  timeZone,
  type AgendaFixture,
} from "./fixtures"

const frame: SceneFrame = { size: "desk", surface: "app", padding: "none" }

const categories = [
  { id: "taller", label: "Taller", icon: "wrench", tone: "neutral" as const },
  { id: "diseno", label: "Diseño", icon: "pen", tone: "info" as const },
]

function Board({
  fixture,
  locale,
  loading: isLoading = false,
  error: errorText,
  onRetry,
  onResource,
}: {
  fixture: AgendaFixture
  locale: SceneLocale
  loading?: boolean
  error?: string
  onRetry?: () => void
  onResource?: (id: string | null) => void
}) {
  const [events, setEvents] = useState<AgendaEvent[]>(() => eventsOf(fixture, locale))
  return (
    <Agenda
      className="h-[36rem]"
      events={events}
      categories={categories}
      resources={resourcesOf(fixture, locale)}
      labels={locale === "en" ? agendaLabelsEn : undefined}
      locale={locale === "en" ? "en-US" : "es-MX"}
      timeZone={timeZone}
      now={now}
      anchor={anchor}
      defaultView="day"
      hourStart={8}
      hourEnd={16}
      loading={isLoading}
      error={errorText}
      onRetry={onRetry}
      onResourceIdChange={onResource}
      onReschedule={(id, move) => {
        setEvents((current) => current.map((event) => (event.id === id ? { ...event, ...move } : event)))
      }}
    />
  )
}

function FilledScene({ locale, log }: SceneRenderProps) {
  return (
    <Board
      key={locale}
      fixture={filled}
      locale={locale}
      onResource={(id) => log(sceneText(locale, `recurso(${id ?? "todos"})`, `resource(${id ?? "all"})`))}
    />
  )
}

function EmptyScene({ locale }: SceneRenderProps) {
  return <Board key={locale} fixture={empty} locale={locale} />
}

function LoadingScene({ locale }: SceneRenderProps) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 900)
    return () => window.clearTimeout(id)
  }, [])
  return (
    <div className="flex flex-col gap-3">
      {ready ? null : <SceneStatus tone="loading">{sceneText(locale, "Leyendo la agenda del taller…", "Reading the workshop agenda…")}</SceneStatus>}
      <Board key={locale} fixture={loading} locale={locale} loading={!ready} />
    </div>
  )
}

function ErrorScene({ locale, log }: SceneRenderProps) {
  const [phase, setPhase] = useState<"error" | "loading" | "ready">("error")
  const attempt = useRef(0)
  return (
    <div className="flex flex-col gap-3">
      {phase === "ready" ? (
        <Board key={locale} fixture={error} locale={locale} />
      ) : (
        <Board
          key={locale}
          fixture={error}
          locale={locale}
          loading={phase === "loading"}
          error={phase === "error" ? error.error[locale] : undefined}
          onRetry={() => {
            attempt.current += 1
            const fail = attempt.current === 1
            log(sceneText(locale, "reintentar()", "retry()"))
            setPhase("loading")
            window.setTimeout(() => setPhase(fail ? "error" : "ready"), 400)
          }}
        />
      )}
    </div>
  )
}

function ResourcesScene({ locale }: SceneRenderProps) {
  return <Board key={locale} fixture={resources} locale={locale} />
}

function ConflictsScene({ locale }: SceneRenderProps) {
  return <Board key={locale} fixture={conflicts} locale={locale} />
}

function OverScene({ locale }: SceneRenderProps) {
  return <Board key={locale} fixture={over} locale={locale} />
}

function ManyScene({ locale }: SceneRenderProps) {
  return <Board key={locale} fixture={many} locale={locale} />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
  { id: "resources", label: "Recursos", labelEn: "Resources", render: ResourcesScene, frame },
  { id: "conflicts", label: "Choques", labelEn: "Conflicts", render: ConflictsScene, frame },
  { id: "over", label: "Sobrecapacidad", labelEn: "Over capacity", render: OverScene, frame },
  { id: "many", label: "Muchos recursos", labelEn: "Many resources", render: ManyScene, frame },
]
