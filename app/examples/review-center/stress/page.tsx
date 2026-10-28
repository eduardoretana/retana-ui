"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ReviewCenter, type ReviewItem } from "@/registry/ui/review-center"

const token = "N".repeat(60)

const item = (id: string, risk: ReviewItem["risk"]): ReviewItem => ({
  id,
  title: id === "largo" ? token : `Pieza ${id}`,
  agent: "Bruma",
  type: "Nota",
  risk,
  confidence: id === "duda" ? 0.4 : 0.9,
  waiting: "1 min",
  body: [{ text: token, note: id === "duda" ? token : undefined }],
})

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Centro de revisión</h1>
      <StressCase label="Vacío">
        <ReviewCenter />
      </StressCase>
      <StressCase label="Carga y error">
        <ReviewCenter loading />
        <ReviewCenter error="No se leyó la fila." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <ReviewCenter items={[item("largo", "high")]} selectedId="largo" />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <ReviewCenter items={[{ id: "rtl", title: "مراجعة", agent: "Bruma", type: "ملاحظة", risk: "low", confidence: 0.8, waiting: "١ د", body: [{ text: "نص" }] }]} />
        </div>
      </StressCase>
      <StressCase label="Diez piezas">
        <ReviewCenter items={Array.from({ length: 10 }, (_, index) => item(String(index), index === 0 ? "high" : "low"))} />
      </StressCase>
    </main>
  )
}
