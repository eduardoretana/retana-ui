"use client"

import { SegmentedControl } from "@/registry/ui/segmented-control"

export default function SegmentedControlPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <SegmentedControl
        label="Rango"
        options={[
          { value: "week", label: "Semana" },
          { value: "month", label: "Mes" },
          { value: "year", label: "Año" },
        ]}
        defaultValue="month"
      />
    </div>
  )
}
