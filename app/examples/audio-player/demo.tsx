"use client"

import { AudioPlayer } from "@/registry/ui/audio-player"

export function Demo() {
  return (
    <div className="bg-background p-3">
      <AudioPlayer peaks={[0.2, 0.5, 0.9, 0.4, 0.7, 0.3, 0.8, 0.6]} />
    </div>
  )
}
