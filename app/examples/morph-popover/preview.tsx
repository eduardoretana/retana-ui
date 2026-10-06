"use client"

import { MorphPopover } from "@/registry/ui/morph-popover"

export default function Preview() {
  return (
    <div className="grid h-full place-items-center bg-background">
      <MorphPopover label="Menú" title="Opciones">
        <p className="text-sm text-muted-foreground">Crece desde el botón.</p>
      </MorphPopover>
    </div>
  )
}
