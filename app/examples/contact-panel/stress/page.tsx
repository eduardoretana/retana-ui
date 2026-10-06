"use client"

import { ContactPanel } from "@/registry/ui/contact-panel"
import { LONG_TOKEN } from "@/app/examples/desk/bruma"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Ficha</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">320px, nombre largo, sin secciones</h2>
        <div className="h-80 w-80 max-w-full overflow-hidden rounded-xl border border-border">
          <ContactPanel className="h-full" contactName={LONG_TOKEN} presence="online" fields={[]} copilotEmpty="🙂" />
        </div>
      </section>
      <section className="grid gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Diez campos</h2>
        <div className="h-96 overflow-hidden rounded-xl border border-border">
          <ContactPanel
            className="h-full"
            contactName="إينيس"
            fields={Array.from({ length: 10 }, (_, index) => ({ id: String(index), label: `حقل ${index}`, value: index === 0 ? LONG_TOKEN : "قيمة", readOnly: true }))}
            sections={[{ id: "a", title: "قسم", content: <p>مرحبا</p> }]}
          />
        </div>
      </section>
    </main>
  )
}
