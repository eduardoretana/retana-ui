"use client"

import { TextReveal } from "@/registry/ui/text-reveal"

export default function TextRevealPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <TextReveal as="h2" text="Costa Atelier abre el horno" className="text-lg font-semibold" />
    </div>
  )
}
