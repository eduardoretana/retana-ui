"use client"

import { Button } from "@/components/ui/button"
import { UiSoundsControls, playUiSound, sounds } from "@/registry/ui/ui-sounds"

const featured = ["tap", "toggle", "success", "error", "ready", "attention"] as const

export function Demo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {featured.map((name) => (
          <Button key={name} type="button" variant="outline" onClick={() => playUiSound(name)}>
            {name}
          </Button>
        ))}
      </div>
      <UiSoundsControls />
      <p className="text-sm text-muted-foreground">{sounds.length} cues. El silencio, el volumen, el tema y el énfasis quedan guardados.</p>
    </div>
  )
}
