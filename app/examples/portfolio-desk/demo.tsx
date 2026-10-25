"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { PortfolioDesk } from "@/registry/blocks/portfolio-desk"
import type { ActivityChatEntry } from "@/registry/lib/activity-chat"
import { activityChatLabelsEn } from "@/registry/lib/activity-chat"
import { dataTableReorderLabelsEn, type DataTableSort } from "@/registry/lib/data-table-reorder"
import { portfolioDeskLabelsEn } from "@/registry/blocks/portfolio-desk"
import { timelineGanttLabelsEn, type GanttScale } from "@/registry/lib/timeline-gantt"
import { DataTableMeter, DataTableSparkline, DataTableTrend } from "@/registry/ui/data-table-reorder"
import { inlineApproveLabelsEn } from "@/registry/ui/inline-approve-button"

import { demoItems, demoMessages, demoNow, demoPeople, demoRows, demoWorkstreams, type DeskRow } from "./data"

export function PortfolioDeskDemo({ chrome = true }: { chrome?: boolean }) {
  const [english, setEnglish] = useState(false)
  const [scale, setScale] = useState<GanttScale>("week")
  const [selected, setSelected] = useState<string | null>("catalogo")
  const [sort, setSort] = useState<DataTableSort | null>({ columnId: "hours", direction: "desc" })
  const [messages, setMessages] = useState<ActivityChatEntry[]>(demoMessages)
  const columns = useMemo(
    () => [
      {
        id: "name",
        header: english ? "Piece" : "Pieza",
        width: "minmax(10rem,1.4fr)",
        sortValue: (row: DeskRow) => row.name,
        cell: (row: DeskRow) => row.name,
      },
      {
        id: "hours",
        header: english ? "Hours" : "Horas",
        align: "end" as const,
        width: "7rem",
        sortValue: (row: DeskRow) => row.hours,
        cell: (row: DeskRow) => <span className="tabular-nums">{row.hours}</span>,
      },
      {
        id: "series",
        header: english ? "Week" : "Semana",
        sortable: false,
        width: "7rem",
        cell: (row: DeskRow) => <DataTableSparkline values={row.series} label={`${row.name}: ${row.hours}`} />,
      },
      {
        id: "progress",
        header: english ? "Progress" : "Avance",
        width: "10rem",
        sortValue: (row: DeskRow) => row.progress,
        cell: (row: DeskRow) => <DataTableMeter value={row.progress} label={`${row.progress}%`} />,
      },
      {
        id: "trend",
        header: english ? "Trend" : "Tendencia",
        width: "8rem",
        sortValue: (row: DeskRow) => (row.trend === "up" ? 1 : row.trend === "flat" ? 0 : -1),
        cell: (row: DeskRow) => <DataTableTrend direction={row.trend} label={row.trendLabel} />,
      },
    ],
    [english],
  )

  return (
    <div className="flex flex-col gap-3">
      {chrome ? (
        <button type="button" className="w-fit rounded-md border border-border px-2 py-1 text-xs" aria-pressed={english} onClick={() => setEnglish((value) => !value)}>
          {english ? "ES" : "EN"}
        </button>
      ) : null}
      <PortfolioDesk
        title="Taller Bruma"
        subtitle="Imprenta inventada en Guadalajara. Los encargos, las horas y los mensajes son de demostración."
        labels={english ? portfolioDeskLabelsEn : undefined}
        gantt={{
          items: demoItems,
          workstreams: demoWorkstreams,
          scale,
          onScaleChange: setScale,
          now: demoNow,
          selectedId: selected,
          labels: english ? timelineGanttLabelsEn : undefined,
          onSelect: (item) => {
            setSelected(item.id)
            toast(item.label)
          },
          onHover: (item) => {
            if (item) setSelected(item.id)
          },
        }}
        table={{
          rows: demoRows,
          columns,
          sort,
          onSortChange: setSort,
          selectedId: selected,
          labels: english ? dataTableReorderLabelsEn : undefined,
          onRowSelect: (row) => setSelected(row.id),
          detail: (row) => ({
            title: row.name,
            label: row.name,
            eyebrow: row.owner,
            description: row.note,
            metrics: [{ id: "hours", label: english ? "Hours" : "Horas", value: String(row.hours) }],
          }),
        }}
        chat={{
          messages,
          people: demoPeople,
          currentUserId: "mina",
          labels: english ? activityChatLabelsEn : undefined,
          onPlay: (id) => toast(id),
          onSend: (body) => {
            setMessages((current) => [
              ...current,
              { id: `local-${current.length + 1}`, kind: "message", authorId: "mina", createdAt: demoNow, body },
            ])
          },
        }}
        approval={{
          labels: english ? inlineApproveLabelsEn : { idle: "Aprobar el catálogo", success: "Catálogo aprobado" },
          onConfirm: async () => {
            await new Promise((resolve) => setTimeout(resolve, 400))
            toast(english ? "Saved by the host." : "El anfitrión guardó la aprobación.")
          },
        }}
      />
    </div>
  )
}
