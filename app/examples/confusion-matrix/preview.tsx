"use client"

import { ConfusionMatrix } from "@/registry/ui/confusion-matrix"

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <ConfusionMatrix labels={["bowl", "cup", "plate"]} counts={[[12, 1, 0], [2, 9, 1], [0, 1, 8]]} />
    </div>
  )
}
