"use client"

import { Button } from "@/components/ui/button"
import { playUiSound } from "@/registry/ui/ui-sounds"

export default function Preview() {
  return (
    <div className="flex h-full items-center justify-center gap-2 bg-background">
      <Button type="button" size="sm" onClick={() => playUiSound("success")}>
        Listo
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => playUiSound("error")}>
        Error
      </Button>
    </div>
  )
}
