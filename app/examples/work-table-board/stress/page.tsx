"use client"

import { StressCase } from "@/app/examples/stress-case"
import { WorkTableBoard } from "@/registry/blocks/work-table-board"

export default function WorkTableBoardStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tablero agrupado</h1>
      <StressCase label="Cargando" width={320}>
        <WorkTableBoard state="loading" />
      </StressCase>
      <StressCase label="Error">
        <WorkTableBoard state="error" errorMessage="Sin red" />
      </StressCase>
      <StressCase label="Grupos en 320px" width={320}>
        <WorkTableBoard />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <WorkTableBoard />
        </div>
      </StressCase>
    </main>
  )
}
