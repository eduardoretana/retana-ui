"use client"

import { ReplyComposer } from "@/registry/ui/reply-composer"

export default function Preview() {
  return (
    <div className="flex h-full items-end bg-background p-3">
      <ReplyComposer
        className="w-full"
        replyLabel="Responder"
        noteLabel="Nota"
        sendLabel="Enviar"
        suggestions={["Te aparto la placa."]}
        placeholder="Escribe la respuesta"
      />
    </div>
  )
}
