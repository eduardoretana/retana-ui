"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { HoldToConfirm } from "@/registry/ui/hold-to-confirm"

export default function HoldToConfirmPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <HoldToConfirm label={atelier.kiln} onConfirm={() => {}} />
    </div>
  )
}
