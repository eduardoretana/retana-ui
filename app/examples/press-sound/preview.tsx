"use client"

import { Button } from "@/components/ui/button"
import { PressSound } from "@/registry/ui/press-sound"

export default function PressSoundPreview() {
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <PressSound sound="tap">
        <Button type="button" size="sm">
          Tocar
        </Button>
      </PressSound>
    </div>
  )
}
