"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { InlineEdit } from "@/registry/ui/inline-edit"

export default function InlineEditPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <InlineEdit label="Nombre del taller" value={atelier.name} onSave={() => {}} className="w-full" />
    </div>
  )
}
