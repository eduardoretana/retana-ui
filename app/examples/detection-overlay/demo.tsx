"use client"

import { DetectionLegend, DetectionOverlay } from "@/registry/ui/detection-overlay"

const detections = [
  { label: "bowl", score: 0.92, box: { x: 40, y: 30, width: 180, height: 120 } },
  { label: "cup", score: 0.61, box: { x: 260, y: 80, width: 90, height: 110 } },
]

export function Demo() {
  return (
    <div className="flex flex-col gap-2 bg-background p-3">
      <DetectionOverlay detections={detections} naturalWidth={400} naturalHeight={240}>
        <div className="h-40 w-full rounded-lg bg-muted" />
      </DetectionOverlay>
      <DetectionLegend detections={detections} />
    </div>
  )
}
