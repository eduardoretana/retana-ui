"use client"

import { DissolveInput } from "@/registry/ui/dissolve-input"

export default function DissolveInputPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <DissolveInput defaultValue="Nota de Bruma" aria-label="Nota" clearLabel="Limpiar" />
    </div>
  )
}
