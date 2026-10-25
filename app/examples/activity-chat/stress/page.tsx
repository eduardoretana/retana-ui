"use client"

import { ActivityChat } from "@/registry/ui/activity-chat"
import type { ActivityChatEntry } from "@/registry/lib/activity-chat"

import { demoPeople, manyMessages } from "../../portfolio-desk/data"

const token = "Y".repeat(60)

function entry(overrides: Partial<ActivityChatEntry> & Pick<ActivityChatEntry, "id">): ActivityChatEntry {
  return {
    kind: "message",
    authorId: "ana",
    createdAt: "2026-10-25T15:00:00.000Z",
    body: "Hola",
    ...overrides,
  }
}

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Conversación</h1>

      <section className="flex h-80 max-w-80 flex-col gap-2">
        <h2 className="text-sm font-medium">Vacío en 320px</h2>
        <ActivityChat messages={[]} people={demoPeople} currentUserId="mina" onSend={() => undefined} />
      </section>

      <section className="flex h-64 flex-col gap-2">
        <h2 className="text-sm font-medium">Cargando</h2>
        <ActivityChat messages={[]} loading onSend={() => undefined} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Error</h2>
        <ActivityChat messages={[]} error="Fallo de demostración." onRetry={() => undefined} onSend={() => undefined} />
      </section>

      <section className="flex h-80 flex-col gap-2">
        <h2 className="text-sm font-medium">Un mensaje, un evento y una nota</h2>
        <ActivityChat
          messages={[
            entry({ id: "uno", body: "Una" }),
            entry({
              id: "evento",
              kind: "event",
              event: { title: "Revisión", startsAt: "2026-10-27T22:00:00.000Z", endsAt: "2026-10-27T23:00:00.000Z", location: "Mesa" },
            }),
            entry({ id: "voz", kind: "voice", authorId: "leo", voice: { durationMs: 1000, peaks: [0.2, 0.8, 0.4], transcript: "Listo" } }),
          ]}
          people={demoPeople}
          currentUserId="mina"
          onSend={() => undefined}
          onPlay={() => undefined}
        />
      </section>

      <section className="flex h-80 flex-col gap-2">
        <h2 className="text-sm font-medium">Token, emoji y números</h2>
        <ActivityChat
          messages={[
            entry({ id: "token", body: token }),
            entry({ id: "emoji", body: "📦 🙂 🙂" }),
            entry({ id: "nums", body: "1.250,00 pliegos" }),
          ]}
          people={demoPeople}
          currentUserId="leo"
          onSend={() => undefined}
        />
      </section>

      <section className="flex h-72 flex-col gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Texto de derecha a izquierda</h2>
        <ActivityChat messages={[entry({ id: "rtl", body: "ملاحظة للأرشيف" })]} people={demoPeople} onSend={() => undefined} />
      </section>

      <section className="flex h-96 flex-col gap-2">
        <h2 className="text-sm font-medium">Muchos mensajes y deshabilitado</h2>
        <ActivityChat messages={manyMessages(30)} people={demoPeople} currentUserId="mina" disabled onSend={() => undefined} />
      </section>
    </main>
  )
}
