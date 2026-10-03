"use client"

import { TextShimmer } from "@/registry/ui/text-shimmer"

export default function TextShimmerPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <TextShimmer>Cociendo el lote</TextShimmer>
    </div>
  )
}
