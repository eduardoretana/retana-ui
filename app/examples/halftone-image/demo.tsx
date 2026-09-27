"use client"

import { HalftoneImage } from "@/registry/ui/halftone-image"

const src = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" fill="white"/><circle cx="120" cy="92" r="46" fill="#111"/><path d="M30 210 C70 140 170 140 210 210 Z" fill="#333"/><rect x="96" y="78" width="14" height="8" fill="white"/><rect x="132" y="78" width="14" height="8" fill="white"/></svg>`,
)}`

export function Demo() {
  return (
    <div className="mx-auto max-w-sm">
      <HalftoneImage src={src} alt="Retrato esquemático de un estudio" columns={48} />
      <p className="mt-3 text-sm text-muted-foreground">Mueve el cursor: los puntos cercanos crecen.</p>
    </div>
  )
}
