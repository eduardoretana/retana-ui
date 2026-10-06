"use client"

import { ShortcutButton } from "@/registry/ui/shortcut-button"

export default function Preview() {
  return (
    <div className="grid h-full place-items-center bg-background">
      <ShortcutButton shortcut="mod+s">Guardar</ShortcutButton>
    </div>
  )
}
