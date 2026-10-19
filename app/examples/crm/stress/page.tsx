"use client"

import { StressCase } from "@/app/examples/stress-case"

import { CrmSheet } from "@/registry/blocks/crm"

const long = "a".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Hoja de ventas</h1>
      <StressCase label="320px" width={320}>
        <CrmSheet shell={false} className="h-[24rem]" />
      </StressCase>
      <StressCase label="Vacío y solo lectura">
        <CrmSheet shell={false} rows={[]} readOnly title="Horno" />
      </StressCase>
      <StressCase label="60 caracteres, RTL y diez filas" width={720}>
        <div dir="rtl">
          <CrmSheet
            shell={false}
            rows={Array.from({ length: 10 }, (_, index) => ({
              id: `r-${index}`,
              company: index === 0 ? long : `Empresa ${index}`,
              stage: "lead",
              owner: index === 1 ? "مرحبا" : "Ana",
              value: index * 1000,
            }))}
          />
        </div>
      </StressCase>
    </main>
  )
}
