"use client"

import { Squircle } from "@/registry/ui/squircle"

export default function Preview() {
  return (
    <div className="grid h-full place-items-center bg-background">
      <Squircle radius={28} shadow className="grid h-24 w-36 place-items-center bg-card text-sm text-card-foreground">
        Squircle
      </Squircle>
    </div>
  )
}
