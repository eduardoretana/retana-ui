"use client"

import { MotionPreferenceControl } from "@/registry/ui/motion-preference"

export default function Preview() {
  return (
    <div className="grid h-full place-items-center bg-background">
      <MotionPreferenceControl />
    </div>
  )
}
