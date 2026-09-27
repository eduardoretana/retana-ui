"use client"

import { LightboxGallery } from "@/registry/ui/lightbox"

const items = [0, 1, 2].map((index) => ({
  src: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="${["#d9d3c8", "#c5beb3", "#b0a89c"][index]}"/></svg>`,
  )}`,
  alt: `Boceto ${index + 1}`,
}))

export default function LightboxPreview() {
  return (
    <div className="h-full bg-background p-3">
      <LightboxGallery items={items} />
    </div>
  )
}
