"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ToolApproval } from "@/registry/ui/tool-approval"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Aprobación de herramienta</h1>
      <StressCase label="320px" width={320}>
        <ToolApproval toolName={token} reason={token} risk="high" args={{ nota: token }} />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <ToolApproval toolName="pagar_proveedor" reason={token} args={{ nota: token }} />
        </div>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <ToolApproval toolName="أداة" reason="ملاحظة طويلة" args={{ nota: token }} />
        </div>
      </StressCase>
      <StressCase label="Vacío, una palabra y 60 caracteres">
        <ToolApproval toolName="" />
        <ToolApproval toolName="A" />
        <ToolApproval toolName={token} />
      </StressCase>
    </main>
  )
}
