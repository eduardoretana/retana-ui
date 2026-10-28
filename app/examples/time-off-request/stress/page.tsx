"use client"

import { StressCase } from "@/app/examples/stress-case"
import { TimeOffRequest } from "@/registry/ui/time-off-request"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Solicitud</h1>
      <StressCase label="Vacío"><TimeOffRequest /></StressCase>
      <StressCase label="Carga y error"><TimeOffRequest loading available={1} /><TimeOffRequest available={1} error={token} defaultStart="2026-10-05" defaultEnd="2026-10-06" /></StressCase>
      <StressCase label="320px" width={320}>
        <TimeOffRequest available={0} pending={1} defaultStart="2026-10-05" defaultEnd="2026-10-06" defaultNote={token} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl"><TimeOffRequest available={2} labels={{ title: "طلب", vacation: "إجازة" }} defaultStart="2026-10-05" defaultEnd="2026-10-06" /></div>
      </StressCase>
      <StressCase label="Diez tipos">
        <TimeOffRequest
          available={4}
          defaultStart="2026-10-05"
          defaultEnd="2026-10-06"
          kinds={Array.from({ length: 10 }, (_, index) => ({ id: `k${index}`, label: `Tipo ${index}`, portion: "day" as const }))}
        />
      </StressCase>
    </main>
  )
}
