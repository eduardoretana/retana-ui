"use client"

import { Stepper } from "@/registry/ui/stepper"

export default function StepperPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <Stepper
        className="w-full"
        label="Quema"
        current={1}
        steps={[
          { id: "prep", label: "Preparar" },
          { id: "fire", label: "Cocer" },
          { id: "cool", label: "Enfriar" },
        ]}
      />
    </div>
  )
}
