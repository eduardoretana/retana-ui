"use client"

import * as React from "react"
import { SlashMenu, useSlashTrigger } from "@/registry/ui/slash-menu"

const commands = [
  { id: "sum", name: "summarize", description: "Shorten the note", category: "Write" },
  { id: "shelf", name: "shelf", description: "Insert a shelf label", category: "Studio" },
]

export function Demo() {
  const ref = React.useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = React.useState("/")
  const slash = useSlashTrigger(ref)
  return (
    <div className="flex flex-col gap-2 bg-background p-3">
      <textarea id="slash-demo" ref={ref} value={value} onChange={(event) => setValue(event.target.value)} aria-label="Composer" className="min-h-16 w-full rounded-lg border border-border bg-background p-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" />
      <SlashMenu inputId="slash-demo" commands={commands} open={slash.open || value.startsWith("/")} query={slash.query || value.slice(1)} onSelect={(command) => { slash.replaceTrigger("/" + command.name + " "); setValue("/" + command.name + " ") }} onDismiss={() => { slash.close(); setValue("") }} />
    </div>
  )
}
