"use client"

import { StressCase } from "@/app/examples/stress-case"
import { GuardApprovalQueue } from "@/registry/ui/guard-approval-queue"

import { filled, now } from "../fixtures"

const token = "Q".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Cola de aprobaciones</h1>
      <StressCase label="Vacío, carga y error">
        <GuardApprovalQueue items={[]} now={now} locale="es" />
        <GuardApprovalQueue items={[]} now={now} status="loading" locale="es" />
        <GuardApprovalQueue items={filled} now={now} status="error" errorMessage={token} locale="es" />
      </StressCase>
      <StressCase label="320px" width={320}>
        <GuardApprovalQueue items={[{ ...filled[0]!, summary: token, kind: token }]} now={now} role="approver" locale="es" onApprove={() => {}} onReject={() => {}} />
      </StressCase>
      <StressCase label="Diez filas">
        <GuardApprovalQueue
          items={Array.from({ length: 10 }, (_, index) => ({ ...filled[0]!, id: `apr_${index}`, summary: index === 0 ? "" : `Caso ficticio ${index}` }))}
          now={now}
          role="viewer"
          locale="es"
        />
      </StressCase>
    </main>
  )
}
