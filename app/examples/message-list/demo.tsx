"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ChatMessage } from "@/registry/ui/chat-message"
import { MessageList } from "@/registry/ui/message-list"

const seed = [
  { role: "assistant" as const, name: "Nube", text: "Revisé el hilo de Clínica Norte." },
  { role: "user" as const, name: "Diego Alarcón", text: "¿Hay algún pendiente de firma?" },
  { role: "assistant" as const, name: "Nube", text: "Falta el anexo de privacidad. Lo dejo al final." },
]

export function Demo() {
  const [messages, setMessages] = useState(seed)

  return (
    <div className="flex h-[28rem] flex-col overflow-hidden rounded-xl border border-border">
      <MessageList className="min-h-0 flex-1" jumpLabel="Ir al final">
        {messages.map((message, index) => (
          <ChatMessage key={index} role={message.role} name={message.name} time={`10:${String(index).padStart(2, "0")}`}>
            {message.text}
          </ChatMessage>
        ))}
      </MessageList>
      <div className="border-t border-border p-3">
        <Button
          type="button"
          size="sm"
          onClick={() =>
            setMessages((current) => [
              ...current,
              {
                role: "assistant",
                name: "Nube",
                text: `Nota ${current.length + 1}: el expediente sigue en revisión.`,
              },
            ])
          }
        >
          Llegó un mensaje
        </Button>
      </div>
    </div>
  )
}
