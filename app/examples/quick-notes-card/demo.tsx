"use client"

import { aeNotes } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { QuickNotesCard } from "@/registry/blocks/ae/quick-notes-card"

export function Demo() {
  return (
    <div className="ae-ember rounded-[2rem] bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <QuickNotesCard notes={aeNotes} />
      </AeStagger>
    </div>
  )
}
