"use client"

import * as React from "react"

import { ShortcutButton } from "@/registry/ui/shortcut-button"

export function Demo() {
  const [count, setCount] = React.useState(0)
  return (
    <div className="flex flex-col items-start gap-3">
      <ShortcutButton shortcut="b" preventDefault={false} onCommand={() => setCount((value) => value + 1)}>
        Guardar
      </ShortcutButton>
      <ShortcutButton shortcut="mod+k" variant="outline" showShortcut onCommand={() => setCount((value) => value + 1)}>
        Buscar
      </ShortcutButton>
      <p className="text-sm text-muted-foreground">Disparos: {count}. Pulsa b, o el atajo de buscar.</p>
    </div>
  )
}
