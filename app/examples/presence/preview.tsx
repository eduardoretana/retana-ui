"use client"

import { useMemo } from "react"

import { PresenceAvatars } from "@/registry/ui/presence-avatars"
import { TypingIndicator } from "@/registry/ui/typing-indicator"
import { PresenceProvider } from "@/registry/retana/lib/presence"

import { createStudio } from "./studio"

export default function PresencePreview() {
  const studio = useMemo(() => createStudio(), [])
  return (
    <PresenceProvider adapter={studio.memory}>
      <div className="flex h-full flex-col items-start justify-center gap-3 bg-muted/30 p-4">
        <PresenceAvatars groupAgents />
        <TypingIndicator />
      </div>
    </PresenceProvider>
  )
}
