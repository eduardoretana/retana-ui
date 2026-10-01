"use client"

import { RichTextEditor } from "@/registry/ui/rich-text-editor"

export default function RichTextEditorPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <RichTextEditor aria-label="Nota" defaultMarkdown="**Gres** a cone 6." className="w-full" />
    </div>
  )
}
