"use client"

import { StressCase } from "@/app/examples/stress-case"
import { MorphDialog } from "@/registry/ui/morph-dialog"

const long = "TituloSinEspaciosQueDebeQuedarseDentroDelPanel"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Diálogo que crece</h1>
      <StressCase label="320px" width={320}>
        <MorphDialog label="Abrir" title={long} description="Texto corto.">
          <p className="text-sm">Una frase.</p>
        </MorphDialog>
      </StressCase>
      <StressCase label="Vacío">
        <MorphDialog label="Vacío" title="Sin cuerpo" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <MorphDialog label="فتح" title="ملاحظة" description="نص عربي قصير.">
            <p className="text-sm">تفاصيل</p>
          </MorphDialog>
        </div>
      </StressCase>
      <StressCase label="Diez">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, index) => (
            <MorphDialog key={index} label={String(index + 1)} title={`Nota ${index + 1}`} />
          ))}
        </div>
      </StressCase>
    </main>
  )
}
