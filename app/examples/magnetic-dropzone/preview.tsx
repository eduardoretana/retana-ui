"use client"

import { MagneticDropzone } from "@/registry/ui/magnetic-dropzone"

export default function MagneticDropzonePreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <MagneticDropzone label="Suelta archivos" hint="o elige desde el equipo" removeLabel="Quitar" />
    </div>
  )
}
