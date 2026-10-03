"use client"

import { useState } from "react"
import { Mail, MessageCircle, Phone } from "lucide-react"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { ContactSection, type ContactChannel, type ContactOffice, type ContactSectionVariant } from "@/registry/blocks/contact-section"
import { cn } from "@/lib/utils"

const channels: ContactChannel[] = [
  {
    value: "chat",
    label: "Chat del taller",
    meta: "Unos minutos",
    icon: <MessageCircle aria-hidden />,
    detail: (
      <>
        <h3 className="text-lg font-medium">Chat del taller</h3>
        <p className="text-sm text-muted-foreground">{people[0].name} está en el banco.</p>
      </>
    ),
  },
  {
    value: "email",
    label: "Correo",
    meta: "Un día hábil",
    icon: <Mail aria-hidden />,
    detail: (
      <>
        <h3 className="text-lg font-medium">Correo</h3>
        <p className="text-sm break-all text-muted-foreground">{atelier.email}</p>
      </>
    ),
  },
  {
    value: "call",
    label: "Llamada",
    meta: "Entre semana",
    icon: <Phone aria-hidden />,
    detail: (
      <>
        <h3 className="text-lg font-medium">Llamada</h3>
        <p className="text-sm text-muted-foreground">{atelier.phone}</p>
      </>
    ),
  },
]

const offices: ContactOffice[] = [
  { city: atelier.city, timeZone: "America/Mexico_City", address: ["Calle del Estudio 10", "Oaxaca, México"], email: atelier.email },
  { city: "Ciudad de México", timeZone: "America/Mexico_City", address: ["Avenida Ejemplo 200", "Ciudad de México"], email: "cdmx@costa-atelier.example" },
]

const options: { value: ContactSectionVariant; label: string }[] = [
  { value: "form", label: "Formulario" },
  { value: "channels", label: "Canales" },
  { value: "offices", label: "Talleres" },
]

export function Demo() {
  const [variant, setVariant] = useState<ContactSectionVariant>("form")
  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label="Variante de contacto" className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button key={option.value} type="button" aria-pressed={variant === option.value} className={cn("rounded-lg border px-3 py-1 text-sm", variant === option.value ? "border-border bg-muted text-foreground" : "border-transparent text-muted-foreground")} onClick={() => setVariant(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      <ContactSection
        key={variant}
        variant={variant}
        title={`Escribe a ${atelier.name}`}
        description={`Pedidos, visitas y el ${atelier.kiln}.`}
        topics={["Pedidos", "Visita", "Prensa", "Taller"]}
        channels={channels}
        offices={offices}
      />
      <StressCases
        empty={<ContactSection title="Contacto" description="" topics={[]} offices={[]} channels={[]} />}
        long={<ContactSection title={unbreakable} description={unbreakable} />}
        crowded={<ContactSection topics={Array.from({ length: 10 }, (_, index) => `Tema ${index + 1}`)} />}
      />
    </div>
  )
}
