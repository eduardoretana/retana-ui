"use client"

import { atelier, people } from "@/app/examples/arc/demo-data"
import { CommentThread } from "@/registry/ui/comment-thread"

const [ines, mateo] = people

export default function CommentThreadPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <CommentThread
        className="w-full"
        currentUser={ines}
        people={people.slice(0, 4)}
        title={atelier.kiln}
        defaultComments={[{ id: "note", author: mateo, body: "El estante de arriba ya está lleno.", createdAt: "2h" }]}
      />
    </div>
  )
}
