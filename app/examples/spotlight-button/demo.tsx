"use client"

import { SpotlightButton } from "@/registry/ui/spotlight-button"

export function Demo() {
  return (
    <div className="flex flex-wrap gap-3">
      <SpotlightButton>Continuar</SpotlightButton>
      <SpotlightButton variant="outline">Detalle</SpotlightButton>
      <SpotlightButton variant="secondary">Secundario</SpotlightButton>
    </div>
  )
}
