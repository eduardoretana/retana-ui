"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { people, unbreakable } from "@/app/examples/arc/demo-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel } from "@/registry/ui/carousel"

function Slide({ title, detail }: { title: string; detail: string }) {
  return (
    <Card className="h-40">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">{detail}</CardContent>
    </Card>
  )
}

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <Carousel label="Equipo del taller" interval={5000}>
        {people.slice(0, 5).map((person) => (
          <Slide key={person.id} title={person.name} detail={person.role} />
        ))}
      </Carousel>
      <StressCases
        empty={<Carousel label="Vacío"><Slide title="Sin piezas" detail="" /></Carousel>}
        long={<Carousel label="Largo"><Slide title={unbreakable} detail={unbreakable} /></Carousel>}
        crowded={
          <Carousel label="Diez">
            {people.map((person) => (
              <Slide key={person.id} title={person.name} detail={person.role} />
            ))}
          </Carousel>
        }
      />
    </div>
  )
}
