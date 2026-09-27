"use client"

import { HalftoneImage } from "@/registry/ui/halftone-image"

const src = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="white"/><circle cx="60" cy="54" r="28" fill="black"/><rect y="88" width="120" height="32" fill="#444"/></svg>`,
)}`

export default function HalftoneImagePreview() {
  return (
    <div className="h-full bg-background p-3">
      <HalftoneImage src={src} alt="Retrato esquemático" columns={28} className="h-full" />
    </div>
  )
}
