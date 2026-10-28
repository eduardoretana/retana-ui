"use client"

import { StressCase } from "@/app/examples/stress-case"
import { MessageActions } from "@/registry/ui/message-actions"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Acciones del mensaje</h1>
      <StressCase label="Vacío">
        <MessageActions />
      </StressCase>
      <StressCase label="Carga y error">
        <MessageActions loading />
        <MessageActions error="No se leyó el mensaje." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <MessageActions text={token} versions={[token, token]} speaking feedback="down" />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <MessageActions text="الجواب" />
        </div>
      </StressCase>
      <StressCase label="Diez versiones">
        <MessageActions text="Versión" versions={Array.from({ length: 10 }, (_, index) => (index === 0 ? "" : `Versión ${index}`))} version={1} />
      </StressCase>
    </main>
  )
}
