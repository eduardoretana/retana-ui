"use client"

import { TimePicker } from "@/registry/ui/time-picker"

export default function TimePickerPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <TimePicker label="Hora" defaultValue="09:00" className="w-full" />
    </div>
  )
}
