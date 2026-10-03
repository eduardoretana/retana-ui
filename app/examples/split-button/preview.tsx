"use client"

import { SplitButton } from "@/registry/ui/split-button"

export default function SplitButtonPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <SplitButton label="Publicar" actions={[{ label: "Programar" }, { label: "Retirar", destructive: true }]} />
    </div>
  )
}
