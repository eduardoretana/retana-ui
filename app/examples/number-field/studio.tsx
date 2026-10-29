"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { NumberField } from "@/registry/ui/number-field"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <NumberField
        label="Asientos del horno"
        description="Arrastra la etiqueta para frotar el número."
        defaultValue={4}
        min={1}
        max={24}
        scrub
        suffix={(value) => (value === 1 ? " asiento" : " asientos")}
        className="max-w-sm"
      />
      <NumberField label="Precio de la pieza" defaultValue={48} min={0} max={400} step={1} prefix="$" className="max-w-sm" />
      <StressCases
        empty={<NumberField label="Vacío" defaultValue={0} min={0} />}
        long={<NumberField label="Unidad" defaultValue={1} suffix={` ${unbreakable}`} />}
        crowded={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }, (_, index) => (
              <NumberField key={index} label={`Pieza ${index + 1}`} defaultValue={index} min={0} max={99} />
            ))}
          </div>
        }
      />
    </div>
  )
}
