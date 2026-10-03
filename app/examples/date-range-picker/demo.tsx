"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { DateRangePicker } from "@/registry/ui/date-range-picker"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <DateRangePicker label="Fechas del horno" months={2} />
      <StressCases
        empty={<DateRangePicker label="Sin fechas" placeholder="Elegir" months="auto" />}
        long={<DateRangePicker label={unbreakable} months="auto" />}
        crowded={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }, (_, index) => (
              <DateRangePicker key={index} label={`Rango ${index + 1}`} months="auto" />
            ))}
          </div>
        }
      />
    </div>
  )
}
