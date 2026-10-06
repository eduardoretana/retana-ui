"use client"

import { MorphDialog } from "@/registry/ui/morph-dialog"

export function Demo() {
  return (
    <MorphDialog label="Editar nota" title="Nota" description="El foco está en el campo. Escape cierra y vuelve al botón.">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Título</span>
        <input className="rounded-md border border-border bg-background px-2 py-1" defaultValue="Revisión del martes" />
      </label>
    </MorphDialog>
  )
}
