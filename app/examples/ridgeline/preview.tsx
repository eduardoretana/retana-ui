"use client"

import { Ridgeline } from "@/registry/ui/ridgeline"

export default function RidgelinePreview() {
  return (
    <div className="flex h-full w-full items-center bg-background p-3">
      <Ridgeline
        className="w-full"
        label="Horno"
        unit="°C"
        series={[
          { id: "mar", label: "Mar", values: [18, 21, 19, 24] },
          { id: "abr", label: "Abr", values: [22, 25, 23, 27] },
          { id: "may", label: "May", values: [26, 28, 30, 27] },
        ]}
      />
    </div>
  )
}
