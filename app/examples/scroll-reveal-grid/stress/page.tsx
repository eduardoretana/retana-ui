"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ScrollRevealGrid, type ScrollRevealGridItem } from "@/registry/ui/scroll-reveal-grid"

const token = "W".repeat(60)
const many: ScrollRevealGridItem[] = Array.from({ length: 30 }, (_, index) => ({ id: `p${index}`, eyebrow: `#${index + 1}`, title: `Pieza ${index + 1}`, description: "Plato hondo, esmalte cobalto." }))

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Rejilla que aparece al desplazar</h1>
      <StressCase label="Vacío">
        <ScrollRevealGrid />
      </StressCase>
      <StressCase label="Carga y error">
        <ScrollRevealGrid loading />
        <ScrollRevealGrid error="No se cargaron los pasos." />
      </StressCase>
      <StressCase label="Una tarjeta, una palabra">
        <ScrollRevealGrid items={[{ id: "a", title: "Taller" }]} />
      </StressCase>
      <StressCase label="320px y cadena sin espacios" width={320}>
        <ScrollRevealGrid items={[{ id: "a", title: token, description: token }]} />
      </StressCase>
      <StressCase label="Emoji, RTL y números" width={360}>
        <div dir="rtl">
          <ScrollRevealGrid items={[{ id: "a", eyebrow: "١٢٣", title: "ورشة الخزف 🏺", description: "1240 °C" }]} columns={2} />
        </div>
      </StressCase>
      <StressCase label="Apretado por un hermano">
        <div className="flex gap-4">
          <div className="w-64 shrink-0 rounded-lg border p-4 text-sm">Hermano</div>
          <ScrollRevealGrid className="min-w-0 flex-1" items={many.slice(0, 4)} columns={2} />
        </div>
      </StressCase>
      <StressCase label="Treinta tarjetas (diez veces más)">
        <ScrollRevealGrid items={many} />
      </StressCase>
    </main>
  )
}
