"use client"

import { createMemoryPresence } from "@/registry/retana/lib/presence"

export type StudioPresence = {
  cursor: { x: number; y: number } | null
  isTyping: boolean
  selection: string | null
}

export type StudioInfo = {
  name: string
  color: string
}

export function createStudio() {
  const memory = createMemoryPresence<StudioPresence, StudioInfo>({
    self: {
      userId: "elena",
      info: { name: "Elena Voss", color: "var(--chart-1)" },
      presence: { cursor: null, isTyping: false, selection: null },
    },
  })
  const ids = {
    mateo: memory.join({
      userId: "mateo",
      info: { name: "Mateo Ruiz", color: "var(--chart-2)" },
      presence: { cursor: { x: 48, y: 36 }, isTyping: false, selection: null },
    }),
    priya: memory.join({
      userId: "priya",
      info: { name: "Priya Shah", color: "var(--chart-3)" },
      presence: { cursor: { x: 140, y: 72 }, isTyping: true, selection: "brief" },
    }),
    scribe: memory.join({
      userId: "agent-scribe",
      info: { name: "Scribe", color: "var(--chart-4)" },
      presence: { cursor: { x: 200, y: 48 }, isTyping: false, selection: "notes" },
    }),
  }
  return { memory, ids }
}
