"use client"

import { SupportInbox } from "@/registry/blocks/support-inbox"
import { LONG_TOKEN, brumaFolders } from "@/app/examples/desk/bruma"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Bandeja</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Vacío en 320px</h2>
        <div className="h-[32rem] w-80 max-w-full">
          <SupportInbox className="h-full" folders={brumaFolders} defaultConversations={[]} agentName="Mateo Rulfo" />
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Asunto largo y diez hilos</h2>
        <div className="h-[36rem]">
          <SupportInbox
            className="h-full"
            folders={brumaFolders}
            agentName="Mateo Rulfo"
            defaultConversations={Array.from({ length: 10 }, (_, index) => ({
              id: `s-${index}`,
              name: index === 0 ? LONG_TOKEN : `Persona ${index}`,
              subject: index === 1 ? "🙂" : "Asunto",
              preview: "Vista",
              time: "ahora",
              assignee: "Mateo Rulfo",
              messages: [{ id: "m", author: "Persona", body: LONG_TOKEN, time: "ahora", side: "incoming" as const }],
            }))}
          />
        </div>
      </section>
    </main>
  )
}
