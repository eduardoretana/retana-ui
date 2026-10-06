"use client"

import { Button } from "@/components/ui/button"
import { useHaptics } from "@/registry/ui/haptics"

export default function Preview() {
  const haptics = useHaptics()
  return (
    <div className="grid h-full place-items-center bg-background">
      <Button type="button" size="sm" onClick={() => haptics.trigger("success")}>
        Vibrar
      </Button>
    </div>
  )
}
