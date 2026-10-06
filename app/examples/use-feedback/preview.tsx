"use client"

import { Button } from "@/components/ui/button"
import { useFeedback } from "@/registry/hooks/use-feedback"

export default function Preview() {
  const feedback = useFeedback()
  return (
    <div className="grid h-full place-items-center bg-background">
      <Button type="button" size="sm" onClick={() => feedback.trigger("success")}>
        Listo
      </Button>
    </div>
  )
}
