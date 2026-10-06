"use client"

import { StressCase } from "@/app/examples/stress-case"
import { SpotlightButton } from "@/registry/ui/spotlight-button"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Botón con foco de luz</h1>
      <StressCase label="320px" width={320}>
        <SpotlightButton className="max-w-full">Continuar con el envío</SpotlightButton>
      </StressCase>
      <StressCase label="Cadena larga" width={320}>
        <SpotlightButton className="max-w-full">
          <span className="truncate">ConfirmaciónSinEspaciosDelBoton</span>
        </SpotlightButton>
      </StressCase>
      <StressCase label="Deshabilitado">
        <SpotlightButton disabled>Continuar</SpotlightButton>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <SpotlightButton variant="outline">متابعة</SpotlightButton>
        </div>
      </StressCase>
      <StressCase label="Diez">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, index) => (
            <SpotlightButton key={index} variant={index % 2 ? "outline" : "default"}>{index + 1}</SpotlightButton>
          ))}
        </div>
      </StressCase>
    </main>
  )
}
