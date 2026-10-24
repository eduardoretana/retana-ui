"use client"

import { useState } from "react"

import { PillTopNav } from "@/registry/blocks/ae/pill-top-nav"

const items = [
  { id: "d", label: "Dashboard" },
  { id: "c", label: "Clientes" },
  { id: "e", label: "Expedientes" },
]

export function Demo() {
  const [active, setActive] = useState("d")
  return (
    <div className="ae-ember rounded-3xl bg-muted/50 p-6">
      <PillTopNav brand="AE" items={items} active={active} onNavigate={setActive} user={{ name: "Ana Ruiz" }} unread={2} />
      <p role="status" className="mt-4 text-sm text-muted-foreground">
        Sección: {items.find((item) => item.id === active)?.label}
      </p>
    </div>
  )
}
