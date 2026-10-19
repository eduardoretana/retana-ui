"use client"

import { AppShell } from "@/registry/blocks/app-shell"

export function Demo() {
  return (
    <AppShell>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="text-xs text-muted-foreground">Hoy</p>
        <h1 className="text-2xl font-semibold tracking-tight">El espacio está listo</h1>
        <p className="max-w-xl text-sm text-pretty text-muted-foreground">
          Esta tarjeta es el contenido. Las secciones, los proyectos y los primeros pasos viven en la barra.
        </p>
      </div>
    </AppShell>
  )
}
