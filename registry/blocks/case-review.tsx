"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { BreakdownBar, type BreakdownSegment } from "@/registry/retana/ui/breakdown-bar"
import { RecordHeader, type RecordAction, type RecordCrumb, type RecordPerson } from "@/registry/retana/ui/record-header"
import { RecordTimeline, type RecordTimelineEvent } from "@/registry/retana/ui/record-timeline"
import { SuggestionCard, type SuggestionCardProps } from "@/registry/retana/ui/suggestion-card"
import { SuggestedChoiceDialog, type SuggestedChoice, type SuggestedChoiceField } from "@/registry/retana/ui/suggested-choice-dialog"
import { WellCard } from "@/registry/retana/ui/well-card"
import { ToastStack, ToastStackProvider, useToastStack } from "@/registry/retana/ui/toast-stack"
import type { PriorityLevel } from "@/registry/retana/ui/priority-badge"

export type CaseReviewProps = {
  crumbs?: readonly RecordCrumb[]
  title: string
  meta?: readonly string[]
  people?: readonly RecordPerson[]
  priority?: PriorityLevel
  statusDot?: string
  timeline: readonly RecordTimelineEvent[]
  timelineLabel?: string
  timelineContext?: string
  notes?: React.ReactNode
  notesCount?: number
  photos?: React.ReactNode
  photosCount?: number
  suggestion: Omit<SuggestionCardProps, "status" | "onConfirm" | "onChange" | "onAction">
  choices: readonly SuggestedChoice[]
  fields?: readonly SuggestedChoiceField[]
  dialogTitle: string
  dialogSubtitle?: string
  dialogHint?: string
  confirmLabel?: string
  nextLabel?: string
  reassignLabel?: string
  undoTitle?: string
  undoDescription?: string
  costTitle?: string
  costTotal: number
  costSegments: readonly BreakdownSegment[]
  locale?: string
  currency?: string
  onConfirm?: (choiceId: string, fields: Record<string, string>) => void
  onUndo?: () => void
  onReassign?: () => void
  onCreateAction?: () => void
  className?: string
}

export function CaseReview(props: CaseReviewProps) {
  return (
    <ToastStackProvider>
      <div className="relative min-w-0">
        <CaseReviewBody {...props} />
        <ToastStack contained position="bottom-center" />
      </div>
    </ToastStackProvider>
  )
}

function CaseReviewBody({
  crumbs = [],
  title,
  meta = [],
  people = [],
  priority,
  statusDot,
  timeline,
  timelineLabel = "Case timeline",
  timelineContext,
  notes,
  notesCount = 0,
  photos,
  photosCount = 0,
  suggestion,
  choices,
  fields = [],
  dialogTitle,
  dialogSubtitle,
  dialogHint,
  confirmLabel = "Confirm",
  nextLabel = "Create action",
  reassignLabel = "Reassign",
  undoTitle = "Choice saved",
  undoDescription = "Undo restores the previous status.",
  costTitle = "Cost",
  costTotal,
  costSegments,
  locale = "en-US",
  currency = "USD",
  onConfirm,
  onUndo,
  onReassign,
  onCreateAction,
  className,
}: CaseReviewProps) {
  const { toast } = useToastStack()
  const [phase, setPhase] = React.useState<"suggested" | "confirmed">("suggested")
  const [open, setOpen] = React.useState(false)
  const [confirmedChoice, setConfirmedChoice] = React.useState<string | null>(null)
  const secondary: RecordAction[] = onReassign ? [{ id: "reassign", label: reassignLabel, onSelect: onReassign }] : []

  function confirm(choiceId: string, nextFields: Record<string, string>) {
    setPhase("confirmed")
    setConfirmedChoice(choiceId)
    setOpen(false)
    onConfirm?.(choiceId, nextFields)
    toast({
      appearance: "undo",
      type: "success",
      title: undoTitle,
      description: undoDescription,
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => {
          setPhase("suggested")
          setConfirmedChoice(null)
          onUndo?.()
        },
      },
    })
  }

  const primary =
    phase === "suggested" ? (
      <Button type="button" className="rounded-full" onClick={() => setOpen(true)}>
        {confirmLabel}
      </Button>
    ) : (
      <Button type="button" className="rounded-full" onClick={onCreateAction}>
        {nextLabel}
      </Button>
    )

  return (
    <div data-slot="case-review" data-phase={phase} className={cn("@container flex min-w-0 flex-col gap-4", className)}>
      <RecordHeader
        crumbs={crumbs}
        title={title}
        meta={meta}
        people={people}
        priority={priority}
        status={phase === "confirmed" ? "Confirmed" : undefined}
        statusDot={phase === "confirmed" ? "Confirmed" : statusDot}
        secondary={secondary}
        primary={primary}
      />
      <div className="grid gap-4 @min-[48rem]:grid-cols-12">
        <WellCard title="Activity" className="@min-[48rem]:col-span-7" inset={false}>
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes {notesCount}</TabsTrigger>
              <TabsTrigger value="photos">Photos {photosCount}</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline" className="pt-3">
              <RecordTimeline events={timeline} label={timelineLabel} context={timelineContext} locale={locale} />
            </TabsContent>
            <TabsContent value="notes" className="pt-3 text-sm text-muted-foreground">
              {notes ?? "No notes yet."}
            </TabsContent>
            <TabsContent value="photos" className="pt-3 text-sm text-muted-foreground">
              {photos ?? "No photos yet."}
            </TabsContent>
          </Tabs>
        </WellCard>
        <div className="flex flex-col gap-4 @min-[48rem]:col-span-5">
          <SuggestionCard
            {...suggestion}
            status={phase}
            onConfirm={() => setOpen(true)}
            onChange={() => setOpen(true)}
            onAction={onCreateAction}
          />
          <WellCard title={costTitle}>
            <BreakdownBar total={costTotal} segments={costSegments} locale={locale} currency={currency} />
          </WellCard>
        </div>
      </div>
      <SuggestedChoiceDialog
        open={open}
        onOpenChange={setOpen}
        title={dialogTitle}
        subtitle={dialogSubtitle}
        hint={dialogHint}
        options={choices}
        value={confirmedChoice ?? undefined}
        onConfirm={confirm}
        fields={fields}
        confirmLabel={confirmLabel}
      />
    </div>
  )
}
