"use client"

import { CharLimit } from "@/registry/ui/char-limit"

const text = "Notas de la hornada de gres, estante norte, cono seis, enfriamiento lento."

export default function Preview() {
  return (
    <div className="flex items-center gap-3 bg-background p-3 text-sm">
      <p className="min-w-0 flex-1 text-foreground">{text}</p>
      <CharLimit value={text} max={80} alwaysShow />
    </div>
  )
}
