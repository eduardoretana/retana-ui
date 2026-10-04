"use client"

import { SyncedTranscript } from "@/registry/ui/synced-transcript"

const words = [
  { text: "The", start: 0, end: 0.3 },
  { text: "kiln", start: 0.3, end: 0.7 },
  { text: "held", start: 0.7, end: 1.1 },
  { text: "cone", start: 1.1, end: 1.5 },
  { text: "six.", start: 1.5, end: 2 },
]

export function Demo() {
  return (
    <div className="bg-background p-3">
      <SyncedTranscript words={words} currentTime={0.8} />
    </div>
  )
}
