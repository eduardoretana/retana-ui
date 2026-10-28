"use client"

import { StressCase } from "@/app/examples/stress-case"
import { TimeOffStats } from "@/registry/ui/time-off-stats"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Saldo</h1>
      <StressCase label="Vacío"><TimeOffStats /></StressCase>
      <StressCase label="Carga y error"><TimeOffStats loading /><TimeOffStats available={1} error={token} /></StressCase>
      <StressCase label="320px" width={320}><TimeOffStats available={0} pending={12} years={[{ year: 2026, granted: 12, used: 12 }]} /></StressCase>
      <StressCase label="RTL" width={360}><div dir="rtl"><TimeOffStats available={3} labels={{ title: "رصيد" }} /></div></StressCase>
      <StressCase label="Diez años">
        <TimeOffStats available={1} years={Array.from({ length: 10 }, (_, index) => ({ year: 2020 + index, granted: 12, used: index }))} />
      </StressCase>
    </main>
  )
}
