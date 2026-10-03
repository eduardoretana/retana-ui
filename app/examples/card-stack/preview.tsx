"use client"

import { people } from "@/app/examples/arc/demo-data"
import { CardStack } from "@/registry/ui/card-stack"

export default function CardStackPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <CardStack
        className="w-full"
        items={people.slice(0, 3)}
        getKey={(person) => person.id}
        getLabel={(person) => person.name}
        renderCard={(person) => (
          <div className="flex h-full items-end p-4">
            <p className="m-0 font-medium">{person.name}</p>
          </div>
        )}
        labels={{ left: "Pasar", right: "Quedarse" }}
      />
    </div>
  )
}
