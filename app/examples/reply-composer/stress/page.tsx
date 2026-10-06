"use client"

import { ReplyComposer } from "@/registry/ui/reply-composer"
import { LONG_TOKEN } from "@/app/examples/desk/bruma"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Respuesta</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Vacío y deshabilitado</h2>
        <ReplyComposer disabled placeholder="Vacío" />
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Una palabra, emoji y cadena larga</h2>
        <ReplyComposer defaultValue="Hola" suggestions={["🙂"]} />
        <ReplyComposer defaultValue={LONG_TOKEN} />
      </section>
      <section className="grid gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Derecha a izquierda</h2>
        <ReplyComposer defaultValue="مرحبا بالورشة" replyLabel="رد" noteLabel="ملاحظة" sendLabel="إرسال" />
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">320px y hermano en flex</h2>
        <div className="w-80 max-w-full"><ReplyComposer suggestions={["Una", "Dos", "Tres"]} snippets={[{ id: "a", label: "Saludo", body: "Hola" }]} emojis={["🙂"]} /></div>
        <div className="flex">
          <div className="w-40 shrink-0 border border-border p-2 text-sm">Hermano</div>
          <div className="min-w-0 flex-1"><ReplyComposer /></div>
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Diez sugerencias</h2>
        <ReplyComposer suggestions={Array.from({ length: 10 }, (_, index) => `Sugerencia ${index + 1}`)} />
      </section>
    </main>
  )
}
