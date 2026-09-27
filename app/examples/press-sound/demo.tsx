"use client"

import { Button } from "@/components/ui/button"
import { PressSound, PressSoundToggle, usePressSound } from "@/registry/ui/press-sound"

export function Demo() {
  const sound = usePressSound()
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap gap-2">
        <PressSound sound="tap">
          <Button type="button">Toque</Button>
        </PressSound>
        <PressSound sound="tick">
          <Button type="button" variant="outline">
            Tic
          </Button>
        </PressSound>
        <PressSound sound="pop">
          <Button type="button" variant="secondary">
            Pop
          </Button>
        </PressSound>
      </div>
      <PressSoundToggle
        mutedLabel="Activar sonidos"
        unmutedLabel="Silenciar sonidos"
        className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      />
      <Button type="button" variant="ghost" size="sm" onClick={() => sound.play("tick")}>
        Probar el hook
      </Button>
    </div>
  )
}
