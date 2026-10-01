"use client"

import { useMemo } from "react"

import { PresenceAvatars } from "@/registry/ui/presence-avatars"
import { PresenceProvider } from "@/registry/retana/lib/presence"

import { createStudio } from "../presence/studio"

export function Demo() {
  const studio = useMemo(() => createStudio(), [])
  return (
    <PresenceProvider adapter={studio.memory}>
      <PresenceAvatars groupAgents max={3} />
    </PresenceProvider>
  )
}
