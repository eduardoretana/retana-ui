"use client"

import { useState } from "react"

import { NotificationStack } from "@/registry/ui/notification-stack"

import { sampleNotices } from "./sample"

export function Demo() {
  const [opened, setOpened] = useState("Toca el texto o la palomita. Supr o Retroceso descartan el aviso enfocado.")

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="max-w-md text-center text-sm text-muted-foreground">{opened}</p>
      <NotificationStack
        className="w-full"
        label="Avisos del taller"
        expandLabel="Ver todos"
        collapseLabel="Apilar"
        emptyLabel="No queda nada pendiente"
        defaultItems={sampleNotices}
        onItemClick={(item) => setOpened(`Abriste: ${item.title}.`)}
        onEmpty={() => setOpened("La pila quedó vacía.")}
      />
    </div>
  )
}
