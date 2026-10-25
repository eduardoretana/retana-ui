"use client"

import { InlineApproveButton } from "@/registry/ui/inline-approve-button"

const token = "Y".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Aprobar</h1>

      <section className="flex max-w-80 flex-col gap-2">
        <h2 className="text-sm font-medium">Reposo en 320px</h2>
        <InlineApproveButton onConfirm={() => undefined} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Pendiente, éxito y error</h2>
        <InlineApproveButton state="pending" />
        <InlineApproveButton state="success" />
        <InlineApproveButton state="error" onConfirm={() => undefined} />
      </section>

      <section className="flex max-w-80 flex-col gap-2">
        <h2 className="text-sm font-medium">Etiqueta larga</h2>
        <InlineApproveButton labels={{ idle: token, success: token }} onConfirm={() => undefined} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Emoji y números</h2>
        <InlineApproveButton labels={{ idle: "📦 Aprobar 1.250" }} onConfirm={() => undefined} />
      </section>

      <section className="flex flex-col gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Texto de derecha a izquierda</h2>
        <InlineApproveButton labels={{ idle: "اعتماد", success: "تم" }} onConfirm={() => undefined} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Deshabilitado</h2>
        <InlineApproveButton disabled onConfirm={() => undefined} />
      </section>
    </main>
  )
}
