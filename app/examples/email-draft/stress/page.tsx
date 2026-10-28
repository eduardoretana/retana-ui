"use client"

import { StressCase } from "@/app/examples/stress-case"
import { EmailDraft } from "@/registry/ui/email-draft"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Borrador de correo</h1>
      <StressCase label="Vacío">
        <EmailDraft />
      </StressCase>
      <StressCase label="Carga y error">
        <EmailDraft loading />
        <EmailDraft error="No se leyó el borrador." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <EmailDraft reference={token} account={token} contacts={[{ id: "a", name: token, email: `${token}@ejemplo.test` }]} body={token} attachment={token} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <EmailDraft reference="طلب" contacts={[{ id: "a", name: "رامون", email: "ramon@ejemplo.test" }]} body="نص الرسالة" />
        </div>
      </StressCase>
      <StressCase label="Diez destinatarios">
        <EmailDraft
          reference="PED-990"
          contacts={Array.from({ length: 10 }, (_, index) => ({ id: String(index), name: index === 0 ? "" : `Persona ${index}`, email: `p${index}@ejemplo.test` }))}
          body="Hola."
        />
      </StressCase>
    </main>
  )
}
