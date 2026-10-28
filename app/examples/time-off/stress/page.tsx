"use client"

import { StressCase } from "@/app/examples/stress-case"
import { TimeOffBlock } from "@/registry/blocks/time-off"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Ausencias</h1>
      <StressCase label="Vacío"><TimeOffBlock anchor="2026-09-14" now="2026-09-16T16:00:00.000Z" /></StressCase>
      <StressCase label="Carga y error">
        <TimeOffBlock loading anchor="2026-09-14" now="2026-09-16T16:00:00.000Z" />
        <TimeOffBlock error={token} anchor="2026-09-14" now="2026-09-16T16:00:00.000Z" requests={[{ id: "a", who: token, kind: token, range: token, days: "1", status: "pending" }]} />
      </StressCase>
      <StressCase label="320px" width={320}>
        <TimeOffBlock anchor="2026-09-14" now="2026-09-16T16:00:00.000Z" holidays={[{ date: "2026-09-16", title: token }]} requests={[{ id: "a", who: "María", kind: "Vacaciones", range: "14–18", days: "4", status: "pending" }]} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl"><TimeOffBlock anchor="2026-09-14" now="2026-09-16T16:00:00.000Z" labels={{ title: "إجازات", empty: "لا شيء" }} /></div>
      </StressCase>
      <StressCase label="Diez solicitudes">
        <TimeOffBlock
          anchor="2026-09-14"
          now="2026-09-16T16:00:00.000Z"
          requests={Array.from({ length: 10 }, (_, index) => ({ id: `r${index}`, who: `Persona ${index}`, kind: "Personal", range: "1 día", days: "1", status: index === 0 ? "pending" as const : "approved" as const }))}
        />
      </StressCase>
    </main>
  )
}
