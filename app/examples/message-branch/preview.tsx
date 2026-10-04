"use client"

import { MessageBranch } from "@/registry/ui/message-branch"

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <MessageBranch count={3} defaultIndex={1}>
        <p className="text-sm">Primera hornada, cono 6.</p>
        <p className="text-sm">Segunda nota: dejar el esmalte más fino.</p>
        <p className="text-sm">Tercera nota: la base quedó pareja.</p>
      </MessageBranch>
    </div>
  )
}
