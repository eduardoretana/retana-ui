"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type CrmTone = "neutral" | "emphasis" | "muted" | "danger"

export type CrmRow = {
  id: string
  name: string
  email?: string
  company?: string
  avatarUrl?: string
  status: string
  statusTone?: CrmTone
  stage: string
  owner: string
  ownerAvatarUrl?: string
  /** Preformatted by the host so locale stays outside this component. */
  lastActivity: string
}

export type CrmColumnLabels = {
  person?: string
  status?: string
  stage?: string
  owner?: string
  activity?: string
}

const TONE_VARIANT = {
  neutral: "secondary",
  emphasis: "default",
  muted: "outline",
  danger: "destructive",
} as const

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function CrmPersonCell({
  name,
  email,
  avatarUrl,
}: {
  name: string
  email?: string
  avatarUrl?: string
}) {
  return (
    <span className="flex items-center gap-2">
      <Avatar size="sm">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{name}</span>
        {email ? <span className="block truncate text-xs text-muted-foreground">{email}</span> : null}
      </span>
    </span>
  )
}

export function CrmStatusBadge({ label, tone = "neutral" }: { label: string; tone?: CrmTone }) {
  return <Badge variant={TONE_VARIANT[tone]}>{label}</Badge>
}

export function CrmOwnerCell({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  return (
    <span className="flex items-center gap-2">
      <Avatar size="sm">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <span className="truncate text-sm">{name}</span>
    </span>
  )
}

/**
 * Column objects shaped like TanStack column definitions.
 * Pass them to `AdminDataTable` from the data-table item when that item is
 * installed. This module does not import data-table, so it also stands alone.
 */
export function crmColumnDefs(labels: CrmColumnLabels = {}) {
  return [
    {
      id: "person",
      accessorFn: (row: CrmRow) => `${row.name} ${row.email ?? ""}`,
      header: labels.person ?? "Contact",
      cell: ({ row }: { row: { original: CrmRow } }) => (
        <CrmPersonCell name={row.original.name} email={row.original.email} avatarUrl={row.original.avatarUrl} />
      ),
    },
    {
      id: "status",
      accessorFn: (row: CrmRow) => row.status,
      header: labels.status ?? "Status",
      cell: ({ row }: { row: { original: CrmRow } }) => (
        <CrmStatusBadge label={row.original.status} tone={row.original.statusTone} />
      ),
    },
    {
      id: "stage",
      accessorFn: (row: CrmRow) => row.stage,
      header: labels.stage ?? "Stage",
      cell: ({ row }: { row: { original: CrmRow } }) => row.original.stage,
    },
    {
      id: "owner",
      accessorFn: (row: CrmRow) => row.owner,
      header: labels.owner ?? "Owner",
      cell: ({ row }: { row: { original: CrmRow } }) => (
        <CrmOwnerCell name={row.original.owner} avatarUrl={row.original.ownerAvatarUrl} />
      ),
    },
    {
      id: "activity",
      accessorFn: (row: CrmRow) => row.lastActivity,
      header: labels.activity ?? "Last activity",
      cell: ({ row }: { row: { original: CrmRow } }) => (
        <span className="text-sm text-muted-foreground tabular-nums">{row.original.lastActivity}</span>
      ),
    },
  ]
}

export type CrmTableProps = {
  rows: readonly CrmRow[]
  labels?: CrmColumnLabels
  emptyLabel?: string
  onRowClick?: (row: CrmRow) => void
  className?: string
}

export function CrmTable({
  rows,
  labels,
  emptyLabel = "No records",
  onRowClick,
  className,
}: CrmTableProps) {
  const columns = crmColumnDefs(labels)

  return (
    <div data-slot="crm-table" className={cn("overflow-hidden rounded-xl border border-border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={onRowClick ? "clickable" : undefined}
                className={cn(onRowClick && "cursor-pointer")}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          onRowClick(row)
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
              >
                <TableCell>
                  <CrmPersonCell name={row.name} email={row.email ?? row.company} avatarUrl={row.avatarUrl} />
                </TableCell>
                <TableCell>
                  <CrmStatusBadge label={row.status} tone={row.statusTone} />
                </TableCell>
                <TableCell>{row.stage}</TableCell>
                <TableCell>
                  <CrmOwnerCell name={row.owner} avatarUrl={row.ownerAvatarUrl} />
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">{row.lastActivity}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
