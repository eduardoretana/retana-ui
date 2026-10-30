"use client"

import { useEffect, useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, sceneText, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { StaggerList } from "@/registry/ui/stagger-list"

import { empty, error, filled, friday, loading, type AgendaFixture, type AgendaItem } from "./fixtures"

const frame: SceneFrame = { size: "sm", surface: "canvas", padding: "md" }

function Row({ item, locale }: { item: AgendaItem; locale: SceneLocale }) {
  return (
    <div className="flex gap-3 rounded-lg bg-muted px-3 py-2" aria-current={item.now ? "true" : undefined}>
      <span className={cn("w-1 self-stretch rounded-sm", item.now ? "bg-primary" : "bg-border")} aria-hidden="true" />
      <div className="min-w-0">
        <p className={cn("text-sm wrap-anywhere", item.now ? "font-medium text-foreground" : "text-foreground")}>{item.title[locale]}</p>
        <p className="text-xs text-muted-foreground">
          {item.time} · {item.place[locale]}
        </p>
      </div>
    </div>
  )
}

function Agenda({ fixture, locale, pending = false }: { fixture: AgendaFixture; locale: SceneLocale; pending?: boolean }) {
  return (
    <div className="mx-auto flex w-full max-w-[17.5rem] flex-col gap-2">
      <p className="text-sm font-medium">{fixture.day[locale]}</p>
      <StaggerList
        items={fixture.items}
        label={sceneText(locale, `Agenda del ${fixture.day.es.toLowerCase()}`, `${fixture.day.en} agenda`)}
        pending={pending}
        empty={sceneText(locale, "El horno no tiene nada programado.", "Nothing is booked on the kiln.")}
      >
        {(item) => <Row item={item} locale={locale} />}
      </StaggerList>
    </div>
  )
}

function FilledScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim(filled, log)
  const fridayOn = sim.state.day.es === "Viernes"
  return (
    <div className="flex flex-col gap-3">
      <Agenda fixture={sim.state} locale={locale} />
      <Button
        type="button"
        size="sm"
        disabled={sim.pending != null}
        onClick={() => {
          const next = fridayOn ? "jueves" : "viernes"
          void sim.call(formatSceneCall("onDay", [next]), () => (fridayOn ? filled : friday))
        }}
      >
        {sceneText(locale, fridayOn ? "Ver el jueves" : "Ver el viernes", fridayOn ? "Show Thursday" : "Show Friday")}
      </Button>
    </div>
  )
}

function EmptyScene({ locale }: SceneRenderProps) {
  return <Agenda fixture={empty} locale={locale} />
}

function LoadingScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim(loading, log)
  const call = sim.call
  useEffect(() => {
    void call("load", (current) => current, () => filled, { silent: true, delay: 900 })
  }, [call])
  const waiting = sim.state.items.length === 0
  return (
    <div className="flex flex-col gap-3">
      {waiting ? <SceneStatus tone="loading">{sceneText(locale, "Leyendo la agenda del taller…", "Reading the workshop agenda…")}</SceneStatus> : null}
      <Agenda fixture={sim.state} locale={locale} pending={waiting} />
    </div>
  )
}

function ErrorScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim({ phase: "error" as "error" | "loading" | "ready" }, log)
  const attempt = useRef(0)
  return (
    <div className="flex flex-col gap-3">
      {sim.state.phase === "ready" ? (
        <Agenda fixture={error} locale={locale} />
      ) : (
        <p role={sim.state.phase === "loading" ? "status" : "alert"} className="text-sm font-medium text-foreground">
          {sim.state.phase === "loading"
            ? sceneText(locale, "Reintentando la lectura…", "Reading it again…")
            : sceneText(locale, "No pudimos leer la agenda de Taller Barro.", "We could not read the agenda for Taller Barro.")}
        </p>
      )}
      {sim.state.phase !== "ready" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={sim.pending != null}
          onClick={() => {
            attempt.current += 1
            const fail = attempt.current === 1
            void sim.call(formatSceneCall("onRetry"), (current) => ({ ...current, phase: "loading" }), () => ({ phase: "ready" }), { fail })
          }}
        >
          {sceneText(locale, "Reintentar", "Retry")}
        </Button>
      ) : null}
    </div>
  )
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
]
