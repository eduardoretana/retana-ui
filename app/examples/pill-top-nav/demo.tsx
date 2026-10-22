"use client"

import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { PillTopNav } from "@/registry/blocks/ae/pill-top-nav"

export function Demo() {
  return (
    <div className="ae-ember rounded-[2rem] bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <PillTopNav brand="AE" items={[{ id: "d", label: "Dashboard" }, { id: "c", label: "Clientes" }, { id: "e", label: "Expedientes" }]} active="d" user={{ name: "Ana Ruiz" }} unread={2} />
      </AeStagger>
    </div>
  )
}
