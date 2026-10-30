"use client"

import { useState, type ReactNode } from "react"
import { Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { NumberRoll } from "@/registry/ui/number-roll"
import { StaggerList } from "@/registry/ui/stagger-list"

type Locale = "es" | "en"

const copy = {
  es: {
    language: "Idioma",
    no: "No",
    yes: "Sí",
    widthTitle: "Anchos acotados",
    widthBody: "La columna se detiene. La burbuja mide la frase, no la pantalla.",
    borderTitle: "Sin bordes redundantes",
    borderBody: "Espacio y superficie separan. El borde no se apila.",
    colorTitle: "Color fuerte solo en lo activo",
    colorBody: "El primario marca el día en curso y la acción. Lo demás queda apagado.",
    typeTitle: "Jerarquía dentro del valor",
    typeBody: "El entero manda. Los decimales son más chicos y más ligeros.",
    motionTitle: "Animar con continuidad",
    motionBody: "La lista no corta: sale hacia arriba y entra desde abajo. El retraso total tiene tope.",
    bubble: "¿Nos vemos el sábado en el taller?",
    reply: "Aparto el horno de las diez.",
    placeholder: "Mensaje",
    send: "Enviar",
    week: "Esta semana",
    days: ["L", "M", "M", "J", "V", "S", "D"],
    activeDay: "Jueves",
    cut: "Corte duro: el bloque aparece de golpe.",
    flow: "Continuo: opacidad y translate, sin animar el alto.",
    out: "Sale",
    in: "Entra",
    swap: "Cambiar",
    changeDay: "Cambiar día",
  },
  en: {
    language: "Language",
    no: "No",
    yes: "Yes",
    widthTitle: "Bounded widths",
    widthBody: "The column stops. The bubble is as wide as the sentence, not the screen.",
    borderTitle: "No redundant borders",
    borderBody: "Space and surface separate things. Borders do not stack.",
    colorTitle: "Strong color only on the active thing",
    colorBody: "Primary marks the current day and the action. The rest stays quiet.",
    typeTitle: "Hierarchy inside one value",
    typeBody: "The integer leads. The fraction is smaller and lighter.",
    motionTitle: "Animate with continuity",
    motionBody: "The list does not cut: it leaves upward and enters from below. Total delay is capped.",
    bubble: "Shall we meet at the workshop on Saturday?",
    reply: "I'll book the ten o'clock kiln.",
    placeholder: "Message",
    send: "Send",
    week: "This week",
    days: ["M", "T", "W", "T", "F", "S", "S"],
    activeDay: "Thursday",
    cut: "Hard cut: the block appears in one frame.",
    flow: "Continuous: opacity and translate, without animating height.",
    out: "Leave",
    in: "Enter",
    swap: "Swap",
    changeDay: "Change day",
  },
} as const

const bars = [42, 68, 36, 100, 74, 48, 28]
const activeBar = 3

function text<K extends keyof (typeof copy)["es"]>(locale: Locale, key: K) {
  return copy[locale][key]
}

function Pair({
  rule,
  title,
  body,
  no,
  yes,
  noLabel,
  yesLabel,
}: {
  rule: string
  title: string
  body: string
  no: ReactNode
  yes: ReactNode
  noLabel: string
  yesLabel: string
}) {
  return (
    <section data-rule={rule} className="flex flex-col gap-3" aria-labelledby={`${rule}-title`}>
      <div>
        <h2 id={`${rule}-title`} className="text-base font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
      <div className="grid gap-3">
        <Example label={noLabel}>{no}</Example>
        <Example label={yesLabel}>{yes}</Example>
      </div>
    </section>
  )
}

function Example({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="min-w-0 rounded-xl bg-card p-3 shadow-sm">
      <figcaption className="mb-2 text-xs font-medium text-foreground">{label}</figcaption>
      {children}
    </figure>
  )
}

function Days({ locale, loud }: { locale: Locale; loud: boolean }) {
  const days = copy[locale].days
  return (
    <div className="grid grid-cols-7 gap-1" role="list" aria-label={text(locale, "activeDay")}>
      {days.map((day, index) => {
        const active = index === activeBar
        return (
          <div key={`${day}-${index}`} role="listitem" className="flex flex-col items-center gap-1">
            <div className="flex h-16 items-end">
              <div
                className={cn("w-2 rounded-sm", loud || active ? "bg-primary" : "bg-muted")}
                style={{ height: `${bars[index]}%` }}
              />
            </div>
            <span
              className={cn(
                "text-xs",
                loud ? "font-medium text-primary-foreground bg-primary rounded-md px-1" : active ? "font-medium text-foreground" : "text-muted-foreground",
              )}
              aria-current={active ? "date" : undefined}
            >
              {day}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function HardCut({ locale }: { locale: Locale }) {
  const [on, setOn] = useState(true)
  const t = copy[locale]
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">{t.cut}</p>
      <button
        type="button"
        onClick={() => setOn((current) => !current)}
        className="w-fit rounded-md px-2 py-1 text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t.swap}
      </button>
      <div className="rounded-lg bg-muted px-3 py-2 text-sm">{on ? t.out : t.in}</div>
    </div>
  )
}

function ContinuousList({ locale }: { locale: Locale }) {
  const t = copy[locale]
  const [day, setDay] = useState<"hoy" | "manana">("hoy")
  const items =
    day === "hoy"
      ? [
          { id: "kiln", label: locale === "en" ? "Firing · 9:00" : "Horneada · 9:00" },
          { id: "glaze", label: locale === "en" ? "Glaze review · 11:30" : "Revisión de esmalte · 11:30" },
        ]
      : [
          { id: "clay", label: locale === "en" ? "Clay wedging · 10:00" : "Amasar el barro · 10:00" },
          { id: "shelf", label: locale === "en" ? "Shelf count · 13:00" : "Inventario · 13:00" },
        ]
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">{t.flow}</p>
      <button
        type="button"
        onClick={() => setDay((current) => (current === "hoy" ? "manana" : "hoy"))}
        className="w-fit rounded-md px-2 py-1 text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t.changeDay}
      </button>
      <StaggerList items={items} label={locale === "en" ? "Agenda" : "Agenda"}>
        {(item) => <div className="rounded-lg bg-muted px-3 py-2 text-sm">{item.label}</div>}
      </StaggerList>
    </div>
  )
}

export function LayoutRulesGallery() {
  const [locale, setLocale] = useState<Locale>("es")
  const t = copy[locale]

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col gap-8">
      <div role="group" aria-label={t.language} className="flex gap-1">
        {(["es", "en"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={locale === option}
            onClick={() => setLocale(option)}
            className={cn(
              "rounded-md px-2 py-1 text-xs uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring",
              locale === option ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <Pair
        rule="RUI-LAYOUT-WIDTH-001"
        title={t.widthTitle}
        body={t.widthBody}
        noLabel={t.no}
        yesLabel={t.yes}
        no={
          <div className="flex flex-col gap-2">
            <p className="w-full rounded-lg border border-border px-3 py-2 text-sm">{t.bubble}</p>
            <div className="h-9 w-full rounded-lg border border-border" />
          </div>
        }
        yes={
          <div className="mx-auto flex w-full max-w-[17.5rem] flex-col gap-2">
            <p className="w-fit max-w-full rounded-lg bg-muted px-3 py-2 text-sm">{t.bubble}</p>
            <div className="h-9 w-full rounded-lg bg-muted" />
          </div>
        }
      />

      <Pair
        rule="RUI-LAYOUT-BORDER-001"
        title={t.borderTitle}
        body={t.borderBody}
        noLabel={t.no}
        yesLabel={t.yes}
        no={
          <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <p className="w-full rounded-lg border border-border px-3 py-2 text-sm">{t.reply}</p>
            <div className="flex gap-2">
              <div className="h-9 min-w-0 flex-1 rounded-lg border border-border" />
              <div className="grid size-9 place-items-center rounded-lg border border-border">
                <Send className="size-4" aria-hidden="true" />
              </div>
            </div>
          </div>
        }
        yes={
          <div className="mx-auto flex w-full max-w-[17.5rem] flex-col gap-2">
            <p className="w-fit max-w-full rounded-lg bg-muted px-3 py-2 text-sm">{t.reply}</p>
            <div className="flex gap-2">
              <div className="flex h-9 min-w-0 flex-1 items-center rounded-lg bg-muted px-3 text-sm text-foreground">{t.placeholder}</div>
              <button
                type="button"
                aria-label={t.send}
                className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Send className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        }
      />

      <Pair
        rule="RUI-LAYOUT-COLOR-001"
        title={t.colorTitle}
        body={t.colorBody}
        noLabel={t.no}
        yesLabel={t.yes}
        no={<Days locale={locale} loud />}
        yes={<Days locale={locale} loud={false} />}
      />

      <Pair
        rule="RUI-TYPE-HIERARCHY-001"
        title={t.typeTitle}
        body={t.typeBody}
        noLabel={t.no}
        yesLabel={t.yes}
        no={<p className="text-2xl font-medium tabular-nums">$18,640.50</p>}
        yes={
          <div>
            <NumberRoll
              value={18640.5}
              decimals={2}
              hierarchy
              prefix="$"
              locale={locale === "en" ? "en-US" : "es-MX"}
              className="text-2xl"
            />
            <p className="mt-1 text-xs text-muted-foreground">{t.week}</p>
          </div>
        }
      />

      <Pair
        rule="RUI-MOTION-CONTINUITY-001"
        title={t.motionTitle}
        body={t.motionBody}
        noLabel={t.no}
        yesLabel={t.yes}
        no={<HardCut locale={locale} />}
        yes={<ContinuousList locale={locale} />}
      />
    </div>
  )
}
