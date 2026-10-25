"use client"

import { useState } from "react"

import { ActivityChat } from "@/registry/ui/activity-chat"
import { activityChatLabelsEn, type ActivityChatEntry } from "@/registry/lib/activity-chat"

import { demoMessages, demoPeople } from "../portfolio-desk/data"

export function ActivityChatDemo({ english = false }: { english?: boolean }) {
  const [messages, setMessages] = useState<ActivityChatEntry[]>(demoMessages)
  const [played, setPlayed] = useState<string | null>(null)

  return (
    <div className="flex h-full min-h-[28rem] flex-col gap-2">
      <p className="text-xs text-muted-foreground">{played ? `Reproduciendo ${played}` : "Ninguna nota en curso."}</p>
      <ActivityChat
        className="min-h-0 flex-1"
        messages={messages}
        people={demoPeople}
        currentUserId="mina"
        labels={english ? activityChatLabelsEn : undefined}
        onPlay={setPlayed}
        onSend={(body) => {
          setMessages((current) => [
            ...current,
            {
              id: `local-${current.length + 1}`,
              kind: "message",
              authorId: "mina",
              createdAt: "2026-10-25T18:05:00.000Z",
              body,
            },
          ])
        }}
      />
    </div>
  )
}
