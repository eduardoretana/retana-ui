"use client"

import { people } from "@/app/examples/arc/demo-data"
import { MentionInput } from "@/registry/ui/mention-input"

export default function MentionInputPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <MentionInput aria-label="Nota" people={people.slice(0, 4)} placeholder="@ alguien" className="w-full" />
    </div>
  )
}
