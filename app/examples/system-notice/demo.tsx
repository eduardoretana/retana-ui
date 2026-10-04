"use client"

import { SystemNotice } from "@/registry/ui/system-notice"

export function Demo() {
  return (
    <div className="flex flex-col gap-2 bg-background p-3">
      <SystemNotice kind="offline" />
      <SystemNotice kind="switched" />
    </div>
  )
}
