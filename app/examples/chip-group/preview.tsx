"use client"

import * as React from "react"

import { ChipGroup } from "@/registry/ui/chip-group"

const options = [
  { value: "clay", label: "Clay" },
  { value: "glaze", label: "Glaze" },
  { value: "kiln", label: "Kiln" },
]

export default function ChipGroupPreview() {
  const [value, setValue] = React.useState(["clay"])
  return (
    <div className="flex h-full items-center bg-background p-3">
      <ChipGroup label="Facetas" options={options} value={value} onValueChange={setValue} className="w-full" />
    </div>
  )
}
