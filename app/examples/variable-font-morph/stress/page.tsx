"use client"

import { StressCase } from "@/app/examples/stress-case"
import { VariableFontMorph } from "@/registry/ui/variable-font-morph"

const token = "W".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Morph de fuente variable</h1>
      <StressCase label="Vacío">
        <VariableFontMorph />
      </StressCase>
      <StressCase label="Carga y error">
        <VariableFontMorph loading />
        <VariableFontMorph error="No se cargó la fuente." />
      </StressCase>
      <StressCase label="Una palabra">
        <VariableFontMorph text="Barro" />
      </StressCase>
      <StressCase label="320px y cadena sin espacios" width={320}>
        <VariableFontMorph text={token} />
      </StressCase>
      <StressCase label="Emoji, RTL y números" width={360}>
        <div dir="rtl">
          <VariableFontMorph text="الفرن 🔥 ١٢٤٠" />
        </div>
      </StressCase>
      <StressCase label="Eje inválido (cae a wght) y sin reserva">
        <VariableFontMorph text="Eje" axis="weight" reserve={false} />
      </StressCase>
    </main>
  )
}
