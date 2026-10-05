"use client"

/** Clean-room proposal editor. Sections reorder by pointer or keyboard. */

import * as React from "react"
import { GripVertical } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { moveSection, preflightReady, type PreflightItem, type ProposalSection } from "@/registry/retana/lib/proposal"
import { Stepper, type StepperStep } from "@/registry/retana/ui/stepper"

export type ProposalContact = {
  name: string
  role: string
  email: string
}

export type ProposalDocumentProps = {
  sections: readonly ProposalSection[]
  onSectionsChange: (sections: ProposalSection[]) => void
  variables: Readonly<Record<string, string>>
  phases: readonly { id: string; label: string; hours: string }[]
  preflight: readonly PreflightItem[]
  onPreflight: (id: string, done: boolean) => void
  readyLabel?: string
  notReadyLabel?: string
  preflightTitle?: string
  contact: ProposalContact
  contactTitle?: string
  timeline: readonly StepperStep[]
  timelineIndex?: number
  timelineLabel?: string
  reorderLabel?: string
  className?: string
}

function paint(body: string, variables: Readonly<Record<string, string>>) {
  const parts = body.split(/(\{[a-z0-9]+\})/gi)
  return parts.map((part, index) => {
    const token = part.match(/^\{([a-z0-9]+)\}$/i)
    if (!token) return <React.Fragment key={index}>{part}</React.Fragment>
    const key = token[1]
    const value = variables[key] ?? part
    return (
      <span key={index} className="rounded bg-muted px-1 text-foreground">
        {value}
      </span>
    )
  })
}

export function ProposalDocument({
  sections,
  onSectionsChange,
  variables,
  phases,
  preflight,
  onPreflight,
  readyLabel = "Ready to send",
  notReadyLabel = "Not ready",
  preflightTitle = "Pre-flight",
  contact,
  contactTitle = "Contact",
  timeline,
  timelineIndex = 0,
  timelineLabel = "Timeline",
  reorderLabel = "Reorder",
  className,
}: ProposalDocumentProps) {
  const ready = preflightReady(preflight)
  const dragId = React.useRef<string | null>(null)

  const move = (id: string, direction: -1 | 1) => {
    onSectionsChange(moveSection(sections, id, direction))
  }

  return (
    <div data-slot="proposal-document" className={cn("grid min-w-0 gap-4 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]", className)}>
      <div className="grid h-fit gap-4">
        <ol aria-label={reorderLabel} className="flex flex-col gap-1">
          {sections.map((section, index) => (
            <li
              key={section.id}
              draggable
              onDragStart={() => {
                dragId.current = section.id
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                const from = dragId.current
                dragId.current = null
                if (!from || from === section.id) return
                const fromIndex = sections.findIndex((item) => item.id === from)
                const direction = fromIndex < index ? 1 : -1
                let next = [...sections]
                let cursor = fromIndex
                while (cursor !== index) {
                  next = moveSection(next, from, direction)
                  cursor += direction
                }
                onSectionsChange(next)
              }}
              className="flex min-w-0 items-center gap-1 rounded-lg border border-border bg-card px-1 py-1"
            >
              <button
                type="button"
                className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                aria-label={`${reorderLabel} ${section.title}`}
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp") {
                    event.preventDefault()
                    move(section.id, -1)
                  }
                  if (event.key === "ArrowDown") {
                    event.preventDefault()
                    move(section.id, 1)
                  }
                }}
              >
                <GripVertical className="size-4" />
              </button>
              <span className="min-w-0 flex-1 truncate text-sm">
                {index + 1}. {section.title}
              </span>
            </li>
          ))}
        </ol>
        <section aria-label={preflightTitle} className="rounded-xl border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium">{preflightTitle}</h2>
            <Badge variant={ready ? "default" : "outline"}>{ready ? readyLabel : notReadyLabel}</Badge>
          </div>
          <ul className="mt-2 flex flex-col gap-2">
            {preflight.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={item.done}
                  onCheckedChange={(checked) => onPreflight(item.id, checked === true)}
                  aria-label={item.label}
                  className="mt-0.5"
                />
                <span className="wrap-break-word">{item.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="grid min-w-0 gap-4">
        <article className="min-w-0 rounded-xl border border-border bg-card px-4 py-6 shadow-sm sm:px-8">
          {sections.map((section) => (
            <section key={section.id} className="mb-6 last:mb-0">
              <h2 className="text-base font-medium">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 wrap-break-word text-muted-foreground">{paint(section.body, variables)}</p>
            </section>
          ))}
          <div className="min-w-0 max-w-full overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {phases.map((phase) => (
                  <tr key={phase.id} className="border-t border-border">
                    <td className="py-2 pe-3">{phase.label}</td>
                    <td className="py-2 text-end tabular-nums text-muted-foreground">{phase.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <div className="grid gap-3 sm:grid-cols-2">
          <section className="rounded-xl border border-border p-3" aria-label={contactTitle}>
            <h2 className="text-sm font-medium">{contactTitle}</h2>
            <p className="mt-2 text-sm">{contact.name}</p>
            <p className="text-xs text-muted-foreground">{contact.role}</p>
            <p className="text-xs text-muted-foreground wrap-break-word">{contact.email}</p>
          </section>
          <section aria-label={timelineLabel}>
            <h2 className="mb-2 text-sm font-medium">{timelineLabel}</h2>
            <Stepper steps={[...timeline]} current={timelineIndex} label={timelineLabel} compact />
          </section>
        </div>
      </div>
    </div>
  )
}
