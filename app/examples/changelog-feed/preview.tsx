"use client"

import { ChangelogFeed } from "@/registry/blocks/changelog-feed"

export default function ChangelogFeedPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <ChangelogFeed className="h-full max-h-full" />
    </div>
  )
}
