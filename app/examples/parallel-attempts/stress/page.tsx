"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ParallelAttempts } from "@/registry/ui/parallel-attempts"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Intentos en paralelo</h1>
      <StressCase label="Vacío">
        <ParallelAttempts />
      </StressCase>
      <StressCase label="Carga y error">
        <ParallelAttempts loading />
        <ParallelAttempts error="No pudimos leer los intentos." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <ParallelAttempts
          task={token}
          attempts={[{ id: "a", agent: token, approach: token, status: "done", progress: 1, score: 80, note: token }]}
          onPick={() => {}}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <ParallelAttempts attempts={[{ id: "a", agent: "عامل", approach: "ملاحظة", status: "running", progress: 0.4 }]} />
        </div>
      </StressCase>
      <StressCase label="Diez intentos">
        <ParallelAttempts
          attempts={Array.from({ length: 10 }, (_, index) => ({
            id: `a${index}`,
            agent: index === 0 ? "" : `Agente ${index}`,
            approach: index === 0 ? "" : `Camino ${index}`,
            status: (["running", "done", "failed"] as const)[index % 3],
            progress: index / 10,
            score: index % 3 === 1 ? 70 + index : undefined,
          }))}
        />
      </StressCase>
    </main>
  )
}
