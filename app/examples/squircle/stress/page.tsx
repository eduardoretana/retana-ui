"use client"

import { StressCase } from "@/app/examples/stress-case"
import { Squircle } from "@/registry/ui/squircle"

const long = "SupercalifragilisticoespialidosoSinEspaciosEnUnaEsquinaSuave"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Squircle</h1>
      <StressCase label="Vacío" width={320}>
        <Squircle radius={24} className="h-16 w-full bg-muted" />
      </StressCase>
      <StressCase label="Una palabra" width={320}>
        <Squircle radius={20} className="grid h-16 place-items-center bg-card">Hola</Squircle>
      </StressCase>
      <StressCase label="Cadena larga" width={320}>
        <Squircle radius={16} className="break-all bg-card p-3 text-sm">{long}</Squircle>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Squircle radius={24} className="bg-muted p-3 text-sm">مرحبا بالعالم</Squircle>
        </div>
      </StressCase>
      <StressCase label="Diez" width={320}>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, index) => (
            <Squircle key={index} radius={12} borderWidth={1} className="grid size-12 place-items-center bg-background text-xs">
              {index + 1}
            </Squircle>
          ))}
        </div>
      </StressCase>
      <StressCase label="Ancho">
        <Squircle radius={40} shadow className="h-24 w-[960px] bg-card" />
      </StressCase>
    </main>
  )
}
