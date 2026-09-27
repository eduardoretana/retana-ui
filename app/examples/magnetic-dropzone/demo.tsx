"use client"

import { MagneticDropzone } from "@/registry/ui/magnetic-dropzone"

export function Demo() {
  return (
    <MagneticDropzone
      accept="image/*,.pdf"
      maxSize={2 * 1024 * 1024}
      simulateProgress
      label="Suelta contratos o imágenes"
      hint="PDF o imagen, hasta 2 MB. La zona se inclina hacia el cursor."
      removeLabel="Quitar"
      tooLargeLabel="El archivo pesa demasiado"
      typeLabel="Ese tipo no está permitido"
    />
  )
}
