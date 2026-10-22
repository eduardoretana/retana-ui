"use client"

import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { PillTopNav } from "@/registry/blocks/ae/pill-top-nav"

export default function Preview() {
  return (
    <div className="ae-ember flex h-full items-center justify-center overflow-hidden bg-muted/50 p-3">
      <AeStagger className="w-full max-w-sm">
        <PillTopNav brand="AE" items={[{ id: "d", label: "Dashboard" }, { id: "c", label: "Clientes" }, { id: "e", label: "Expedientes" }]} active="d" user={{ name: "Ana Ruiz" }} unread={2} />
      </AeStagger>
    </div>
  )
}
