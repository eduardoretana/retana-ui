"use client"

import { useState } from "react"

import { channels, people, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { MentionInput, serializeMentions, type MentionValue } from "@/registry/ui/mention-input"

const channelItems = channels.map((name, index) => ({ id: name, name, description: "Del taller", members: index + 2 }))

export function Demo() {
  const [value, setValue] = useState<MentionValue>({ text: "Aviso para ", mentions: [] })
  return (
    <div className="flex flex-col gap-8">
      <MentionInput
        aria-label="Nota del horno"
        placeholder="Escribe @ o #"
        people={people}
        channels={channelItems}
        value={value}
        onChange={setValue}
        className="max-w-md"
      />
      <p className="text-sm break-all text-muted-foreground">{serializeMentions(value) || "Vacío"}</p>
      <StressCases
        empty={<MentionInput aria-label="Vacío" people={people} channels={channelItems} placeholder="Sin texto" />}
        long={<MentionInput aria-label="Largo" people={people} defaultValue={{ text: unbreakable, mentions: [] }} />}
        crowded={<MentionInput aria-label="Diez" people={people} channels={channelItems} placeholder="@ o #" />}
      />
    </div>
  )
}
