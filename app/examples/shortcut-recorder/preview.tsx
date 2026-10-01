"use client"

import { ShortcutRecorder } from "@/registry/ui/shortcut-recorder"

export default function ShortcutRecorderPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <ShortcutRecorder label="Guardar" defaultValue="mod+s" platform="mac" className="w-full" />
    </div>
  )
}
