"use client"

import { NotificationStack } from "@/registry/ui/notification-stack"

import { sampleNotices } from "./sample"

export default function NotificationStackPreview() {
  return (
    <div className="flex h-full items-end justify-center overflow-hidden bg-background px-6 pt-8 pb-3">
      <NotificationStack defaultItems={sampleNotices} expandable={false} className="max-w-sm" />
    </div>
  )
}
