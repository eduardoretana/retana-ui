"use client"

import { MessageList } from "@/registry/ui/message-list"
import { ChatMessage } from "@/registry/ui/chat-message"

export default function MessageListPreview() {
  return (
    <div className="h-full bg-background">
      <MessageList className="h-full" jumpLabel="Ir al final">
        <ChatMessage role="assistant" name="Nube" time="10:01">
          Empiezo por el alcance.
        </ChatMessage>
        <ChatMessage role="user" name="Diego" time="10:02">
          Sigue.
        </ChatMessage>
        <ChatMessage role="assistant" name="Nube" time="10:03">
          El cierre queda para el viernes.
        </ChatMessage>
      </MessageList>
    </div>
  )
}
