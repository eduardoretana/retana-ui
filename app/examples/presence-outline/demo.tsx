"use client"

import { useMemo } from "react"

import { Input } from "@/components/ui/input"
import { PresenceOutline } from "@/registry/ui/presence-outline"
import { PresenceProvider, useUpdateMyPresence } from "@/registry/retana/lib/presence"

import { createStudio, type StudioPresence } from "../presence/studio"

export function Demo() {
  const studio = useMemo(() => createStudio(), [])
  return (
    <PresenceProvider adapter={studio.memory}>
      <Fields />
    </PresenceProvider>
  )
}

function Fields() {
  const update = useUpdateMyPresence<StudioPresence>()
  return (
    <div className="grid max-w-lg gap-4 sm:grid-cols-2">
      <PresenceOutline selection="brief">
        <label className="flex flex-col gap-1 text-sm">
          Brief
          <Input aria-label="Brief" onFocus={() => update({ selection: "brief" })} />
        </label>
      </PresenceOutline>
      <PresenceOutline selection="notes">
        <label className="flex flex-col gap-1 text-sm">
          Notas
          <Input aria-label="Notas" onFocus={() => update({ selection: "notes" })} />
        </label>
      </PresenceOutline>
    </div>
  )
}
