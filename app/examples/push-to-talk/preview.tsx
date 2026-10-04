"use client"

import { PushToTalk } from "@/registry/ui/push-to-talk"

export default function Preview() {
  return (
    <div className="flex justify-center bg-background p-3">
      <PushToTalk mode="toggle" />
    </div>
  )
}
