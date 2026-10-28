"use client"

import { StressCase } from "@/app/examples/stress-case"
import { DecisionInbox } from "@/registry/ui/decision-inbox"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Bandeja de decisiones</h1>
      <StressCase label="Vacío, carga y error">
        <DecisionInbox />
        <DecisionInbox loading />
        <DecisionInbox error="No pudimos guardar la respuesta." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <DecisionInbox
          items={[
            {
              id: "a",
              title: token,
              detail: token,
              agent: token,
              choices: [
                { id: "1", label: token },
                { id: "2", label: "Sí" },
              ],
            },
          ]}
        />
      </StressCase>
      <StressCase label="RTL y respondida" width={360}>
        <div dir="rtl">
          <DecisionInbox
            items={[
              {
                id: "a",
                title: "قرار",
                detail: token,
                choices: [
                  { id: "1", label: "اليوم" },
                  { id: "2", label: "الجمعة" },
                ],
                answerId: "2",
              },
            ]}
            onDismiss={() => {}}
          />
        </div>
      </StressCase>
      <StressCase label="Diez llamadas">
        <DecisionInbox
          items={Array.from({ length: 10 }, (_, index) => ({
            id: `d${index}`,
            title: index === 0 ? "" : `Decisión ${index}`,
            choices: [
              { id: "a", label: "Sí" },
              { id: "b", label: "No" },
            ],
          }))}
        />
      </StressCase>
    </main>
  )
}
