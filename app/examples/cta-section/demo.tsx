"use client"

import { useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { Button } from "@/components/ui/button"
import { CtaSection } from "@/registry/blocks/cta-section"

const faces = people.slice(0, 4).map((person) => person.name)

export function Demo() {
  const [open, setOpen] = useState(true)
  return (
    <div className="flex flex-col gap-8">
      <CtaSection
        title={`Empieza en ${atelier.name}`}
        description={`Un banco en ${atelier.city}. ${atelier.kiln} ya está encendido.`}
        note="Sin tarjeta"
        faces={faces}
        primaryAction={{ label: "Reservar", confirmedLabel: "Reserva lista" }}
        secondaryAction={{ label: "Escribir", href: `mailto:${atelier.email}` }}
      />
      <CtaSection
        variant="split"
        title="El taller, listo antes del mediodía"
        description={`Invita al equipo y trae los pedidos. Escribe a ${atelier.email}.`}
        points={["Un horno compartido", "Embalaje incluido", "Te vas cuando quieras"]}
        primaryAction={{ label: "Crear el banco", confirmedLabel: "Banco listo" }}
        secondaryAction={{ label: "Ver la galería", confirmedLabel: "Galería abierta" }}
      />
      {open ? (
        <CtaSection
          variant="banner"
          title="El viernes hay horno"
          description={`Quedan bancos en ${atelier.kiln}.`}
          primaryAction={{ label: "Ver cómo", confirmedLabel: "Listo" }}
          onDismiss={() => setOpen(false)}
        />
      ) : (
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          Mostrar el aviso
        </Button>
      )}
      <StressCases
        empty={<CtaSection title="" description="" note="" faces={[]} points={[]} primaryAction={{ label: "Reservar" }} secondaryAction={null} />}
        long={<CtaSection title={unbreakable} description={unbreakable} note={unbreakable} faces={[unbreakable]} primaryAction={{ label: unbreakable }} secondaryAction={null} />}
        crowded={<CtaSection faces={people.map((person) => person.name)} points={people.map((person) => person.role)} />}
      />
    </div>
  )
}
