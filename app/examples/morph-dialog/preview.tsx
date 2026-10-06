"use client"

import { MorphDialog } from "@/registry/ui/morph-dialog"

export default function Preview() {
  return (
    <div className="grid h-full place-items-center bg-background">
      <MorphDialog label="Abrir" title="Detalle">
        <p className="text-sm">El botón crece hasta este panel.</p>
      </MorphDialog>
    </div>
  )
}
