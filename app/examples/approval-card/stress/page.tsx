"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ApprovalCard } from "@/registry/ui/approval-card"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Compuerta de aprobación</h1>
      <StressCase label="Vacío">
        <ApprovalCard />
      </StressCase>
      <StressCase label="Carga y error">
        <ApprovalCard loading />
        <ApprovalCard error="No pudimos leer la compuerta." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <ApprovalCard
          proposal={{ id: "largo", title: token, preview: token, detail: token, risk: "high", secondsLeft: 3, status: "open" }}
          onApprove={() => {}}
          onDecline={() => {}}
          onHold={() => {}}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <ApprovalCard proposal={{ id: "a", title: "تحويل", preview: token, risk: "guarded", secondsLeft: 0, status: "open" }} onApprove={() => {}} onDecline={() => {}} />
        </div>
      </StressCase>
      <StressCase label="Resuelta">
        <ApprovalCard proposal={{ id: "ok", title: "Nota del viernes", preview: "Quedó en el expediente.", risk: "low", secondsLeft: 0, status: "approved" }} />
      </StressCase>
    </main>
  )
}
