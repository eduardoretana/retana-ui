"use client"

import { NumberField } from "@/registry/ui/number-field"

export default function NumberFieldPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <NumberField label="Asientos" defaultValue={4} min={1} max={24} suffix=" asientos" className="w-full" />
    </div>
  )
}
