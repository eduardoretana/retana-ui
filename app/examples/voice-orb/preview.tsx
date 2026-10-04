"use client"

import { VoiceOrb } from "@/registry/ui/voice-orb"

export default function Preview() {
  return (
    <div className="flex justify-center bg-background p-3">
      <VoiceOrb state="listening" getInputVolume={() => 0.35} />
    </div>
  )
}
