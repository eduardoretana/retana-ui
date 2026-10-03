"use client"

import { CopyButton } from "@/registry/ui/copy-button"

export default function CopyButtonPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <CopyButton value="hola@costa-atelier.example" label="Copiar" />
    </div>
  )
}
