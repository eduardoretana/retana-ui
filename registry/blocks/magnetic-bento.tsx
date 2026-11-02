"use client"

import type { ReactNode } from "react"
import { ArrowRight, Compass, Droplets, Images, Package, Store, Wrench } from "lucide-react"

import {
  MagneticBento,
  MagneticBentoCta,
  MagneticBentoDescription,
  MagneticBentoIcon,
  MagneticBentoIndex,
  MagneticBentoItem,
  MagneticBentoTitle,
  type MagneticBentoAccent,
  type MagneticBentoSpan,
} from "@/registry/retana/ui/magnetic-bento"

type Card = {
  value: string
  index: string
  accent: MagneticBentoAccent
  span: MagneticBentoSpan
  icon: ReactNode
}

type CardCopy = {
  title: string
  description: string
  cta: string
}

const cards: Card[] = [
  {
    value: "horno",
    index: "01",
    accent: "chart-1",
    span: { col: 2, row: 2 },
    icon: <Compass className="size-5" />,
  },
  {
    value: "esmalte",
    index: "02",
    accent: "chart-2",
    span: { col: 1, row: 1 },
    icon: <Droplets className="size-5" />,
  },
  {
    value: "empaque",
    index: "03",
    accent: "chart-3",
    span: { col: 1, row: 2 },
    icon: <Package className="size-5" />,
  },
  {
    value: "muro",
    index: "04",
    accent: "chart-4",
    span: { col: 1, row: 1 },
    icon: <Images className="size-5" />,
  },
  {
    value: "mayoreo",
    index: "05",
    accent: "chart-5",
    span: { col: 3, row: 1 },
    icon: <Store className="size-5" />,
  },
  {
    value: "reparacion",
    index: "06",
    accent: "primary",
    span: { col: 1, row: 1 },
    icon: <Wrench className="size-5" />,
  },
]

const copyEs: Record<string, CardCopy> = {
  horno: { title: "Horno norte", description: "Calendario compartido para las quemas de la semana.", cta: "Ver agenda" },
  esmalte: { title: "Bitácora de esmalte", description: "Pruebas y recetas que salieron del taller.", cta: "Abrir notas" },
  empaque: { title: "Carril de empaque", description: "Cajas listas y el orden de salida.", cta: "Revisar cajas" },
  muro: { title: "Muro de galería", description: "Piezas que están en exhibición ahora.", cta: "Recorrer" },
  mayoreo: { title: "Mesa de mayoreo", description: "Pedidos de tienda y fechas de entrega.", cta: "Ver pedidos" },
  reparacion: { title: "Estante de reparación", description: "Piezas que vuelven al banco.", cta: "Atender" },
}

const copyEn: Record<string, CardCopy> = {
  horno: { title: "North kiln", description: "Shared calendar for this week's firings.", cta: "View schedule" },
  esmalte: { title: "Glaze log", description: "Tests and recipes that left the studio.", cta: "Open notes" },
  empaque: { title: "Packing lane", description: "Boxes ready and the order they leave in.", cta: "Check boxes" },
  muro: { title: "Gallery wall", description: "Pieces on display now.", cta: "Walk through" },
  mayoreo: { title: "Wholesale table", description: "Shop orders and delivery dates.", cta: "View orders" },
  reparacion: { title: "Repair shelf", description: "Pieces back on the bench.", cta: "Tend to them" },
}

/** Six studio cards. Document order places the 2×2, the side column, and the wide row. */
export function MagneticBentoGrid({
  className,
  label,
  locale = "es-MX",
}: {
  className?: string
  label?: string
  /** `en` is the English wall. Anything else stays es-MX. */
  locale?: "es-MX" | "en"
}) {
  const pack = locale === "en" ? copyEn : copyEs
  const groupLabel = label ?? (locale === "en" ? "Studio" : "Taller")
  return (
    <MagneticBento label={groupLabel} defaultActive="horno" className={className}>
      {cards.map((card) => {
        const text = pack[card.value]
        return (
          <MagneticBentoItem key={card.value} value={card.value} span={card.span} accent={card.accent}>
            <MagneticBentoIcon>{card.icon}</MagneticBentoIcon>
            <MagneticBentoIndex>{card.index}</MagneticBentoIndex>
            <MagneticBentoTitle>{text?.title}</MagneticBentoTitle>
            <MagneticBentoDescription>{text?.description}</MagneticBentoDescription>
            <MagneticBentoCta asChild>
              <a href={`#${card.value}`} onClick={(event) => event.preventDefault()}>
                {text?.cta}
                <ArrowRight className="size-4" />
              </a>
            </MagneticBentoCta>
          </MagneticBentoItem>
        )
      })}
    </MagneticBento>
  )
}
