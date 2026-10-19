"use client"

import { StressCase } from "@/app/examples/stress-case"

import { Onboarding } from "@/registry/blocks/onboarding"

const long = "a".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Puesta en marcha</h1>
      <StressCase label="320px" width={320}>
        <Onboarding />
      </StressCase>
      <StressCase label="Vacío">
        <Onboarding steps={[]} tools={[]} checks={[]} workspaceDefault="" />
      </StressCase>
      <StressCase label="60 caracteres y diez herramientas" width={640}>
        <Onboarding
          workspaceDefault={long}
          defaultStep={1}
          tools={Array.from({ length: 10 }, (_, index) => ({ id: `t-${index}`, name: index === 0 ? long : `Tool ${index}`, detail: "😀" }))}
          checks={[{ id: "rtl", label: "مرحبا", done: false }]}
        />
      </StressCase>
    </main>
  )
}
