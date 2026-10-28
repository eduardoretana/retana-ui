"use client"

import { SceneStatus } from "@/app/catalog/scene-frame"
import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { balanceLeft, businessSpan, mexicoStatutoryHolidays, parseIsoDay } from "@/registry/lib/time-off"

import { coreCopy, empty, error, filled, holiday, loading, zero } from "./fixtures"

type Spec = typeof filled & { loading?: boolean; available?: number; pending?: number }

const frame = { size: "md" as const, surface: "card" as const, padding: "md" as const }

function CoreView({ locale, spec }: { locale: SceneRenderProps["locale"]; spec: Spec }) {
  const copy = coreCopy(locale)
  if (spec.loading) return <SceneStatus tone="loading">{copy.loading}</SceneStatus>
  if (!spec.start || !spec.end) return <p className="text-sm text-muted-foreground">{copy.empty}</p>
  if (!parseIsoDay(spec.start) || !parseIsoDay(spec.end)) return <p role="alert" className="text-sm text-destructive">{copy.invalid}</p>
  const holidays = mexicoStatutoryHolidays(spec.year)
  const span = businessSpan(spec.start, spec.end, holidays)
  const left = spec.available == null ? null : balanceLeft(spec.available, spec.pending ?? 0, span.days)
  return (
    <div className="grid gap-2 text-sm">
      <p>
        {copy.days}: <span className="tabular-nums">{span.days}</span>
      </p>
      {left != null ? (
        <p>
          {copy.left}: <span className="tabular-nums">{left}</span>
        </p>
      ) : null}
      <ul className="text-xs text-muted-foreground">
        {span.skipped.map((day) => (
          <li key={`${day.date}-${day.reason}`}>
            {copy.skipped}: {day.date} · {day.name ?? copy.weekend}
          </li>
        ))}
      </ul>
    </div>
  )
}

function scene(id: string, label: string, labelEn: string, spec: Spec): Scene {
  return { id, label, labelEn, frame, render: ({ locale }) => <CoreView locale={locale} spec={spec} /> }
}

export const scenes: Scene[] = [
  scene("filled", "Lleno", "Filled", filled),
  scene("empty", "Vacío", "Empty", empty),
  scene("loading", "Cargando", "Loading", loading),
  scene("error", "Error", "Error", error),
  scene("holiday", "Festivo", "Holiday", holiday),
  scene("zero", "Saldo en cero", "Zero balance", zero),
]
