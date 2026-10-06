"use client"

import { StressCase } from "@/app/examples/stress-case"
import { MotionPreferenceControl } from "@/registry/ui/motion-preference"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Preferencia de movimiento</h1>
      <StressCase label="320px" width={320}>
        <MotionPreferenceControl label="Movimiento de la interfaz en este navegador" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <MotionPreferenceControl label="الحركة" />
        </div>
      </StressCase>
      <StressCase label="Diez">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }, (_, index) => (
            <MotionPreferenceControl key={index} label={`Zona ${index + 1}`} />
          ))}
        </div>
      </StressCase>
    </main>
  )
}
