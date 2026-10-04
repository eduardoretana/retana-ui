"use client"

import { ArtifactPanel } from "@/registry/ui/artifact-panel"

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <ArtifactPanel defaultOpen title="Shelf note" description="Draft for the north wall" content={"Cone 6\nSlow cool\nNo pinholes"} fileName="shelf-note.txt" />
    </div>
  )
}
