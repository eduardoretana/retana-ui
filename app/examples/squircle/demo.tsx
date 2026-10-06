"use client"

import { Squircle, useCornerShapeSupport } from "@/registry/ui/squircle"

export function Demo() {
  const native = useCornerShapeSupport()
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {native ? "Este navegador usa corner-shape: squircle." : "Este navegador usa el recorte de respaldo."} Chromium 139 y posteriores dibujan la forma nativa. Safari y Firefox usan el trazado de Monoco.
      </p>
      <div className="flex flex-wrap gap-4">
        <Squircle radius={32} shadow className="grid h-28 w-40 place-items-center bg-card text-card-foreground">
          Sombra
        </Squircle>
        <Squircle radius={48} borderWidth={2} className="grid h-28 w-40 place-items-center bg-muted text-foreground">
          Borde
        </Squircle>
        <Squircle radius={20} borderWidth={0} className="grid h-28 w-28 place-items-center bg-primary text-primary-foreground">
          20
        </Squircle>
      </div>
    </div>
  )
}
