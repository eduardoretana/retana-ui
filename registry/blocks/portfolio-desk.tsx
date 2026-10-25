"use client"

/**
 * Clean-room portfolio desk.
 * It composes the schedule, the dense table, the thread, and the in-place approval.
 * Data stays in the props. The desk does not fetch. Spanish region names are the default.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { ActivityChat, type ActivityChatProps } from "@/registry/retana/ui/activity-chat"
import { DataTableReorder, type DataTableReorderProps, type DataTableReorderRow } from "@/registry/retana/ui/data-table-reorder"
import { InlineApproveButton, type InlineApproveButtonProps } from "@/registry/retana/ui/inline-approve-button"
import { TimelineGantt, type TimelineGanttProps } from "@/registry/retana/ui/timeline-gantt"

export type PortfolioDeskLabels = {
  schedule: string
  ledger: string
  conversation: string
  approval: string
}

export const portfolioDeskLabels: PortfolioDeskLabels = {
  schedule: "Cronograma",
  ledger: "Tablero",
  conversation: "Conversación",
  approval: "Aprobación",
}

export const portfolioDeskLabelsEn: PortfolioDeskLabels = {
  schedule: "Schedule",
  ledger: "Ledger",
  conversation: "Conversation",
  approval: "Approval",
}

export type PortfolioDeskProps<
  TRow extends DataTableReorderRow<TTableMeta>,
  TTableMeta = Record<string, unknown>,
  TGanttMeta = Record<string, unknown>,
  TChatMeta = Record<string, unknown>,
> = {
  title: string
  subtitle?: string
  gantt: TimelineGanttProps<TGanttMeta>
  table: DataTableReorderProps<TRow, TTableMeta>
  chat: ActivityChatProps<TChatMeta>
  approval?: InlineApproveButtonProps
  labels?: Partial<PortfolioDeskLabels>
  className?: string
}

export function PortfolioDesk<
  TRow extends DataTableReorderRow<TTableMeta>,
  TTableMeta = Record<string, unknown>,
  TGanttMeta = Record<string, unknown>,
  TChatMeta = Record<string, unknown>,
>({
  title,
  subtitle,
  gantt,
  table,
  chat,
  approval,
  labels,
  className,
}: PortfolioDeskProps<TRow, TTableMeta, TGanttMeta, TChatMeta>) {
  const copy = { ...portfolioDeskLabels, ...labels }
  const scheduleId = React.useId()
  const ledgerId = React.useId()
  const conversationId = React.useId()
  const approvalId = React.useId()

  return (
    <section data-slot="portfolio-desk" className={cn("@container flex min-w-0 flex-col gap-4 text-foreground", className)}>
      <header className="flex min-w-0 flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight break-words [overflow-wrap:anywhere]">{title}</h2>
        {subtitle ? <p className="max-w-3xl text-sm text-muted-foreground break-words [overflow-wrap:anywhere]">{subtitle}</p> : null}
      </header>
      <div className="grid min-w-0 gap-4 @min-[64rem]:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.8fr)]">
        <section aria-labelledby={scheduleId} className="min-h-[28rem] min-w-0">
          <h3 id={scheduleId} className="mb-2 text-sm font-medium">
            {copy.schedule}
          </h3>
          <TimelineGantt<TGanttMeta> {...gantt} hideHeading className={cn("h-[26rem]", gantt.className)} />
        </section>
        <section aria-labelledby={conversationId} className="min-h-[28rem] min-w-0">
          <h3 id={conversationId} className="mb-2 text-sm font-medium">
            {copy.conversation}
          </h3>
          <ActivityChat<TChatMeta> {...chat} className={cn("h-[26rem]", chat.className)} />
        </section>
      </div>
      <section aria-labelledby={ledgerId} className="min-w-0">
        <h3 id={ledgerId} className="mb-2 text-sm font-medium">
          {copy.ledger}
        </h3>
        <DataTableReorder<TRow, TTableMeta> {...table} />
      </section>
      {approval ? (
        <section aria-labelledby={approvalId} className="flex items-center gap-3">
          <h3 id={approvalId} className="text-sm font-medium">
            {copy.approval}
          </h3>
          <InlineApproveButton {...approval} />
        </section>
      ) : null}
    </section>
  )
}
