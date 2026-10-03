"use client"

import * as React from "react"
import { Bot } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  presenceColor,
  readPresenceInfo,
  useOthers,
  useSelf,
  type PresenceInfo,
  type PresenceUser,
} from "@/registry/retana/lib/presence"

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2)
  const letters = parts.map((part) => part[0] ?? "").join("")
  return letters || name.slice(0, 1)
}

export type PresenceAvatarsProps = {
  max?: number
  groupAgents?: boolean
  includeSelf?: boolean
  className?: string
  avatarClassName?: string
  overflowClassName?: string
  moreLabel?: (count: number) => string
}

export function PresenceAvatars({
  max = 4,
  groupAgents = false,
  includeSelf = false,
  className,
  avatarClassName,
  overflowClassName,
  moreLabel = (count) => `${count} more`,
}: PresenceAvatarsProps) {
  const others = useOthers<Record<string, unknown>, PresenceInfo>()
  const self = useSelf<Record<string, unknown>, PresenceInfo>()
  const people = includeSelf && self ? [...others, self] : others
  const agents = groupAgents ? people.filter((user) => user.isAgent) : []
  const humans = groupAgents ? people.filter((user) => !user.isAgent) : people
  const shown = humans.slice(0, max)
  const hidden = humans.slice(max)
  const overflow = hidden.length

  return (
    <TooltipProvider>
      <ul className={cn("flex items-center", className)}>
        {shown.map((user) => (
          <li key={user.connectionId} className="-ms-2 first:ms-0">
            <PersonAvatar user={user} className={avatarClassName} />
          </li>
        ))}
        {agents.length > 0 ? (
          <li className="-ms-2 first:ms-0">
            <AgentAvatar agents={agents} className={avatarClassName} />
          </li>
        ) : null}
        {overflow > 0 ? (
          <li className="-ms-2 first:ms-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={moreLabel(overflow)}
                  className={cn(
                    "grid size-8 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background focus-visible:outline-none focus-visible:ring-ring",
                    overflowClassName,
                  )}
                >
                  +{overflow}
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-48">
                <span className="block break-words">{hidden.map((user) => readPresenceInfo(user.info).name).join(", ")}</span>
              </TooltipContent>
            </Tooltip>
          </li>
        ) : null}
      </ul>
    </TooltipProvider>
  )
}

function PersonAvatar({ user, className }: { user: PresenceUser<unknown, PresenceInfo>; className?: string }) {
  const info = readPresenceInfo(user.info)
  const color = presenceColor(user.userId, info.color)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="relative inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className={className}>
            {info.avatar ? <AvatarImage src={info.avatar} alt="" /> : null}
            <AvatarFallback>{initials(info.name)}</AvatarFallback>
          </Avatar>
          <span
            className="absolute end-0 bottom-0 size-2 rounded-full ring-2 ring-background"
            style={{ backgroundColor: color }}
            aria-hidden
          />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-48">
        <span className="block break-words">{info.name}</span>
      </TooltipContent>
    </Tooltip>
  )
}

function AgentAvatar({
  agents,
  className,
}: {
  agents: readonly PresenceUser<unknown, PresenceInfo>[]
  className?: string
}) {
  const names = agents.map((user) => readPresenceInfo(user.info).name)
  const color = presenceColor(agents[0]?.userId ?? "agent", readPresenceInfo(agents[0]?.info).color)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="relative inline-flex" aria-label={names.join(", ")}>
          <Avatar className={className}>
            <AvatarFallback>
              <Bot className="size-4" />
            </AvatarFallback>
          </Avatar>
          <span
            className="absolute end-0 bottom-0 size-2 rounded-full ring-2 ring-background"
            style={{ backgroundColor: color }}
            aria-hidden
          />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-48">
        <span className="block break-words">{names.join(", ")}</span>
      </TooltipContent>
    </Tooltip>
  )
}
