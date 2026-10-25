"use client"

import { PortfolioDesk } from "@/registry/blocks/portfolio-desk"

import { demoItems, demoMessages, demoNow, demoPeople, demoRows, demoWorkstreams } from "../data"

const token = "Y".repeat(60)

const quiet = {
  gantt: { items: [], now: demoNow },
  table: { rows: [], columns: [{ id: "name", header: "Pieza", cell: () => null }] },
  chat: { messages: [], people: demoPeople, currentUserId: "mina", onSend: () => undefined },
}

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Mesa</h1>

      <section className="flex max-w-80 flex-col gap-2">
        <h2 className="text-sm font-medium">Vacío en 320px</h2>
        <PortfolioDesk title="Vacío" {...quiet} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Cargando</h2>
        <PortfolioDesk
          title="Cargando"
          gantt={{ items: demoItems, loading: true, now: demoNow }}
          table={{ rows: demoRows, columns: quiet.table.columns, loading: true }}
          chat={{ messages: demoMessages, loading: true, onSend: () => undefined }}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Error</h2>
        <PortfolioDesk
          title="Error"
          gantt={{ items: [], error: "Fallo de demostración.", onRetry: () => undefined, now: demoNow }}
          table={{ rows: [], columns: quiet.table.columns, error: "Fallo de demostración.", onRetry: () => undefined }}
          chat={{ messages: [], error: "Fallo de demostración.", onRetry: () => undefined, onSend: () => undefined }}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Título largo, emoji y números</h2>
        <PortfolioDesk title={token} subtitle="📦 1.250,00 pliegos" {...quiet} />
      </section>

      <section className="flex flex-col gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Texto de derecha a izquierda</h2>
        <PortfolioDesk title="مكتب تجريبي" subtitle="وصف قصير" {...quiet} />
      </section>

      <section className="flex min-w-0 gap-3">
        <h2 className="sr-only">Apretada por un hermano</h2>
        <div className="h-40 w-40 shrink-0 rounded-lg border border-border" />
        <div className="min-w-0 flex-1">
          <PortfolioDesk
            title="Taller Bruma"
            gantt={{ items: demoItems.slice(0, 2), workstreams: demoWorkstreams, now: demoNow, labelWidth: 120 }}
            table={{ rows: demoRows.slice(0, 2), columns: quiet.table.columns }}
            chat={{ messages: demoMessages.slice(0, 1), people: demoPeople, currentUserId: "mina", onSend: () => undefined }}
            approval={{ onConfirm: () => undefined }}
          />
        </div>
      </section>
    </main>
  )
}
