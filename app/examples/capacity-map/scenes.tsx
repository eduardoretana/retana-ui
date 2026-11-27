"use client"

import { useState } from "react"

import { formatSceneCall, sceneText, type Scene, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { CapacityMap, CapacityMapBoard } from "@/registry/ui/capacity-map"

import { filledZones, longNameZones } from "./fixtures"

const wide = { size: "desk" as const, surface: "card" as const, padding: "md" as const }
const narrow = { size: "sm" as const, surface: "card" as const, padding: "sm" as const }

function Filled({ locale, log }: SceneRenderProps) {
  return (
    <CapacityMapBoard
      zones={filledZones()}
      locale={locale}
      defaultOpenZoneIds={["pb"]}
      onHighlight={(id) => log(formatSceneCall("onHighlight", [id]))}
      onSelect={(id) => log(formatSceneCall("onSelect", [id]))}
    />
  )
}

function Empty({ locale }: SceneRenderProps) {
  return <CapacityMap zones={[]} locale={locale} />
}

function Loading({ locale }: SceneRenderProps) {
  return <CapacityMap zones={filledZones()} locale={locale} loading />
}

function ErrorScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim({ phase: "error" as "error" | "ready" }, log)
  if (sim.state.phase === "ready") {
    return <CapacityMapBoard zones={filledZones()} locale={locale} defaultOpenZoneIds={["pb"]} />
  }
  return (
    <CapacityMap
      zones={[]}
      locale={locale}
      error={sceneText(locale, "No se pudo leer el mapa.", "The map could not be read.")}
      onRetry={() => {
        log(formatSceneCall("onRetry"))
        sim.patch("retry", () => ({ phase: "ready" as const }))
      }}
    />
  )
}

function Simulate({ locale, log }: SceneRenderProps) {
  const [demand, setDemand] = useState(0)
  return (
    <CapacityMap
      zones={filledZones()}
      locale={locale}
      defaultOpenZoneIds={["pb", "p1"]}
      simulate
      demand={demand}
      onDemandChange={(value) => {
        log(formatSceneCall("onDemandChange", [value]))
        setDemand(value)
      }}
    />
  )
}

function Overflow({ locale }: SceneRenderProps) {
  return <CapacityMap zones={filledZones()} locale={locale} defaultOpenZoneIds={["pb", "p1"]} simulate demand={80} />
}

function CustomStatus({ locale }: SceneRenderProps) {
  return (
    <CapacityMap
      zones={[
        {
          id: "z",
          label: sceneText(locale, "Sala de espera", "Waiting room"),
          groups: [
            {
              id: "g",
              label: sceneText(locale, "Fila principal", "Main row"),
              slots: [
                { id: "s1", label: "E-1", status: "held", detail: "Inés Ejemplo" },
                { id: "s2", label: "E-2", status: "free" },
                { id: "s3", label: "E-3", status: "occupied", detail: "Diego Ejemplo" },
              ],
            },
          ],
        },
      ]}
      locale={locale}
      defaultOpenZoneIds={["z"]}
      statuses={[{ id: "held", label: sceneText(locale, "En espera", "On hold"), tone: "warning", available: false }]}
    />
  )
}

function LongNames({ locale }: SceneRenderProps) {
  return <CapacityMap zones={longNameZones()} locale={locale} defaultOpenZoneIds={["z"]} layout="list" />
}

function Narrow({ locale, log }: SceneRenderProps) {
  return (
    <div className="w-[390px] max-w-full">
      <CapacityMapBoard zones={filledZones()} locale={locale} defaultOpenZoneIds={["pb"]} onHighlight={(id) => log(formatSceneCall("onHighlight", [id]))} />
    </div>
  )
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame: wide, render: Filled },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame: wide, render: Empty },
  { id: "loading", label: "Cargando", labelEn: "Loading", frame: wide, render: Loading },
  { id: "error", label: "Error", labelEn: "Error", frame: wide, render: ErrorScene },
  { id: "simulate", label: "Simulación", labelEn: "Simulation", frame: wide, render: Simulate },
  { id: "overflow", label: "Exceso", labelEn: "Overflow", frame: wide, render: Overflow },
  { id: "custom-status", label: "Estado propio", labelEn: "Custom status", frame: wide, render: CustomStatus },
  { id: "long-names", label: "Nombres largos", labelEn: "Long names", frame: wide, render: LongNames },
  { id: "390px", label: "390 px", labelEn: "390 px", frame: narrow, render: Narrow },
]
