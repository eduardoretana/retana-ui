"use client"

import { useState } from "react"

import { ExampleFrame } from "@/app/examples/example-frame"
import { ReplyComposer } from "@/registry/ui/reply-composer"
import { brumaEmojis, brumaSnippets, brumaSuggestions } from "@/app/examples/desk/bruma"

export function ReplyComposerDemo() {
  const [log, setLog] = useState("Nada enviado todavía.")
  return (
    <ExampleFrame title="Respuesta del taller" description="Responder o dejar una nota interna. ⌘ o Ctrl más Enter envía.">
      <ReplyComposer
        replyLabel="Responder"
        noteLabel="Nota"
        sendLabel="Enviar"
        sendHint="⌘↵"
        placeholder="Escribe la respuesta"
        notePlaceholder="Nota visible solo para el taller"
        suggestions={brumaSuggestions}
        snippets={brumaSnippets}
        emojis={brumaEmojis}
        suggestionsLabel="Respuestas sugeridas"
        onSubmit={(value, mode) => setLog(`${mode === "note" ? "Nota" : "Respuesta"}: ${value}`)}
      />
      <p className="text-sm text-muted-foreground" role="status">{log}</p>
    </ExampleFrame>
  )
}
