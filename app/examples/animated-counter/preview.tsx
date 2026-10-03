"use client"

import { plans } from "@/app/examples/arc/demo-data"
import { AnimatedCounter } from "@/registry/ui/animated-counter"

export default function AnimatedCounterPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <AnimatedCounter value={plans[1].price} prefix="$" label="Workshop" />
    </div>
  )
}
