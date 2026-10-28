"use client"

import { useEffect, useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, sceneText, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { Button } from "@/components/ui/button"
import { UsageMeter, type UsageMeterLabels, type UsageMeterSegment } from "@/registry/ui/usage-meter"

import { bump, empty, error, filled, loading, near, over, type MeterFixture } from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "canvas", padding: "md" }

function meterLabels(locale: SceneLocale): Partial<UsageMeterLabels> | undefined {
  if (locale === "en") return undefined
  return {
    usedOf: (total, limit) => `${total} de ${limit}`,
    captionUsed: (unit, limit) => `${unit} de ${limit}`,
    captionFree: (unit) => `${unit} libres`,
    captionOver: (unit) => `${unit} sobre el límite`,
    captionSegment: (unit, label, share) => `${unit} en ${label} · ${share}% del plan`,
    badgeFree: (amount) => `${amount} libres`,
    badgeNear: "Casi lleno",
    badgeOver: (amount) => `${amount} de más`,
    legend: (label) => `${label} por categoría`,
    summary: ({ label, total, limit, segments, status, free, over: overAmount }) =>
      `${label}: ${total} de ${limit}. ${segments}. ${status === "over" ? `Sobre el límite por ${overAmount}.` : `${free} libres${status === "near" ? ", casi lleno" : ""}.`}`,
    announcedOver: (amount) => `Sobre el límite del plan por ${amount}.`,
    announcedNear: (amount) => `Casi lleno. Quedan ${amount}.`,
    announcedOk: (amount) => `Dentro del límite. Quedan ${amount}.`,
  }
}

function segmentsOf(fixture: MeterFixture, locale: SceneLocale): UsageMeterSegment[] {
  return fixture.segments.map((segment) => ({ id: segment.id, label: segment[locale], value: segment.value }))
}

function Meter({ fixture, locale }: { fixture: MeterFixture; locale: SceneLocale }) {
  return (
    <UsageMeter
      className="w-full"
      label={fixture.label[locale]}
      unit={fixture.unit}
      limit={fixture.limit}
      decimals={1}
      freeLabel={fixture.free[locale]}
      overLabel={fixture.over[locale]}
      labels={meterLabels(locale)}
      segments={segmentsOf(fixture, locale)}
    />
  )
}

function FilledScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim(filled, log)
  return (
    <div className="flex flex-col gap-3">
      <Meter fixture={sim.state} locale={locale} />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={sim.pending != null}
          onClick={() => {
            void sim.call(formatSceneCall("segments", [{ id: "photos", deltaGb: 2.4 }]), (current) => bump(current, "photos", 2.4))
          }}
        >
          {sceneText(locale, "Registrar lote · 2.4 GB", "Log a batch · 2.4 GB")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={sim.pending != null}
          onClick={() => {
            void sim.call(formatSceneCall("segments", [{ id: "photos", deltaGb: 40 }]), (current) => bump(current, "photos", 40), undefined, {
              fail: true,
            })
          }}
        >
          {sceneText(locale, "Importar respaldo · 40 GB", "Import a backup · 40 GB")}
        </Button>
      </div>
      {sim.failed ? (
        <SceneStatus tone="error">
          {sceneText(locale, "El respaldo no entró. El almacén volvió a la cifra anterior.", "The backup did not land. Storage is back to the previous figure.")}
        </SceneStatus>
      ) : null}
    </div>
  )
}

function EmptyScene({ locale }: SceneRenderProps) {
  return <Meter fixture={empty} locale={locale} />
}

function LoadingScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim(loading, log)
  const call = sim.call
  useEffect(() => {
    void call("load", (current) => current, () => filled, { silent: true, delay: 900 })
  }, [call])
  const waiting = sim.state.segments.every((segment) => segment.value === 0)
  return (
    <div className="flex flex-col gap-3">
      {waiting ? <SceneStatus tone="loading">{sceneText(locale, "Leyendo el inventario del taller…", "Reading the workshop inventory…")}</SceneStatus> : null}
      <Meter fixture={sim.state} locale={locale} />
    </div>
  )
}

function ErrorScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim({ phase: "error" as "error" | "loading" | "ready" }, log)
  const attempt = useRef(0)
  return (
    <div className="flex flex-col gap-3">
      {sim.state.phase === "ready" ? (
        <Meter fixture={error} locale={locale} />
      ) : (
        <SceneStatus tone={sim.state.phase === "loading" ? "loading" : "error"}>
          {sim.state.phase === "loading"
            ? sceneText(locale, "Reintentando la lectura…", "Reading it again…")
            : sceneText(locale, "No pudimos leer el almacén de Taller Ladrillo.", "We could not read storage for Taller Ladrillo.")}
        </SceneStatus>
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

function NearScene({ locale }: SceneRenderProps) {
  return <Meter fixture={near} locale={locale} />
}

function OverScene({ locale }: SceneRenderProps) {
  return <Meter fixture={over} locale={locale} />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
  { id: "near", label: "Casi lleno", labelEn: "Almost full", render: NearScene, frame },
  { id: "over", label: "Sobre el límite", labelEn: "Over limit", render: OverScene, frame },
]
