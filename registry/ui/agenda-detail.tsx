"use client"

/**
 * Clean-room event detail. Detail and participants, plus host callbacks.
 * This file does not fetch and does not mutate the event.
 */

import * as React from "react"
import { DoorOpen, FileText, Link2, ListChecks, MapPin, Video, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  formatInterval,
  participantStatusLabel,
  resolveAgendaLabels,
  type AgendaCategory,
  type AgendaEvent,
  type AgendaLabels,
  type AgendaParticipantStatus,
} from "@/registry/retana/lib/agenda"

export type AgendaDetailProps<TMeta = Record<string, unknown>> = {
  event: AgendaEvent<TMeta>
  category?: AgendaCategory | null
  locale?: string
  timeZone?: string
  labels?: Partial<AgendaLabels>
  readOnly?: boolean
  onJoin?: (id: string) => void
  onOpenSummary?: (id: string) => void
  onCreateRoom?: (id: string) => void
  onOpenTask?: (id: string, taskId: string) => void
  onOpenRecord?: (id: string, recordId: string) => void
  onClose?: () => void
  className?: string
}

function statusVariant(status: AgendaParticipantStatus): "default" | "secondary" | "outline" {
  if (status === "confirmed") return "default"
  if (status === "pending") return "secondary"
  return "outline"
}

export function AgendaDetail<TMeta extends Record<string, unknown> = Record<string, unknown>>({
  event,
  category,
  locale = "es-MX",
  timeZone = "America/Mexico_City",
  labels: labelOverrides,
  readOnly = false,
  onJoin,
  onOpenSummary,
  onCreateRoom,
  onOpenTask,
  onOpenRecord,
  onClose,
  className,
}: AgendaDetailProps<TMeta>) {
  const labels = resolveAgendaLabels(labelOverrides)
  const when = formatInterval(event.startsAt, event.endsAt, timeZone, locale, event.allDay)
  const participants = event.participants ?? []

  return (
    <section data-slot="agenda-detail" aria-label={event.title} className={cn("flex flex-col gap-3 p-3", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground tabular-nums">{when}</p>
        {onClose ? (
          <Button type="button" variant="ghost" size="icon-sm" className="size-6" onClick={onClose} aria-label={labels.closeDetail}>
            <X aria-hidden />
          </Button>
        ) : null}
      </div>
      <Tabs defaultValue="detail">
        <TabsList className="w-full">
          <TabsTrigger value="detail">{labels.detailTab}</TabsTrigger>
          <TabsTrigger value="participants">{labels.participantsTab}</TabsTrigger>
        </TabsList>
        <TabsContent value="detail" className="mt-3 grid gap-2">
          <p className="text-sm break-words whitespace-pre-wrap" dir="auto">
            {event.description?.trim() ? event.description : labels.noDescription}
          </p>
          <dl className="grid gap-1 text-xs text-muted-foreground">
            {category ? (
              <div className="flex gap-2">
                <dt>{labels.categories}</dt>
                <dd className="text-foreground">{category.label}</dd>
              </div>
            ) : null}
            {event.location ? (
              <div className="flex gap-2">
                <dt className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden />
                  {labels.location}
                </dt>
                <dd className="text-foreground break-words" dir="auto">
                  {event.location}
                </dd>
              </div>
            ) : null}
          </dl>
        </TabsContent>
        <TabsContent value="participants" className="mt-3">
          {participants.length === 0 ? (
            <p className="text-sm text-muted-foreground">{labels.noParticipants}</p>
          ) : (
            <ul className="grid gap-2">
              {participants.map((person) => {
                const status = participantStatusLabel(person.status, labels)
                return (
                  <li key={person.id} className="flex items-center justify-between gap-2 text-sm" aria-label={labels.participantLine(person.name, status)}>
                    <span className="min-w-0 truncate" dir="auto">
                      {person.name}
                    </span>
                    <Badge variant={statusVariant(person.status)}>{status}</Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </TabsContent>
      </Tabs>
      <div className="flex flex-wrap gap-1.5">
        {onJoin ? (
          <Button type="button" size="sm" disabled={readOnly} onClick={() => onJoin(event.id)}>
            <Video aria-hidden />
            {labels.join}
          </Button>
        ) : null}
        {onOpenSummary ? (
          <Button type="button" size="sm" variant="outline" onClick={() => onOpenSummary(event.id)}>
            <FileText aria-hidden />
            {labels.openSummary}
          </Button>
        ) : null}
        {onCreateRoom ? (
          <Button type="button" size="sm" variant="outline" disabled={readOnly} onClick={() => onCreateRoom(event.id)}>
            <DoorOpen aria-hidden />
            {labels.createRoom}
          </Button>
        ) : null}
        {event.taskId && onOpenTask ? (
          <Button type="button" size="sm" variant="outline" onClick={() => onOpenTask(event.id, event.taskId!)}>
            <ListChecks aria-hidden />
            {labels.openTask}
          </Button>
        ) : null}
        {event.recordId && onOpenRecord ? (
          <Button type="button" size="sm" variant="outline" onClick={() => onOpenRecord(event.id, event.recordId!)}>
            <Link2 aria-hidden />
            {labels.openRecord}
          </Button>
        ) : null}
      </div>
    </section>
  )
}
