"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ThreadComposer } from "@/registry/ui/thread-composer"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Compositor</h1>
      <StressCase label="Vacío"><ThreadComposer status="empty" /></StressCase>
      <StressCase label="Carga y error"><ThreadComposer status="loading" /><ThreadComposer status="error" error="Fallo" /></StressCase>
      <StressCase label="320px" width={320}><ThreadComposer placeholder={token} defaultValue={token} /></StressCase>
      <StressCase label="Ventana cerrada"><ThreadComposer locked={{ title: "La ventana de 24 h está cerrada.", action: "Usar plantilla" }} /></StressCase>
      <StressCase label="RTL" width={320}><div dir="rtl"><ThreadComposer placeholder="اكتب رسالة" askLabel="اسأل" sendLabel="إرسال" /></div></StressCase>
    </main>
  )
}
