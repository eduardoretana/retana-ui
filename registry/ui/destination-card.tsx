"use client"

/** Destination plus key-value rows. */

import * as React from "react"

import { cn } from "@/lib/utils"

export type DestinationCardProps = {
  title?: string
  name: string
  detail?: string
  icon?: React.ReactNode
  status?: React.ReactNode
  fields?: readonly { label: string; value: string }[]
  className?: string
}

export function DestinationCard({ title, name, detail, icon, status, fields = [], className }: DestinationCardProps) {
  return (
    <section data-slot="destination-card" className={cn("flex min-w-0 flex-col gap-3 rounded-2xl bg-card p-3", className)}>
      {title ? <h3 className="text-sm font-medium">{title}</h3> : null}
      <div className="flex items-center gap-2">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted [&_svg]:size-4">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{name}</span>
          {detail ? <span className="block truncate text-xs text-muted-foreground">{detail}</span> : null}
        </span>
        {status}
      </div>
      {fields.length ? (
        <dl className="flex flex-col rounded-xl bg-muted px-3">
          {fields.map((field) => (
            <div key={field.label} className="flex items-baseline justify-between gap-3 border-t border-border py-2 text-sm first:border-t-0">
              <dt className="text-muted-foreground">{field.label}</dt>
              <dd className="text-end wrap-break-word">{field.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}
