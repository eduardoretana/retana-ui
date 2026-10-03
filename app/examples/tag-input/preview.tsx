"use client"

import { TagInput } from "@/registry/ui/tag-input"

export default function TagInputPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <TagInput label="Facetas" defaultValue={["clay", "glaze"]} className="w-full" />
    </div>
  )
}
