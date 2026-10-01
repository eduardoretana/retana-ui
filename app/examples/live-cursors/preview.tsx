"use client"

import { useMemo } from "react"

import { LiveCursors } from "@/registry/ui/live-cursors"
import { PresenceProvider } from "@/registry/retana/lib/presence"

import { createStudio } from "../presence/studio"

export default function LiveCursorsPreview() {
  const studio = useMemo(() => createStudio(), [])
  return (
    <PresenceProvider adapter={studio.memory}>
      <div className="relative h-full overflow-hidden bg-muted/30">
        <LiveCursors />
      </div>
    </PresenceProvider>
  )
}
