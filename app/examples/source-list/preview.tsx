"use client"

import { SourceList } from "@/registry/ui/source-list"

const sources = [
  { id: "1", title: "Firing log, shelf B", domain: "notes.example", excerpt: "Cone 6, slow cool, no pinholes on the rims.", score: 0.86, type: "web" as const, url: "https://example.com/log" },
  { id: "2", title: "Glaze tile photo", domain: "studio.example", excerpt: "The celadon pool is even.", score: 0.62, type: "image" as const, url: "https://example.com/tile" },
]

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <SourceList sources={sources} defaultOpen highlightId="1" />
    </div>
  )
}
