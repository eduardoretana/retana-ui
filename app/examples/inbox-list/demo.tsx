"use client"

import { useState } from "react"

import { ExampleFrame } from "@/app/examples/example-frame"
import { InboxList } from "@/registry/ui/inbox-list"
import { brumaConversations } from "@/app/examples/desk/bruma"

export function InboxListDemo() {
  const [selected, setSelected] = useState<string | null>("c-ines")
  const rows = brumaConversations.filter((item) => !item.spam && !item.snoozed)
  return (
    <ExampleFrame title="Lista de bandeja" description="Filas para conversaciones, piezas o avisos. La búsqueda ignora los acentos.">
      <div className="h-[28rem] overflow-hidden rounded-xl border border-border">
        <InboxList
          className="h-full"
          label="Conversaciones"
          title="Tu bandeja"
          countLabel={`${rows.length} abiertas`}
          searchLabel="Buscar"
          selectedId={selected}
          onSelect={setSelected}
          items={rows.map((item) => ({
            id: item.id,
            title: item.name,
            subtitle: item.subject,
            preview: item.preview,
            time: item.time,
            unread: item.unread,
            presence: item.presence,
          }))}
        />
      </div>
    </ExampleFrame>
  )
}
