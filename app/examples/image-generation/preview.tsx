"use client"

import { ImageGeneration } from "@/registry/ui/image-generation"

export default function ImageGenerationPreview() {
  return (
    <div className="h-full bg-background p-3">
      <ImageGeneration status="generating" progress={62} generatingLabel="Generando" prompt="Estudio Bruma al atardecer" frameClassName="aspect-video" />
    </div>
  )
}
