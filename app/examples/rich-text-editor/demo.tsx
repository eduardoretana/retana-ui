"use client"

import { useState } from "react"

import { unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { RichTextEditor, type RichTextValue } from "@/registry/ui/rich-text-editor"

export function Demo() {
  const [value, setValue] = useState<RichTextValue | null>(null)
  return (
    <div className="flex flex-col gap-8">
      <RichTextEditor
        aria-label="Nota del horno"
        defaultMarkdown={"# Bitácora\n\nCone 6, **gres**, y una línea de `esmalte`."}
        onChange={setValue}
        className="max-w-xl"
      />
      <p className="text-sm break-all text-muted-foreground">{value?.markdown || "Vacío"}</p>
      <StressCases
        empty={<RichTextEditor aria-label="Vacío" placeholder="Sin texto" />}
        long={<RichTextEditor aria-label="Largo" defaultMarkdown={unbreakable} />}
        crowded={
          <RichTextEditor
            aria-label="Diez"
            defaultMarkdown={Array.from({ length: 10 }, (_, index) => `${index + 1}. Pieza ${index + 1}`).join("\n")}
          />
        }
      />
    </div>
  )
}
