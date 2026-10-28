"use client"

import { StressCase } from "@/app/examples/stress-case"
import { InlineDiff } from "@/registry/ui/inline-diff"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Diff en la prosa</h1>
      <StressCase label="Vacío">
        <InlineDiff />
      </StressCase>
      <StressCase label="Carga y error">
        <InlineDiff loading />
        <InlineDiff error="No se leyó el cambio." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <InlineDiff original={token} suggested={`${token} extra`} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <InlineDiff original="النص القديم" suggested="النص الجديد" />
        </div>
      </StressCase>
      <StressCase label="Diez cambios">
        <InlineDiff original={Array.from({ length: 10 }, (_, index) => `viejo${index}`).join(" ")} suggested={Array.from({ length: 10 }, (_, index) => `nuevo${index}`).join(" ")} />
      </StressCase>
    </main>
  )
}
