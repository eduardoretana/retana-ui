"use client"

import { ChatMessage } from "@/registry/ui/chat-message"

export default function ChatMessagePreview() {
  return (
    <div className="flex h-full flex-col justify-end gap-2 overflow-hidden bg-background p-3">
      <ChatMessage role="assistant" name="Nube" time="09:41">
        Puedo dejar el resumen en tres puntos.
      </ChatMessage>
      <ChatMessage role="user" name="Marina" time="09:42">
        Adelante.
      </ChatMessage>
    </div>
  )
}
