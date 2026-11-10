"use client"

import { StressCase } from "@/app/examples/stress-case"
import { InboxCrm } from "@/registry/blocks/inbox-crm"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Bandeja de mensajes</h1>
      <StressCase label="Vacío">
        <InboxCrm layout="wide" status="empty" emptyLabel="No hay conversaciones" conversations={[]} />
      </StressCase>
      <StressCase label="Carga y error">
        <InboxCrm layout="wide" status="loading" />
        <InboxCrm layout="wide" status="error" error="No se pudo abrir la bandeja." onRetry={() => {}} />
      </StressCase>
      <StressCase label="320px" width={320}>
        <InboxCrm
          layout="phone"
          initialColumn="thread"
          threadTitle={token}
          messages={[{ id: "m", side: "incoming", author: token, body: token }]}
          conversations={[{ id: "a", title: token, preview: token, time: "10:44", unread: 1 }]}
          party={{ name: token, meta: token, facts: [], members: [], files: [] }}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <InboxCrm
            layout="wide"
            title="رسائل"
            conversations={[{ id: "a", title: "ورشة", preview: "مرحبا", time: "١٠:٤٤" }]}
            messages={[{ id: "m", side: "incoming", author: "ورشة", body: "هل يمكننا التحدث؟" }]}
            party={{ name: "ورشة", facts: [{ id: "n", label: "المبلغ", value: "١٢" }], members: [], files: [] }}
          />
        </div>
      </StressCase>
      <StressCase label="Diez filas">
        <InboxCrm
          layout="tablet"
          conversations={Array.from({ length: 10 }, (_, index) => ({
            id: `c${index}`,
            title: index === 0 ? "" : `Cliente ${index}`,
            preview: "Hola",
            time: "Lun",
            unread: index === 3 ? 1 : 0,
          }))}
        />
      </StressCase>
    </main>
  )
}
