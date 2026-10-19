"use client"

import { StressCase } from "@/app/examples/stress-case"

import { Integrations } from "@/registry/blocks/integrations"

const long = "a".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Integraciones</h1>
      <StressCase label="320px" width={320}>
        <Integrations shell={false} />
      </StressCase>
      <StressCase label="Vacío">
        <Integrations shell={false} categories={[]} items={[]} />
      </StressCase>
      <StressCase label="60 caracteres y diez fichas">
        <Integrations
          shell={false}
          items={Array.from({ length: 10 }, (_, index) => ({
            id: `i-${index}`,
            name: index === 0 ? long : `Pieza ${index}`,
            category: "data",
            description: index === 1 ? "😀 مرحبا" : "Descripción corta",
          }))}
        />
      </StressCase>
    </main>
  )
}
