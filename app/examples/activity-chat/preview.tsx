"use client"

import { ActivityChatDemo } from "./demo"

export default function Preview() {
  return (
    <div className="h-full overflow-hidden bg-background">
      <div className="h-[760px] w-[420px] origin-top-left p-3">
        <ActivityChatDemo />
      </div>
    </div>
  )
}
