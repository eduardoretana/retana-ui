"use client"

import { useMemo, useRef, type RefObject } from "react"

import { LiveCursors, useContainerCursor } from "@/registry/ui/live-cursors"
import { PresenceProvider } from "@/registry/retana/lib/presence"

import { createStudio } from "../presence/studio"

export function Demo() {
  const studio = useMemo(() => createStudio(), [])
  const ref = useRef<HTMLDivElement>(null)
  return (
    <PresenceProvider adapter={studio.memory}>
      <CursorStage containerRef={ref} />
    </PresenceProvider>
  )
}

function CursorStage({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  useContainerCursor(containerRef)
  return (
    <div ref={containerRef} className="relative h-48 overflow-hidden rounded-xl border border-border bg-card">
      <LiveCursors />
      <p className="p-4 text-sm text-muted-foreground">Mueve el puntero. Los demás ya están en la sala.</p>
    </div>
  )
}
