"use client"

import { StressCase } from "@/app/examples/stress-case"
import { GuardAuditLog } from "@/registry/ui/guard-audit-log"

import { filled } from "../fixtures"

const token = "B".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Bitácora de guardas</h1>
      <StressCase label="Vacío, carga y error">
        <GuardAuditLog entries={[]} locale="es" />
        <GuardAuditLog entries={[]} status="loading" locale="es" />
        <GuardAuditLog entries={filled} status="error" errorMessage={token} locale="es" />
      </StressCase>
      <StressCase label="320px" width={320}>
        <GuardAuditLog entries={[{ ...filled[0]!, summary: token, kind: token, agentResponse: token }]} locale="es" />
      </StressCase>
      <StressCase label="Diez filas">
        <GuardAuditLog
          entries={Array.from({ length: 10 }, (_, index) => ({ ...filled[0]!, id: `aud_${index}`, summary: index === 0 ? "" : `Fila ficticia ${index}` }))}
          locale="en"
        />
      </StressCase>
    </main>
  )
}
