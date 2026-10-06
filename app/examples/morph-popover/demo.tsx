"use client"

import { MorphPopover } from "@/registry/ui/morph-popover"

export function Demo() {
  return (
    <MorphPopover label="Acciones" title="Sobre este registro">
      <button type="button" className="rounded-md px-2 py-1 text-left text-sm hover:bg-muted">
        Duplicar
      </button>
      <button type="button" className="rounded-md px-2 py-1 text-left text-sm hover:bg-muted">
        Archivar
      </button>
    </MorphPopover>
  )
}
