"use client"

import { useState } from "react"

import { StressCase } from "@/app/examples/stress-case"
import { ToolbarDemo } from "@/app/examples/work-table-toolbar/preview"
import { WorkTableToolbar } from "@/registry/ui/work-table-toolbar"

const longName = `${"Responsable".repeat(8)} Vidal`

export default function WorkTableToolbarStressPage() {
  const [query, setQuery] = useState("🔥 " + "busqueda".repeat(12))
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Barra de la tabla de trabajo</h1>
      <StressCase label="Vacío, sin personas ni ciclos" width={320}>
        <WorkTableToolbar
          query=""
          onQueryChange={() => {}}
          priorities={[]}
          onPrioritiesChange={() => {}}
          assignees={[]}
          onAssigneesChange={() => {}}
          cycle={null}
          onCycleChange={() => {}}
          sortKey="manual"
          sortDir="asc"
          onSortChange={() => {}}
        />
      </StressCase>
      <StressCase label="Consulta larga, emoji y un nombre de 60 caracteres" width={320}>
        <WorkTableToolbar
          query={query}
          onQueryChange={setQuery}
          priorities={["p0", "p1", "p2", "p3"]}
          onPrioritiesChange={() => {}}
          people={[
            { id: "ana", name: "Ana", initials: "A" },
            { id: "long", name: longName, initials: "مر" },
          ]}
          assignees={["ana", "long"]}
          onAssigneesChange={() => {}}
          cycles={[{ id: "c", label: "Ciclo con un nombre muy largo para el select" }]}
          cycle="c"
          onCycleChange={() => {}}
          sortKey="effort"
          sortDir="desc"
          onSortChange={() => {}}
          onReset={() => setQuery("")}
          onExpand={() => {}}
          onRestore={() => {}}
        />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <ToolbarDemo />
        </div>
      </StressCase>
    </main>
  )
}
