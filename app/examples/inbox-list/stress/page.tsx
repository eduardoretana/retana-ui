"use client"

import { InboxList } from "@/registry/ui/inbox-list"
import { LONG_TOKEN } from "@/app/examples/desk/bruma"

const one = [{ id: "1", title: "Ana", preview: "Hola", time: "1" }]
const many = Array.from({ length: 10 }, (_, index) => ({
  id: String(index),
  title: index === 3 ? LONG_TOKEN : `Persona ${index + 1}`,
  preview: index === 4 ? "🙂 مرحبا" : "Vista previa",
  time: String(index),
  unread: index % 3 === 0 ? index : 0,
  presence: (["online", "offline", "away"] as const)[index % 3],
}))

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Lista</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Vacío</h2>
        <div className="h-48 rounded-xl border border-border"><InboxList className="h-full" label="Vacío" items={[]} emptyTitle="Nada" emptyDescription="Sin filas" /></div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Una fila</h2>
        <div className="h-40 rounded-xl border border-border"><InboxList className="h-full" label="Una" items={one} /></div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">320px y diez filas</h2>
        <div className="h-80 w-80 max-w-full overflow-hidden rounded-xl border border-border">
          <InboxList className="h-full" label="Estrecho" items={many} selectedId="3" />
        </div>
      </section>
      <section className="flex gap-2" dir="rtl">
        <h2 className="sr-only">RTL</h2>
        <div className="h-48 min-w-0 flex-1 rounded-xl border border-border">
          <InboxList className="h-full" label="RTL" items={[{ id: "r", title: "مرحبا", preview: LONG_TOKEN, time: "١٢" }]} />
        </div>
      </section>
    </main>
  )
}
