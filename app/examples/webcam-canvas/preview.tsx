"use client"

import { WebcamCanvas } from "@/registry/ui/webcam-canvas"

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <WebcamCanvas />
    </div>
  )
}
