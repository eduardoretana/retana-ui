"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { formatSceneCall } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { TimeOffBlock, type TimeOffRow, type TimeOffStatus } from "@/registry/blocks/time-off"

import { anchor, blockLabels, categories, declined, empty, error, errorCopy, events, filled, holidays, loading, now, requests } from "./fixtures"

const frame = { size: "desk" as const, surface: "card" as const, padding: "md" as const }

function rowsFor(locale: SceneRenderProps["locale"], mode: string): TimeOffRow[] {
  if (mode === "empty") return []
  const rows = requests(locale)
  if (mode === "declined") return rows.map((row) => (row.id === "mariana" ? { ...row, status: "declined" as const } : row))
  return rows
}

function View({ locale, log, mode }: SceneRenderProps & { mode: "filled" | "empty" | "loading" | "error" | "declined" }) {
  const base = rowsFor(locale, mode)
  const sim = useSceneSim<{ status: Record<string, TimeOffStatus | undefined> }>({ status: {} }, log)
  const attempt = useRef(0)
  const rows: TimeOffRow[] = base.map((row) => ({ ...row, status: sim.state.status[row.id] ?? row.status }))
  return (
    <div className="flex flex-col gap-3">
      {sim.failed ? <SceneStatus tone="error">{errorCopy[locale]}</SceneStatus> : null}
      <TimeOffBlock
        requests={mode === "empty" ? [] : rows}
        events={mode === "empty" ? [] : events(locale)}
        categories={categories}
        holidays={holidays()}
        anchor={anchor}
        now={now}
        locale={locale === "en" ? "en" : "es-MX"}
        loading={mode === "loading"}
        labels={blockLabels(locale)}
        onApprove={(id) => {
          attempt.current += 1
          void sim.call(
            formatSceneCall("onApprove", [id]),
            (current) => ({ status: { ...current.status, [id]: "approved" } }),
            undefined,
            { fail: mode === "error" && attempt.current === 1 },
          )
        }}
        onDecline={(id) =>
          sim.patch(formatSceneCall("onDecline", [id]), (current) => ({
            status: { ...current.status, [id]: "declined" },
          }))
        }
        onEditEvent={(event) => log(formatSceneCall("onEdit", [event.id]))}
        onDuplicateEvent={(event) => log(formatSceneCall("onDuplicate", [event.id]))}
        onDeleteEvent={(id) => log(formatSceneCall("onDelete", [id]))}
      />
    </div>
  )
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame, render: (props) => <View {...props} mode={filled.mode} /> },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame, render: (props) => <View {...props} mode={empty.mode} /> },
  { id: "loading", label: "Cargando", labelEn: "Loading", frame, render: (props) => <View {...props} mode={loading.mode} /> },
  { id: "error", label: "Error", labelEn: "Error", frame, render: (props) => <View {...props} mode={error.mode} /> },
  { id: "declined", label: "Rechazo", labelEn: "Declined", frame, render: (props) => <View {...props} mode={declined.mode} /> },
]
