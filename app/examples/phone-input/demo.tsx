"use client"

import { useState } from "react"

import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { PhoneInput } from "@/registry/ui/phone-input"

export function Demo() {
  const [value, setValue] = useState(atelier.phone)
  return (
    <div className="flex flex-col gap-8">
      <PhoneInput
        label="Teléfono del taller"
        description="Se guarda con el código del país."
        defaultCountry="MX"
        value={value}
        onValueChange={setValue}
        className="max-w-sm"
      />
      <p className="text-sm text-muted-foreground">{value || "Sin número"}</p>
      <StressCases
        empty={<PhoneInput label="Vacío" defaultCountry="MX" />}
        long={<PhoneInput label="Largo" description={unbreakable} defaultCountry="MX" defaultValue={atelier.phone} />}
        crowded={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }, (_, index) => (
              <PhoneInput key={index} label={`Línea ${index + 1}`} hideLabel defaultCountry={index % 2 ? "US" : "MX"} />
            ))}
          </div>
        }
      />
    </div>
  )
}
