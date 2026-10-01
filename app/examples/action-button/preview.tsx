"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { ActionButton } from "@/registry/ui/action-button"

export default function ActionButtonPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <ActionButton label={atelier.kiln} onAction={() => {}} />
    </div>
  )
}
