"use client"

import { useEffect, useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, sceneText, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { Button } from "@/components/ui/button"
import { NumberRoll } from "@/registry/ui/number-roll"

import { add, empty, error, filled, loading, type BalanceFixture } from "./fixtures"

const frame: SceneFrame = { size: "sm", surface: "canvas", padding: "md" }

function localeOf(locale: SceneLocale) {
  return locale === "en" ? "en-US" : "es-MX"
}

function Balance({ fixture, locale }: { fixture: BalanceFixture; locale: SceneLocale }) {
  return (
    <div className="mx-auto flex w-full max-w-[17.5rem] flex-col gap-1">
      <p className="text-sm text-muted-foreground">{fixture.label[locale]}</p>
      <NumberRoll value={fixture.value} decimals={2} hierarchy prefix="$" locale={localeOf(locale)} className="text-3xl" />
      <p className="text-xs text-muted-foreground">{fixture.hint[locale]}</p>
    </div>
  )
}

function FilledScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim(filled, log)
  return (
    <div className="flex flex-col gap-3">
      <Balance fixture={sim.state} locale={locale} />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={sim.pending != null}
          onClick={() => {
            void sim.call(formatSceneCall("onLog", [240]), (current) => add(current, 240))
          }}
        >
          {sceneText(locale, "Anotar horneada · $240", "Log a firing · $240")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={sim.pending != null}
          onClick={() => {
            void sim.call(formatSceneCall("onLog", [9000]), (current) => add(current, 9000), undefined, { fail: true })
          }}
        >
          {sceneText(locale, "Anotar un pedido que no entra", "Log an order that does not land")}
        </Button>
      </div>
      {sim.failed ? (
        <SceneStatus tone="error">
          {sceneText(locale, "El pedido no entró. El saldo volvió a la cifra anterior.", "The order did not land. The balance is back to the previous figure.")}
        </SceneStatus>
      ) : null}
    </div>
  )
}

function EmptyScene({ locale }: SceneRenderProps) {
  return <Balance fixture={empty} locale={locale} />
}

function LoadingScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim(loading, log)
  const call = sim.call
  useEffect(() => {
    void call("load", (current) => current, () => filled, { silent: true, delay: 900 })
  }, [call])
  const waiting = sim.state.value === 0
  return (
    <div className="flex flex-col gap-3" aria-busy={waiting}>
      {waiting ? <SceneStatus tone="loading">{sceneText(locale, "Leyendo el saldo del taller…", "Reading the workshop balance…")}</SceneStatus> : null}
      <Balance fixture={sim.state} locale={locale} />
    </div>
  )
}

function ErrorScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim({ phase: "error" as "error" | "loading" | "ready" }, log)
  const attempt = useRef(0)
  return (
    <div className="flex flex-col gap-3">
      {sim.state.phase === "ready" ? (
        <Balance fixture={error} locale={locale} />
      ) : (
        <p role={sim.state.phase === "loading" ? "status" : "alert"} className="text-sm font-medium text-foreground">
          {sim.state.phase === "loading"
            ? sceneText(locale, "Reintentando la lectura…", "Reading it again…")
            : sceneText(locale, "No pudimos leer el saldo de Taller Barro.", "We could not read the balance for Taller Barro.")}
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
