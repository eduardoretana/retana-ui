"use client"

import { MessageError } from "@/registry/ui/message-error"

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <MessageError error={new Error("The shelf note could not be saved.")} details="timeout after 12s" onRetry={() => {}} />
    </div>
  )
}
