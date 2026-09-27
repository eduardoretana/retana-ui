"use client"

import { StreamingText } from "@/registry/ui/streaming-text"

export default function StreamingTextPreview() {
  return (
    <div className="h-full bg-background p-3">
      <StreamingText
        animate={false}
        streaming
        text={"**Resumen**\n\nEl anexo de Bruma suma 15 días al plazo."}
      />
    </div>
  )
}
