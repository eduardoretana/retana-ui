"use client"

import { DateRangePicker } from "@/registry/ui/date-range-picker"

export default function DateRangePickerPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <DateRangePicker label="Fechas" className="max-w-full" />
    </div>
  )
}
