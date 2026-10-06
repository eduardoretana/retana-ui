"use client"

import { SlideToConfirm } from "@/registry/ui/slide-to-confirm"

export default function Preview() {
  return (
    <div className="grid h-full place-items-center bg-background px-4">
      <SlideToConfirm className="w-full max-w-xs" label="Desliza" />
    </div>
  )
}
