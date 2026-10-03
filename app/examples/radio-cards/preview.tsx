"use client"

import * as React from "react"

import { RadioCards } from "@/registry/ui/radio-cards"

const options = [
  { value: "studio", label: "Studio", meta: "$24" },
  { value: "workshop", label: "Workshop", meta: "$64" },
]

export default function RadioCardsPreview() {
  const [value, setValue] = React.useState("workshop")
  return (
    <div className="flex h-full items-center bg-background p-3">
      <RadioCards aria-label="Plan" options={options} value={value} onValueChange={setValue} layout="list" className="w-full" />
    </div>
  )
}
