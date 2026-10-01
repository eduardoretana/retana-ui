"use client"

import { people } from "@/app/examples/arc/demo-data"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel } from "@/registry/ui/carousel"

export default function CarouselPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <Carousel label="Equipo" className="w-full" slideSize="70cqw">
        {people.slice(0, 3).map((person) => (
          <Card key={person.id} className="h-24">
            <CardHeader>
              <CardTitle>{person.name}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </Carousel>
    </div>
  )
}
