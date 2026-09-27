"use client"

import { useState } from "react"

import { ChatMessage } from "@/registry/ui/chat-message"

export function Demo() {
  const [status, setStatus] = useState<"sending" | "sent" | "error">("error")
  const [draft, setDraft] = useState("El envío se cortó a mitad de frase.")

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4">
      <ChatMessage role="user" name="Marina Soler" time="09:40">
        ¿Qué cambió en el contrato de Bruma?
      </ChatMessage>
      <ChatMessage
        role="assistant"
        name="Nube"
        time="09:41"
        copyText="El plazo de entrega pasa de 30 a 45 días. El resto del alcance no cambia."
        copyLabel="Copiar"
        copiedLabel="Copiado"
        regenerateLabel="Regenerar"
        onRegenerate={() => setDraft("Regeneré el resumen con el anexo firmado.")}
      >
        El plazo de entrega pasa de 30 a 45 días. El resto del alcance no cambia.
      </ChatMessage>
      <ChatMessage
        role="assistant"
        name="Nube"
        time="09:42"
        status={status}
        sendingLabel="Enviando"
        errorLabel="No se pudo enviar"
        retryLabel="Reintentar"
        onRetry={() => {
          setStatus("sending")
          window.setTimeout(() => {
            setStatus("sent")
            setDraft("Listo. El anexo ya está en el expediente.")
          }, 700)
        }}
      >
        {draft}
      </ChatMessage>
    </div>
  )
}
