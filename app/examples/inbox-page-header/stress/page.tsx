"use client"

import { StressCase } from "@/app/examples/stress-case"
import { InboxPageHeader } from "@/registry/ui/inbox-page-header"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Encabezado</h1>
      <StressCase label="Vacío"><InboxPageHeader title="Mensajes" status="empty" /></StressCase>
      <StressCase label="Carga y error"><InboxPageHeader title="Mensajes" status="loading" /><InboxPageHeader title="Mensajes" status="error" error="Fallo" /></StressCase>
      <StressCase label="320px" width={320}><InboxPageHeader title={token} subtitle={token} actions={[{ id: "a", label: token }]} bellLabel="Avisos" bellCount={99} /></StressCase>
      <StressCase label="RTL" width={360}><div dir="rtl"><InboxPageHeader title="رسائل" subtitle="عميلان" crumbs={[{ label: "مساحة" }, { label: "رسائل" }]} /></div></StressCase>
    </main>
  )
}
