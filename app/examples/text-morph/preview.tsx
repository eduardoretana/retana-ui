"use client"

import { TextMorph } from "@/registry/ui/text-morph"

export default function TextMorphPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <TextMorph className="text-lg font-medium">Publicando</TextMorph>
    </div>
  )
}
