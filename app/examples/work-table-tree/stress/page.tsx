"use client"

import { StressCase } from "@/app/examples/stress-case"
import { WorkTableTree } from "@/registry/blocks/work-table-tree"

export default function WorkTableTreeStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Árbol de secciones</h1>
      <StressCase label="Cargando" width={320}>
        <WorkTableTree state="loading" />
      </StressCase>
      <StressCase label="Error">
        <WorkTableTree state="error" errorMessage="Sin red" />
      </StressCase>
      <StressCase label="Árbol en 320px" width={320}>
        <WorkTableTree />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <WorkTableTree />
        </div>
      </StressCase>
    </main>
  )
}
