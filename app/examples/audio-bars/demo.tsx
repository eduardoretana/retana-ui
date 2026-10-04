"use client"

import { AudioBars } from "@/registry/ui/audio-bars"

export function Demo() {
  return (
    <div className="bg-background p-3">
      <AudioBars levels={[0.3, 0.8, 0.55, 0.9, 0.4, 0.7]} label="Studio level" />
    </div>
  )
}
