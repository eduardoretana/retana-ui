"use client"

import { StressCase } from "@/app/examples/stress-case"
import { WorkTableQueue } from "@/registry/blocks/work-table-queue"

export default function WorkTableQueueStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Cola con ranking</h1>
      <StressCase label="Cargando" width={320}>
        <WorkTableQueue state="loading" />
      </StressCase>
      <StressCase label="Error">
        <WorkTableQueue state="error" errorMessage="Sin red" />
      </StressCase>
      <StressCase label="Cola en 320px" width={320}>
        <WorkTableQueue />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <WorkTableQueue />
        </div>
      </StressCase>
    </main>
  )
}
