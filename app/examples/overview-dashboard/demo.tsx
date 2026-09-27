"use client"

import { toast } from "sonner"

import { OverviewDashboard } from "@/registry/ui/overview-dashboard"

export function OverviewDashboardDemo() {
  return (
    <main className="mx-auto min-h-dvh max-w-6xl bg-background p-6">
      <OverviewDashboard
        title="Resumen"
        trendTitle="Esta semana"
        upcomingTitle="Próximas llamadas"
        countsTitle="En el sitio"
        emptyUpcoming="Nada programado."
        visitorsLabel="Visitantes"
        viewsLabel="Páginas vistas"
        stats={[
          { id: "visitors", label: "Visitantes", value: 1284, previous: 1100, sparkline: [12, 18, 16, 22, 20, 28], tone: 1, caption: "semana anterior" },
          { id: "views", label: "Páginas", value: 2408, previous: 2300, sparkline: [30, 28, 34, 32, 40, 36], tone: 2, caption: "semana anterior" },
          { id: "calls", label: "Llamadas", value: 4, previous: 6, tone: 3, caption: "semana anterior" },
          { id: "projects", label: "En portada", value: 6, previous: 6, tone: 4 },
        ]}
        trend={[
          { label: "Lun", visitors: 120, views: 240 },
          { label: "Mar", visitors: 140, views: 260 },
          { label: "Mié", visitors: 110, views: 210 },
          { label: "Jue", visitors: 180, views: 320 },
          { label: "Vie", visitors: 160, views: 280 },
        ]}
        upcoming={[
          { id: "c1", title: "Lucía Navarro", meta: "Mar 10:00 · Estudio" },
          { id: "c2", title: "Andrés Molina", meta: "Jue 16:30 · Taller" },
        ]}
        counts={[
          { label: "Proyectos publicados", value: 8, href: "projects" },
          { label: "Preguntas", value: 5, href: "faqs" },
          { label: "Planes", value: 3, href: "plans" },
        ]}
        onOpen={(href) => toast.message(`Abrir ${href}`)}
      />
    </main>
  )
}
