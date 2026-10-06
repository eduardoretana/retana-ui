"use client"

import { Button } from "@/components/ui/button"
import { HapticsToggle, useHaptics } from "@/registry/ui/haptics"

export function Demo() {
  const haptics = useHaptics()
  return (
    <div className="flex flex-col items-start gap-3">
      <HapticsToggle />
      <div className="flex flex-wrap gap-2">
        {(["tap", "success", "error", "attention"] as const).map((preset) => (
          <Button key={preset} type="button" variant="outline" onClick={() => haptics.trigger(preset)}>
            {preset}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {haptics.supported ? "Este navegador expone navigator.vibrate." : "Este navegador no vibra. El disparo no hace nada."}
      </p>
    </div>
  )
}
