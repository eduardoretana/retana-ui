"use client"

import { StressCase } from "@/app/examples/stress-case"
import { PromptLibrary } from "@/registry/ui/prompt-library"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Biblioteca de prompts</h1>
      <StressCase label="Vacío">
        <PromptLibrary />
      </StressCase>
      <StressCase label="Carga y error">
        <PromptLibrary loading />
        <PromptLibrary error="No pudimos leer los prompts." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <PromptLibrary
          selectedId="a"
          templates={[{ id: "a", title: token, category: token, body: `Hola {nombre}. ${token}`, variables: [{ name: "nombre", description: token }] }]}
          values={{ nombre: token }}
          onUse={() => {}}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <PromptLibrary selectedId="a" templates={[{ id: "a", title: "ملاحظة", body: "إلى {اسم}", variables: [{ name: "اسم" }] }]} />
        </div>
      </StressCase>
      <StressCase label="Diez prompts">
        <PromptLibrary
          templates={Array.from({ length: 10 }, (_, index) => ({
            id: `p${index}`,
            title: index === 0 ? "" : `Prompt ${index}`,
            category: "Taller",
            body: "Texto {campo}",
            variables: [{ name: "campo" }],
          }))}
        />
      </StressCase>
    </main>
  )
}
