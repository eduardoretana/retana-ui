"use client"

import Link from "next/link"
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Sparkles,
  User,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  DetailField,
  DetailSection,
  LayeredPanel,
} from "@/registry/ui/layered-panel"
import { useLayeredPanelUrlState } from "@/registry/hooks/use-layered-panel-url-state"
import { ThemeToggle } from "@/components/demo/theme-toggle"
import { useZonedTime } from "@/components/demo/use-zoned-time"

type Lead = {
  id: string
  name: string
  company: string
  stage: string
  value: string
  email: string
  phone: string
  city: string
  country: string
  flag: string
  timezone: string
  insight: string
  nextStep: string
  activities: { id: string; title: string; when: string }[]
}

const leads: Lead[] = [
  {
    id: "mariana",
    name: "Mariana López",
    company: "Clínica del Valle",
    stage: "Evaluación",
    value: "$48,000",
    email: "mariana.lopez@valle.example",
    phone: "+52 55 1200 4410",
    city: "Ciudad de México",
    country: "México",
    flag: "🇲🇽",
    timezone: "America/Mexico_City",
    insight:
      "Mariana pidió una demo del expediente clínico la semana pasada. El bloqueo actual es integrar el calendario de especialistas, no el precio.",
    nextStep: "Enviar propuesta con el módulo de agenda antes del viernes.",
    activities: [
      { id: "a1", title: "Demo del expediente", when: "hace 6 días" },
      { id: "a2", title: "Nota de seguimiento", when: "hace 2 días" },
    ],
  },
  {
    id: "andres",
    name: "Andrés Molina",
    company: "Grupo Nube",
    stage: "Propuesta",
    value: "$120,000",
    email: "andres.molina@nube.example",
    phone: "+34 91 000 2211",
    city: "Madrid",
    country: "España",
    flag: "🇪🇸",
    timezone: "Europe/Madrid",
    insight:
      "La propuesta está con compras. Andrés quiere un piloto de 30 días para el equipo de operaciones antes de firmar el anual.",
    nextStep: "Confirmar alcance del piloto y fecha de arranque.",
    activities: [
      { id: "b1", title: "Propuesta enviada", when: "hace 3 días" },
      { id: "b2", title: "Llamada con compras", when: "ayer" },
    ],
  },
  {
    id: "sofia",
    name: "Sofía Chen",
    company: "Norte Salud",
    stage: "Negociación",
    value: "$75,000",
    email: "sofia.chen@nortesalud.example",
    phone: "+1 416 555 0198",
    city: "Toronto",
    country: "Canadá",
    flag: "🇨🇦",
    timezone: "America/Toronto",
    insight:
      "Están comparando dos proveedores. El diferenciador que más les importa es el panel de detalle sin salir del tablero.",
    nextStep: "Revisar descuento por pago anual en la llamada del martes.",
    activities: [
      { id: "c1", title: "Segunda demo", when: "hace 1 día" },
    ],
  },
  {
    id: "luis",
    name: "Luis Ortega",
    company: "Taller Órbita",
    stage: "Nuevo",
    value: "$15,000",
    email: "luis.ortega@orbita.example",
    phone: "+54 11 4000 8821",
    city: "Buenos Aires",
    country: "Argentina",
    flag: "🇦🇷",
    timezone: "America/Argentina/Buenos_Aires",
    insight:
      "Llegó por referido. Todavía no hubo llamada. Un primer contacto corto esta semana tiene buena probabilidad de respuesta.",
    nextStep: "Agendar una llamada de descubrimiento de 20 minutos.",
    activities: [
      { id: "d1", title: "Lead creado", when: "hoy" },
    ],
  },
]

export function LeadsDemo() {
  const panel = useLayeredPanelUrlState({ param: "lead", viewParam: "view" })
  const lead = leads.find((item) => item.id === panel.id) ?? null

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <Link href="/" className="text-sm font-semibold">
          Retana UI
        </Link>
        <span className="text-sm text-muted-foreground">Pipeline</span>
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
          {leads.length}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Team demo
          </Link>
          <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">
            Docs
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Prospectos</caption>
          <thead className="sticky top-0 bg-background text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Etapa</th>
              <th className="px-4 py-3 font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((item) => {
              const selected = panel.open && panel.id === item.id
              return (
                <tr
                  key={item.id}
                  tabIndex={0}
                  aria-selected={selected}
                  onClick={() => panel.openItem(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      panel.openItem(item.id)
                    }
                  }}
                  className={cn(
                    "cursor-pointer outline-none hover:bg-muted/60 focus-visible:bg-muted",
                    selected && "bg-muted/80",
                  )}
                >
                  <td className="border-b border-border px-4 py-3 font-medium">{item.name}</td>
                  <td className="border-b border-border px-4 py-3 text-muted-foreground">{item.company}</td>
                  <td className="border-b border-border px-4 py-3">
                    <Badge variant="secondary">{item.stage}</Badge>
                  </td>
                  <td className="border-b border-border px-4 py-3 tabular-nums">{item.value}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <LayeredPanel
        open={panel.open}
        onOpenChange={panel.onOpenChange}
        mode={panel.mode}
        onModeChange={panel.onModeChange}
        title={lead ? lead.name : "Prospecto"}
        description="Ficha del prospecto."
        closeLabel="Cerrar"
        mobilePeekLabel="Resumen"
        mobileFullLabel="Ficha"
      >
        {lead ? (
          <LeadDetail lead={lead} />
        ) : (
          <LayeredPanel.Peek>
            <p className="px-5 py-8 text-sm text-muted-foreground">
              Este prospecto no está en los datos de ejemplo.
            </p>
          </LayeredPanel.Peek>
        )}
      </LayeredPanel>
    </div>
  )
}

function LeadDetail({ lead }: { lead: Lead }) {
  const time = useZonedTime(lead.timezone, "es-MX")
  return (
    <>
      <LayeredPanel.Header>
        <div>
          <h2 className="text-base font-semibold">{lead.name}</h2>
          <div className="mt-1.5 flex gap-1.5">
            <Badge variant="secondary">{lead.stage}</Badge>
            <Badge variant="outline">{lead.value}</Badge>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {lead.flag} {lead.country} / {lead.city}
          </span>
          <time>{time}</time>
        </div>
      </LayeredPanel.Header>
      <LayeredPanel.ExpandToggle
        expandLabel="Ver ficha completa"
        collapseLabel="Cerrar ficha"
      />
      <LayeredPanel.Peek>
        <div className="flex flex-col gap-5 px-5 pt-1 pb-8">
          <section className="rounded-xl bg-muted/70 px-4 py-3.5">
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              <Sparkles className="size-3.5" />
              Notas
            </h3>
            <p className="text-sm leading-relaxed">{lead.insight}</p>
          </section>
          <section>
            <h3 className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Siguiente paso
            </h3>
            <p className="text-sm">{lead.nextStep}</p>
          </section>
          <section>
            <h3 className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Actividad
            </h3>
            <ul>
              {lead.activities.map((activity) => (
                <li key={activity.id} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                  <span>{activity.title}</span>
                  <span className="text-xs text-muted-foreground">{activity.when}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </LayeredPanel.Peek>
      <LayeredPanel.Full>
        <DetailSection title="Información personal" icon={<User />}>
          <DetailField label="Nombre" icon={<User />} value={lead.name} />
          <DetailField label="Correo" icon={<Mail />} value={lead.email} href={`mailto:${lead.email}`} />
          <DetailField label="Teléfono" icon={<Phone />} value={lead.phone} href={`tel:${lead.phone.replace(/\s/g, "")}`} />
          <DetailField label="Ciudad" icon={<Globe />} value={`${lead.city}, ${lead.country}`} />
        </DetailSection>
        <DetailSection title="Empresa" icon={<Building2 />}>
          <DetailField label="Cuenta" icon={<Building2 />} value={lead.company} />
          <DetailField label="Etapa" value={lead.stage} />
          <DetailField label="Valor" value={lead.value} />
          <DetailField label="Siguiente paso" value={lead.nextStep} />
        </DetailSection>
      </LayeredPanel.Full>
    </>
  )
}
