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
  title: string
  description: string
  cta: string
  accent: MagneticBentoAccent
  span: MagneticBentoSpan
  icon: ReactNode
}

const cards: Card[] = [
  {
    value: "horno",
    index: "01",
    title: "Horno norte",
    description: "Calendario compartido para las quemas de la semana.",
    cta: "Ver agenda",
    accent: "chart-1",
    span: { col: 2, row: 2 },
    icon: <Compass className="size-5" />,
  },
  {
    value: "esmalte",
    index: "02",
    title: "Bitácora de esmalte",
    description: "Pruebas y recetas que salieron del taller.",
    cta: "Abrir notas",
    accent: "chart-2",
    span: { col: 1, row: 1 },
    icon: <Droplets className="size-5" />,
  },
  {
    value: "empaque",
    index: "03",
    title: "Carril de empaque",
    description: "Cajas listas y el orden de salida.",
    cta: "Revisar cajas",
    accent: "chart-3",
    span: { col: 1, row: 2 },
    icon: <Package className="size-5" />,
  },
  {
    value: "muro",
    index: "04",
    title: "Muro de galería",
    description: "Piezas que están en exhibición ahora.",
    cta: "Recorrer",
    accent: "chart-4",
    span: { col: 1, row: 1 },
    icon: <Images className="size-5" />,
  },
  {
    value: "mayoreo",
    index: "05",
    title: "Mesa de mayoreo",
    description: "Pedidos de tienda y fechas de entrega.",
    cta: "Ver pedidos",
    accent: "chart-5",
    span: { col: 3, row: 1 },
    icon: <Store className="size-5" />,
  },
  {
    value: "reparacion",
    index: "06",
    title: "Estante de reparación",
    description: "Piezas que vuelven al banco.",
    cta: "Atender",
    accent: "primary",
    span: { col: 1, row: 1 },
    icon: <Wrench className="size-5" />,
  },
]

/** Six studio cards. Document order places the 2×2, the side column, and the wide row. */
export function MagneticBentoGrid({ className, label = "Taller" }: { className?: string; label?: string }) {
  return (
    <MagneticBento label={label} defaultActive="horno" className={className}>
      {cards.map((card) => (
        <MagneticBentoItem key={card.value} value={card.value} span={card.span} accent={card.accent}>
          <MagneticBentoIcon>{card.icon}</MagneticBentoIcon>
          <MagneticBentoIndex>{card.index}</MagneticBentoIndex>
          <MagneticBentoTitle>{card.title}</MagneticBentoTitle>
          <MagneticBentoDescription>{card.description}</MagneticBentoDescription>
          <MagneticBentoCta asChild>
            <a href={`#${card.value}`} onClick={(event) => event.preventDefault()}>
              {card.cta}
              <ArrowRight className="size-4" />
            </a>
          </MagneticBentoCta>
        </MagneticBentoItem>
      ))}
    </MagneticBento>
  )
}
