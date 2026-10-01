"use client"

import { atelier, people } from "@/app/examples/arc/demo-data"
import { JsonViewer } from "@/registry/ui/json-viewer"

export default function JsonViewerPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <JsonViewer
        className="w-full"
        label="Horno"
        maxHeight={120}
        data={{ kiln: atelier.kiln, city: atelier.city, lead: people[0]?.name }}
      />
    </div>
  )
}
