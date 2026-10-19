"use client"

import { StressCase } from "@/app/examples/stress-case"

import { EvalReview } from "@/registry/blocks/evals"

const long = "a".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Evaluaciones</h1>
      <StressCase label="320px" width={320}>
        <EvalReview shell={false} />
      </StressCase>
      <StressCase label="Vacío">
        <EvalReview shell={false} kpis={[]} versions={[]} prompt={{ before: "", after: "" }} cases={[]} title="Horno" />
      </StressCase>
      <StressCase label="60 caracteres, RTL y diez casos">
        <div dir="rtl">
          <EvalReview
            shell={false}
            title={long}
            prompt={{ before: long, after: "😀\nمرحبا" }}
            cases={Array.from({ length: 10 }, (_, index) => ({
              id: `c-${index}`,
              name: `Caso ${index + 1}`,
              status: index % 2 === 0 ? "pass" : "fail",
              score: "1",
              note: index === 0 ? long : "Nota",
            }))}
          />
        </div>
      </StressCase>
    </main>
  )
}
