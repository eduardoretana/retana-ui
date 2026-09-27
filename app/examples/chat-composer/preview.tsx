"use client"

import { ChatComposer } from "@/registry/ui/chat-composer"

export default function ChatComposerPreview() {
  return (
    <div className="flex h-full items-end bg-background p-3">
      <ChatComposer
        defaultValue="Resume el anexo"
        placeholder="Escribe un mensaje"
        sendLabel="Enviar"
        attachLabel="Adjuntar"
        modelSlot={<span className="px-1 text-[11px] text-muted-foreground">Nube mini</span>}
      />
    </div>
  )
}
