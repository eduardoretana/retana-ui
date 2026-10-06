"use client"

import { StressCase } from "@/app/examples/stress-case"
import { SlideToConfirm } from "@/registry/ui/slide-to-confirm"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Deslizar para confirmar</h1>
      <StressCase label="320px" width={320}>
        <SlideToConfirm className="w-full min-w-0" label="Enviar" />
      </StressCase>
      <StressCase label="Cadena larga" width={320}>
        <SlideToConfirm className="w-full min-w-0" label="ConfirmaciónSinEspaciosParaDeslizar" />
      </StressCase>
      <StressCase label="Deshabilitado" width={320}>
        <SlideToConfirm className="w-full min-w-0" disabled label="Espera" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <SlideToConfirm className="w-full min-w-0" label="اسحب للتأكيد" />
        </div>
      </StressCase>
      <StressCase label="Vacío" width={320}>
        <SlideToConfirm className="w-full min-w-0" label="" />
      </StressCase>
    </main>
  )
}
