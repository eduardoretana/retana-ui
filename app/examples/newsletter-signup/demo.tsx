"use client"

import { useId, useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { NewsletterSignup, type NewsletterPublication } from "@/registry/blocks/newsletter-signup"

const publication: NewsletterPublication = {
  name: atelier.name,
  upcoming: {
    number: 42,
    date: "Viernes 2 de octubre",
    subject: `Lo que salió de ${atelier.kiln}`,
    stories: [
      { title: "El cuenco que no se torció", minutes: 4 },
      { title: "Ceniza del taller", minutes: 3 },
      { title: "Cómo empacar un jarro", minutes: 5 },
    ],
  },
  recent: [
    {
      number: 41,
      date: "Viernes 25 de septiembre",
      subject: "La vitrina del viernes",
      stories: [
        { title: "Luz de la tarde", minutes: 3 },
        { title: "Doce piezas", minutes: 4 },
        { title: "El nombre en la base", minutes: 2 },
      ],
    },
    {
      number: 40,
      date: "Viernes 18 de septiembre",
      subject: "Antes de encender",
      stories: [
        { title: "La curva del horno", minutes: 5 },
        { title: "Un banco libre", minutes: 3 },
        { title: "Barro de la semana", minutes: 4 },
      ],
    },
  ],
}

export function Demo() {
  const [fail, setFail] = useState(false)
  const switchId = useId()
  const subscribe = () => new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("fail")) : resolve()), 700))
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Switch id={switchId} checked={fail} onCheckedChange={setFail} />
        <Label htmlFor={switchId}>Fallar el próximo envío</Label>
      </div>
      <NewsletterSignup
        title={`El boletín de ${atelier.name}`}
        description={`Una nota corta cada viernes desde ${atelier.city}. ${atelier.kiln}.`}
        placeholder={atelier.email}
        buttonLabel="Suscribirme"
        privacyNote="Sin rastreo. Te das de baja con un clic."
        privacyLink={{ label: "Privacidad", href: "#privacidad" }}
        readers={{ count: 480, faces: people.slice(0, 3).map((person) => person.name) }}
        publication={publication}
        onSubscribe={subscribe}
      />
      <StressCases
        empty={<NewsletterSignup title="Boletín" description="" publication={null} readers={null} privacyNote="" privacyLink={null} />}
        long={<NewsletterSignup title={unbreakable} description={unbreakable} placeholder={unbreakable} publication={null} readers={null} />}
        crowded={
          <NewsletterSignup
            publication={null}
            readers={{ count: 10, faces: people.map((person) => person.name) }}
            title="Diez lectores"
            description={atelier.city}
          />
        }
      />
    </div>
  )
}
