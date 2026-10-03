"use client"

import { ImageCompare } from "@/registry/ui/image-compare"

export default function ImageComparePreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <ImageCompare
        className="w-full"
        aspectRatio="16 / 9"
        label="Bizcocho y esmalte"
        labels={["Bizcocho", "Esmalte"]}
        before={<div className="grid size-full place-items-center bg-muted text-sm">Bizcocho</div>}
        after={<div className="grid size-full place-items-center bg-primary text-sm text-primary-foreground">Esmalte</div>}
      />
    </div>
  )
}
