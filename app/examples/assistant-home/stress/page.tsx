"use client"

import { StressCase } from "@/app/examples/stress-case"

import { AssistantHome } from "@/registry/blocks/assistant-home"

const long = "a".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Inicio del asistente</h1>
      <StressCase label="320px" width={320}>
        <AssistantHome shell={false} className="min-h-0" />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <AssistantHome shell={false} />
        </div>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <AssistantHome shell={false} greeting="مرحبا" name="" />
        </div>
      </StressCase>
      <StressCase label="Vacío, una palabra, 60 caracteres y enviando">
        <AssistantHome
          shell={false}
          pending
          greeting="Hola"
          name={long}
          hint=""
          models={[]}
          plugins={[]}
          apps={[]}
          actions={[{ id: "one", label: "Horno", prompt: "Horno" }]}
          placeholder={long}
        />
      </StressCase>
    </main>
  )
}
