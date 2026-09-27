"use client"

import { useState } from "react"

import { ChatComposer } from "@/registry/ui/chat-composer"
import { ChatMessage } from "@/registry/ui/chat-message"
import { MessageList } from "@/registry/ui/message-list"

export function Demo() {
  const [messages, setMessages] = useState<string[]>(["¿Puedes revisar el presupuesto de Orilla?"])
  const [generating, setGenerating] = useState(false)
  const [model, setModel] = useState("Nube")

  return (
    <div className="flex h-[32rem] flex-col overflow-hidden rounded-xl border border-border">
      <MessageList className="min-h-0 flex-1" jumpLabel="Ir al final">
        {messages.map((message, index) => (
          <ChatMessage key={index} role={index % 2 === 0 ? "user" : "assistant"} name={index % 2 === 0 ? "Marina" : model}>
            {message}
          </ChatMessage>
        ))}
      </MessageList>
      <div className="p-3">
        <ChatComposer
          generating={generating}
          placeholder="Escribe un mensaje"
          sendLabel="Enviar"
          stopLabel="Detener"
          attachLabel="Adjuntar"
          removeAttachmentLabel="Quitar"
          modelSlot={
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Modelo
              <select
                value={model}
                onChange={(event) => setModel(event.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1 text-foreground"
              >
                <option>Nube</option>
                <option>Nube mini</option>
              </select>
            </label>
          }
          onSubmit={(value) => {
            setMessages((current) => [...current, value])
            setGenerating(true)
            window.setTimeout(() => {
              setMessages((current) => [...current, `${model} dejó una nota sobre “${value}”.`])
              setGenerating(false)
            }, 900)
          }}
          onStop={() => setGenerating(false)}
        />
      </div>
    </div>
  )
}
