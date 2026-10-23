"use client"

/** Clean-room training screen for AE advisors. Composes the AE pieces. Theme tokens only. */

import { useState, type ReactNode } from "react"
import { BookOpen, CalendarDays, FolderOpen, Home, LogOut, Settings, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { aeAreaSeries, aeLeaders, aeProcesses, aeTasks } from "@/registry/retana/lib/ae-dash-data"
import { AeStagger } from "@/registry/retana/blocks/ae/card-shell"
import { FloatingPillSidebar } from "@/registry/retana/blocks/ae/floating-pill-sidebar"
import { LeaderboardCard } from "@/registry/retana/blocks/ae/leaderboard-card"
import { MultiAreaChartCard } from "@/registry/retana/blocks/ae/multi-area-chart-card"
import { PillTopNav } from "@/registry/retana/blocks/ae/pill-top-nav"
import { ProcessCard } from "@/registry/retana/blocks/ae/process-card"
import { TaskProgressCard } from "@/registry/retana/blocks/ae/task-progress-card"

const sideItems = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "cursos", label: "Cursos", icon: BookOpen },
  { id: "expedientes", label: "Expedientes", icon: FolderOpen },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "equipo", label: "Equipo", icon: Users },
]
const sideFooter = [
  { id: "ajustes", label: "Ajustes", icon: Settings },
  { id: "salir", label: "Salir", icon: LogOut },
]
const topItems = [
  { id: "resumen", label: "Resumen" },
  { id: "cursos", label: "Cursos" },
  { id: "certificaciones", label: "Certificaciones" },
  { id: "ranking", label: "Ranking" },
]

export type DashboardCapacitacionAeProps = { userName?: string; headerSlot?: ReactNode; onOpenProcess?: (id: string) => void; className?: string }

export function DashboardCapacitacionAe({ userName = "Ana Ruiz", headerSlot, onOpenProcess, className }: DashboardCapacitacionAeProps) {
  const [side, setSide] = useState("cursos")
  const [top, setTop] = useState("resumen")
  return (
    <div data-slot="dashboard-capacitacion-ae" className={cn("flex min-w-0 gap-4 rounded-3xl bg-muted/50 p-4 text-foreground sm:gap-6 sm:p-6", className)}>
      <FloatingPillSidebar className="sticky top-6 hidden self-start md:flex" items={sideItems} footer={sideFooter} active={side} onNavigate={setSide} />
      <div className="min-w-0 flex-1">
        <FloatingPillSidebar orientation="horizontal" className="mb-4 md:hidden" items={sideItems} footer={sideFooter} active={side} onNavigate={setSide} />
        <PillTopNav brand={<span>Academia AE</span>} items={topItems} active={top} onNavigate={setTop} user={{ name: userName }} unread={1} />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Capacitación de asesores</h2>
            <p className="text-sm text-muted-foreground">Procesos, avance y ranking del equipo. Datos ficticios.</p>
          </div>
          {headerSlot}
        </div>
        <AeStagger className="mt-6 grid gap-4 xl:grid-cols-12">
          <div className="grid content-start gap-4 xl:col-span-4">
            {aeProcesses.map((process, index) => (
              <ProcessCard key={process.id} {...process} highlighted={index === 0} onOpen={onOpenProcess ? () => onOpenProcess(process.id) : undefined} />
            ))}
          </div>
          <div className="grid content-start gap-4 xl:col-span-8">
            <MultiAreaChartCard labels={aeAreaSeries.labels} series={aeAreaSeries.series} title="Actividad del equipo" />
            <div className="grid gap-4 lg:grid-cols-2">
              <TaskProgressCard tasks={aeTasks} title="Mis tareas" />
              <LeaderboardCard leaders={aeLeaders} highlightId="a1" />
            </div>
          </div>
        </AeStagger>
      </div>
    </div>
  )
}
