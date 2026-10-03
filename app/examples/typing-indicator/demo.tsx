"use client"

import { useMemo } from "react"

import { Input } from "@/components/ui/input"
import { TypingIndicator } from "@/registry/ui/typing-indicator"
import { PresenceProvider, useTypingPresence } from "@/registry/retana/lib/presence"

import { createStudio, type StudioPresence } from "../presence/studio"

export function Demo() {
  const studio = useMemo(() => createStudio(), [])
  return (
    <PresenceProvider adapter={studio.memory}>
      <Field />
    </PresenceProvider>
  )
}

function Field() {
  const notify = useTypingPresence<StudioPresence>("isTyping")
  return (
    <div className="flex max-w-sm flex-col gap-2">
      <Input aria-label="Mensaje" placeholder="Escribe" onChange={() => notify()} />
      <TypingIndicator />
    </div>
  )
}
