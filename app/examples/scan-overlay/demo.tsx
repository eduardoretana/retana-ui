"use client"

import { ScanOverlay } from "@/registry/ui/scan-overlay"

export function Demo() {
  return (
    <div className="bg-background p-3">
      <ScanOverlay status="Reading the plate…" detail="Shelf B, row 3" onCancel={() => {}}>
        <div className="h-36 w-full rounded-lg bg-muted" />
      </ScanOverlay>
    </div>
  )
}
