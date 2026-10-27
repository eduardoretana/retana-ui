"use client"

import { StressCase } from "@/app/examples/stress-case"
import { AgentLedger } from "@/registry/ui/agent-ledger"

const token = "N".repeat(60)
const now = Date.parse("2026-10-27T17:40:00.000Z")

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Libro de cambios</h1>
      <StressCase label="Vacío, carga y error">
        <AgentLedger now={now} />
        <AgentLedger now={now} loading />
        <AgentLedger now={now} error="No pudimos abrir el libro." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <AgentLedger
          now={now}
          changes={[
            { id: "a", summary: token, system: token, before: token, after: token, at: now - 120000, follows: [] },
          ]}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <AgentLedger
            now={now}
            agent="وكيل"
            changes={[
              { id: "a", summary: "سعر", system: "طلبات", before: "١٦٬٢٠٠", after: "١٨٬٤٠٠", at: now - 60000 },
              { id: "b", summary: token, system: "بريد", at: now, reversible: false, follows: ["a"] },
            ]}
          />
        </div>
      </StressCase>
      <StressCase label="Diez cambios">
        <AgentLedger
          now={now}
          changes={Array.from({ length: 10 }, (_, index) => ({
            id: `c${index}`,
            summary: index === 0 ? "" : `Cambio ${index}`,
            system: "Pedidos",
            at: now - index * 60000,
            follows: index === 0 ? [] : [`c${index - 1}`],
          }))}
        />
      </StressCase>
    </main>
  )
}
