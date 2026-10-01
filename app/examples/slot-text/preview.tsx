"use client"

import { SlotText } from "@/registry/ui/slot-text"

export default function SlotTextPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3 text-lg font-semibold">
      <SlotText value={1280} />
    </div>
  )
}
