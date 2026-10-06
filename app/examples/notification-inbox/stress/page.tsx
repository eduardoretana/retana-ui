"use client"

import { NotificationInbox } from "@/registry/blocks/notification-inbox"
import { LONG_TOKEN, brumaPriorities, brumaStatuses } from "@/app/examples/desk/bruma"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Avisos</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Vacío en 320px</h2>
        <div className="h-[32rem] w-80 max-w-full">
          <NotificationInbox className="h-full" currentUser={{ id: "m", name: "Mateo" }} today="2026-10-06" statuses={brumaStatuses} priorities={brumaPriorities} defaultNotifications={[]} />
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Diez avisos y un título largo</h2>
        <div className="h-[36rem]">
          <NotificationInbox
            className="h-full"
            currentUser={{ id: "m", name: "Mateo" }}
            today="2026-10-06"
            statuses={brumaStatuses}
            priorities={brumaPriorities}
            defaultNotifications={Array.from({ length: 10 }, (_, index) => ({
              id: `n-${index}`,
              actor: index === 0 ? LONG_TOKEN : `Persona ${index}`,
              summary: "comentó",
              title: index === 1 ? "🙂" : "Pieza",
              body: "Cuerpo",
              time: "hoy",
              issueKey: `BRU-${index}`,
              project: "Niebla",
              status: "open",
              priority: "low",
              unread: index < 3,
              starred: index === 2,
              team: index % 2 === 0,
              snoozed: false,
              archived: false,
              subscribed: true,
              banner: "Aviso",
              labels: ["horno"],
              comments: [],
            }))}
          />
        </div>
      </section>
    </main>
  )
}
