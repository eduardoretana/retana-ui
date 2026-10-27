"use client"

import { StressCase } from "@/app/examples/stress-case"
import { CitedAnswer } from "@/registry/ui/cited-answer"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Respuesta con fuentes</h1>
      <StressCase label="Vacío">
        <CitedAnswer />
      </StressCase>
      <StressCase label="Carga y error">
        <CitedAnswer loading />
        <CitedAnswer error="No pudimos armar la respuesta." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <CitedAnswer segments={[{ id: "a", text: token, cite: ["s"] }]} sources={[{ id: "s", title: token, site: token, quote: token }]} openId="s" onOpen={() => {}} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <CitedAnswer segments={[{ id: "a", text: "الجواب", cite: ["s"] }]} sources={[{ id: "s", title: "مصدر", site: "ملف" }]} />
        </div>
      </StressCase>
      <StressCase label="Diez fuentes">
        <CitedAnswer
          segments={[{ id: "a", text: "Texto", cite: ["missing", "s1"] }]}
          sources={Array.from({ length: 10 }, (_, index) => ({
            id: `s${index}`,
            title: index === 0 ? "" : `Fuente ${index}`,
            site: "Taller",
          }))}
        />
      </StressCase>
    </main>
  )
}
