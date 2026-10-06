"use client"

import { InboxList } from "@/registry/ui/inbox-list"

export default function Preview() {
  return (
    <div className="h-full bg-background">
      <InboxList
        className="h-full"
        label="Bandeja"
        title="Tu bandeja"
        countLabel="2 abiertas"
        searchLabel="Buscar"
        selectedId="a"
        items={[
          { id: "a", title: "Inés Soler", subtitle: "Muestra Niebla", preview: "¿Alcanza con una placa?", time: "16:40", unread: 2, presence: "online" },
          { id: "b", title: "Nuria Paz", subtitle: "Muro de loseta", preview: "El jueves a las once.", time: "ayer", presence: "away" },
        ]}
      />
    </div>
  )
}
