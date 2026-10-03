"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { PhoneInput } from "@/registry/ui/phone-input"

export default function PhoneInputPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <PhoneInput label="Teléfono" defaultCountry="MX" defaultValue={atelier.phone} className="w-full" />
    </div>
  )
}
