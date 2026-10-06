"use client"

/** People on a record. Avatar, role, and an optional menu. */

import * as React from "react"
import { MoreHorizontal, UserPlus } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type Member = {
  id: string
  name: string
  role?: string
  owner?: boolean
  ownerLabel?: string
}

export type MemberAction = { id: string; label: string }

export type MemberListProps = {
  title?: string
  members: readonly Member[]
  addLabel?: string
  onAdd?: () => void
  actions?: readonly MemberAction[]
  onAction?: (memberId: string, actionId: string) => void
  emptyLabel?: string
  className?: string
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function MemberList({
  title,
  members,
  addLabel = "Add",
  onAdd,
  actions = [],
  onAction,
  emptyLabel = "No people yet",
  className,
}: MemberListProps) {
  return (
    <section data-slot="member-list" className={cn("flex min-w-0 flex-col gap-2", className)}>
      {title || onAdd ? (
        <header className="flex items-center justify-between gap-2">
          {title ? <h3 className="text-sm font-medium">{title}</h3> : <span />}
          {onAdd ? (
            <Button type="button" size="icon" variant="ghost" className="rounded-full" aria-label={addLabel} onClick={onAdd}>
              <UserPlus />
            </Button>
          ) : null}
        </header>
      ) : null}
      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col rounded-xl bg-muted p-1" aria-label={title}>
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
              <Avatar size="sm">
                <AvatarFallback>{initials(member.name) || "?"}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{member.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {member.role}
                  {member.owner ? ` · ${member.ownerLabel ?? "owner"}` : ""}
                </span>
              </span>
              {actions.length ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" size="icon-sm" variant="ghost" className="rounded-full" aria-label={`${member.name}`}>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {actions.map((action) => (
                      <DropdownMenuItem key={action.id} onSelect={() => onAction?.(member.id, action.id)}>
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
