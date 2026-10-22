"use client"

/** Clean-room analytics screen for AE (Asesor Experto). Composes the AE pieces. Theme tokens only. */

import { useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"
import { aeAppointments, aeDays, aeMonthly, aeNotes, aeStates, aeStats } from "@/registry/retana/lib/ae-dash-data"
import { AeStagger } from "@/registry/retana/blocks/ae/card-shell"
import { BarTrendCard } from "@/registry/retana/blocks/ae/bar-trend-card"
import { DayScrollerSchedule } from "@/registry/retana/blocks/ae/day-scroller-schedule"
import { HighlightCtaCard } from "@/registry/retana/blocks/ae/highlight-cta-card"
import { PillTopNav } from "@/registry/retana/blocks/ae/pill-top-nav"
import { QuickNotesCard } from "@/registry/retana/blocks/ae/quick-notes-card"
import { RadialPairCard } from "@/registry/retana/blocks/ae/radial-pair-card"
import { StatSparklineCard } from "@/registry/retana/blocks/ae/stat-sparkline-card"
import { StateDistributionCard } from "@/registry/retana/blocks/ae/state-distribution-card"

export const aeNavItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "clientes", label: "Clientes" },
  { id: "expedientes", label: "Expedientes" },
  { id: "cotizaciones", label: "Cotizaciones" },
  { id: "agenda", label: "Agenda" },
]

export type DashboardAnaliticoAeProps = {
  userName?: string
  onCreate?: () => void
  headerSlot?: ReactNode
  today?: string
  className?: string
}

export function DashboardAnaliticoAe({ userName = "Ana Ruiz", onCreate, headerSlot, today = "2026-10-22", className }: DashboardAnaliticoAeProps) {
  const [section, setSection] = useState("dashboard")
  return (
    <div data-slot="dashboard-analitico-ae" className={cn("min-w-0 rounded-[2rem] bg-muted/50 p-4 text-foreground sm:p-6", className)}>
      <PillTopNav
        brand={
          <>
            <span aria-hidden className="grid size-9 place-items-center rounded-full bg-primary text-sm text-primary-foreground">AE</span>
            Asesor Experto
          </>
        }
        items={aeNavItems}
        active={section}
        onNavigate={setSection}
        user={{ name: userName }}
        unread={3}
      />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hola, {userName.split(" ")[0]}</h2>
          <p className="text-sm text-muted-foreground">Así va tu cartera de pensiones esta semana. Datos ficticios.</p>
        </div>
        {headerSlot}
      </div>
      <AeStagger className="mt-6 grid gap-4 lg:grid-cols-12">
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-9">
          {aeStats.map((stat, index) => (
            <StatSparklineCard key={stat.label} {...stat} invert={index === 2} />
          ))}
        </div>
        <HighlightCtaCard className="lg:col-span-3 lg:row-span-2" eyebrow="Trámites resueltos este mes" value="84" caption="+18 vs. septiembre" actionLabel="Crear nueva" onAction={onCreate} />
        <RadialPairCard
          className="lg:col-span-5"
          title="Servicio a clientes"
          items={[
            { label: "Tiempo de respuesta", value: 86, caption: "En menos de 2 h" },
            { label: "Resolución", value: 72, caption: "Primera revisión" },
          ]}
        />
        <QuickNotesCard className="lg:col-span-4" notes={aeNotes} />
        <BarTrendCard className="lg:col-span-5" title="Expedientes cerrados" data={aeMonthly} />
        <StateDistributionCard className="lg:col-span-3" items={aeStates} />
        <DayScrollerSchedule className="lg:col-span-4" days={aeDays} items={aeAppointments} defaultDay={today} />
      </AeStagger>
    </div>
  )
}
