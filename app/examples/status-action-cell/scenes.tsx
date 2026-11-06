"use client"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { sceneText, type Scene, type SceneFrame, type SceneLocale, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { StatusActionCell, type StatusAction } from "@/registry/ui/status-action-cell"

import { cellText, compact, empty, error, filled, loading, menuLabels, type CellFixture } from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "canvas", padding: "md" }
const narrowFrame: SceneFrame = { size: "md", surface: "canvas", padding: "none" }

function actionsFor(fixture: CellFixture, locale: SceneLocale, pendingId?: string, onAction?: (id: string) => void): StatusAction[] {
  return fixture.actions.map((action) => ({
    id: action.id,
    label: cellText(locale, action),
    variant: action.variant,
    pending: pendingId === action.id,
    onClick: () => onAction?.(action.id),
  }))
}

function CellView({
  fixture,
  locale,
  pendingId,
  errorText,
  onAction,
  width,
}: {
  fixture: CellFixture
  locale: SceneLocale
  pendingId?: string
  errorText?: string
  onAction?: (id: string) => void
  width?: number
}) {
  const menus = menuLabels(locale)
  const cell = (
    <StatusActionCell
      label={cellText(locale, fixture.label)}
      tone={fixture.tone}
      actions={actionsFor(fixture, locale, pendingId ?? fixture.pendingId, onAction)}
      density={fixture.density}
      collapse={fixture.collapse}
      menuLabel={menus.menu}
      moreLabel={menus.more}
      error={errorText ?? (fixture.error ? cellText(locale, fixture.error) : undefined)}
    />
  )
  if (!width) return cell
  return <div className="@container w-full max-w-full" style={{ width }}>{cell}</div>
}

function FilledScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim({ tone: filled.tone, label: filled.label }, log)
  return (
    <CellView
      fixture={{ ...filled, tone: sim.state.tone, label: sim.state.label }}
      locale={locale}
      pendingId={sim.pending ?? undefined}
      errorText={sim.failed ? cellText(locale, { es: "No se pudo reintentar.", en: "The retry did not land." }) : undefined}
      onAction={(id) => {
        if (id === "retry") {
          void sim.call(id, (current) => current, undefined, { fail: true })
          return
        }
        void sim.call(id, (current) => current, (current) => ({
          ...current,
          tone: id === "resume" ? "info" : current.tone,
          label: id === "resume" ? { es: "En curso", en: "Running" } : current.label,
        }))
      }}
    />
  )
}

function EmptyScene({ locale }: SceneRenderProps) {
  return <CellView fixture={empty} locale={locale} />
}

function LoadingScene({ locale }: SceneRenderProps) {
  return (
    <div className="flex flex-col gap-3">
      <SceneStatus tone="loading">{sceneText(locale, "Reanudando la serie…", "Resuming the series…")}</SceneStatus>
      <CellView fixture={loading} locale={locale} />
    </div>
  )
}

function ErrorScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim({ phase: "error" as "error" | "ready" }, log)
  const showError = sim.state.phase === "error"
  return (
    <CellView
      fixture={error}
      locale={locale}
      errorText={showError ? cellText(locale, error.error!) : undefined}
      pendingId={sim.pending ?? undefined}
      onAction={(id) => {
        void sim.call(id, (current) => current, () => ({ phase: "ready" }))
      }}
    />
  )
}

function NarrowScene({ locale }: SceneRenderProps) {
  return <CellView fixture={filled} locale={locale} width={390} />
}

function CompactScene({ locale }: SceneRenderProps) {
  return <CellView fixture={compact} locale={locale} />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
  { id: "narrow", label: "390 px", labelEn: "390 px", render: NarrowScene, frame: narrowFrame },
  { id: "compact", label: "Compacta", labelEn: "Compact", render: CompactScene, frame },
]
