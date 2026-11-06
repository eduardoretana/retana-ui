"use client"

import type { ComponentProps } from "react"

import { DispatchBoard } from "@/registry/blocks/dispatch-board"
import type { Job, Resource } from "@/registry/lib/dispatch-board"

import { anchor, modelOf, now, stressResources, timeZone, filled } from "../fixtures"

const token = "Y".repeat(60)
const base = modelOf(filled, "es")
const shared = { now, anchor, timeZone, locale: "es-MX", hourStart: 9, hourEnd: 16, defaultView: "day" as const, defaultRailOpen: true }

function visit(overrides: Partial<Job> & Pick<Job, "id" | "title">): Job {
  return { statusId: "accepted", startsAt: "2026-11-04T16:00:00.000Z", endsAt: "2026-11-04T17:00:00.000Z", skillId: "caldera", resourceId: "ines", ...overrides }
}

function shell(resources: readonly Resource[], jobs: readonly Job[], extra?: Partial<ComponentProps<typeof DispatchBoard>>) {
  return <DispatchBoard {...shared} className="h-[32rem]" model={{ ...base, resources, jobs, absences: [] }} {...extra} />
}

export default function StressPage() {
  const many = stressResources(500)
  const clashes = Array.from({ length: 7 }, (_, index) => visit({ id: `choque-${index + 1}`, title: `Choque ${index + 1}`, startsAt: "2026-11-04T16:00:00.000Z", endsAt: "2026-11-04T20:00:00.000Z" }))
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tablero de despacho</h1>
      <section className="grid gap-2"><h2 className="text-sm font-medium">Vacío en 320px</h2><div className="h-[32rem] w-full max-w-80">{shell([], [])}</div></section>
      <section className="grid gap-2"><h2 className="text-sm font-medium">Cargando</h2><div className="h-80">{shell(base.resources, base.jobs, { loading: true })}</div></section>
      <section className="grid gap-2"><h2 className="text-sm font-medium">Error</h2><div className="h-64">{shell([], [], { error: "Fallo de demostración.", onRetry: () => undefined })}</div></section>
      <section className="grid gap-2"><h2 className="text-sm font-medium">Solo lectura</h2><div className="h-80">{shell(base.resources, base.jobs, { readOnly: true })}</div></section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Token de 60, dirección larga y medianoche</h2>
        <div className="h-[36rem]">
          {shell(base.resources, [
            visit({ id: "token", title: token, location: token }),
            visit({ id: "largo", title: "Dirección que no cabe", location: "Calle".concat("Roble".repeat(18)), startsAt: "2026-11-04T18:00:00.000Z", endsAt: "2026-11-04T19:00:00.000Z" }),
            visit({ id: "noche", title: "Guardia que cruza la medianoche", startsAt: "2026-11-05T04:00:00.000Z", endsAt: "2026-11-05T08:00:00.000Z" }),
          ], { hourStart: 9, hourEnd: 24 })}
        </div>
      </section>
      <section className="grid gap-2"><h2 className="text-sm font-medium">20 choques en una fila</h2><div className="h-[36rem]">{shell(base.resources.filter((resource) => resource.id === "ines"), clashes)}</div></section>
      <section className="grid gap-2"><h2 className="text-sm font-medium">500 filas</h2><div className="h-[32rem]">{shell(many, [])}</div></section>
    </main>
  )
}
