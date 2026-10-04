"use client"

import { StorageMeter } from "@/registry/ui/storage-meter"

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <StorageMeter />
    </div>
  )
}
