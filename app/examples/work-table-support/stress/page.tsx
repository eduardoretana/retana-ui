"use client"

import { StressCase } from "@/app/examples/stress-case"
import { WorkTableSupport } from "@/registry/blocks/work-table-support"

export default function WorkTableSupportStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Cola de soporte</h1>
      <StressCase label="Cargando" width={320}>
        <WorkTableSupport state="loading" />
      </StressCase>
      <StressCase label="Error">
        <WorkTableSupport state="error" errorMessage="Sin red" />
      </StressCase>
      <StressCase label="Cola en 320px" width={320}>
        <WorkTableSupport />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <WorkTableSupport />
        </div>
      </StressCase>
    </main>
  )
}
