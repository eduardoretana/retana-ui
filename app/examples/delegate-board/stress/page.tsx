"use client"

import { StressCase } from "@/app/examples/stress-case"
import { DelegateBoard } from "@/registry/ui/delegate-board"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tablero de delegación</h1>
      <StressCase label="Vacío, carga y error">
        <DelegateBoard />
        <DelegateBoard loading />
        <DelegateBoard error="No pudimos cargar la entrega." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <DelegateBoard
          tasks={[{ id: "a", title: token, detail: token, minutes: 9999 }]}
          agents={[{ id: "b", name: token, role: token, bookedMinutes: 400 }]}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <DelegateBoard
            tasks={[{ id: "a", title: "مهمة", detail: token, minutes: 15 }]}
            agents={[{ id: "b", name: "عامل", role: "إنتاج", bookedMinutes: 30 }]}
          />
        </div>
      </StressCase>
      <StressCase label="Diez tareas">
        <DelegateBoard
          mode="auto"
          tasks={Array.from({ length: 10 }, (_, index) => ({
            id: `t${index}`,
            title: index === 0 ? "" : `Tarea ${index}`,
            minutes: 10 + index,
            agentId: index > 6 ? "bruma" : null,
          }))}
          agents={[
            { id: "bruma", name: "Bruma", role: "Cotizaciones", bookedMinutes: 0 },
            { id: "horno", name: "Horno", role: "Producción", bookedMinutes: 0 },
          ]}
        />
      </StressCase>
    </main>
  )
}
