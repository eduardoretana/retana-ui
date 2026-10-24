"use client"

/** Filters for a work table: search, priority, people, cycle, and sort. */

import type { ReactElement } from "react"
import { ChevronDown, Maximize2, RotateCcw, Search, Undo2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { WORK_PRIORITIES, WORK_SORT_KEYS, type WorkPriority, type WorkSortDir, type WorkSortKey } from "@/registry/retana/lib/work-table"

export type WorkToolbarPerson = {
  id: string
  name: string
  initials?: string
  imageUrl?: string | null
}

export type WorkCycle = { id: string; label: string }

export type WorkToolbarLabels = {
  search: string
  priority: string
  assignee: string
  assigneeEmpty: string
  cycle: string
  cycleAll: string
  sort: string
  direction: string
  ascending: string
  descending: string
  sortManual: string
  sortDate: string
  sortPriority: string
  sortEffort: string
  reset: string
  expand: string
  collapse: string
  restore: string
}

export const defaultWorkToolbarLabels: WorkToolbarLabels = {
  search: "Buscar",
  priority: "Prioridad",
  assignee: "Responsable",
  assigneeEmpty: "Cualquiera",
  cycle: "Ciclo",
  cycleAll: "Todos los ciclos",
  sort: "Orden",
  direction: "Dirección",
  ascending: "Ascendente",
  descending: "Descendente",
  sortManual: "Manual",
  sortDate: "Fecha",
  sortPriority: "Prioridad",
  sortEffort: "Esfuerzo",
  reset: "Restablecer filtros",
  expand: "Expandir",
  collapse: "Contraer",
  restore: "Restaurar diseño",
}

const SORT_LABEL: Record<WorkSortKey, keyof WorkToolbarLabels> = {
  manual: "sortManual",
  date: "sortDate",
  priority: "sortPriority",
  effort: "sortEffort",
}

export type WorkTableToolbarProps = {
  query: string
  onQueryChange: (value: string) => void
  priorities: readonly WorkPriority[]
  onPrioritiesChange: (value: WorkPriority[]) => void
  people?: readonly WorkToolbarPerson[]
  assignees: readonly string[]
  onAssigneesChange: (ids: string[]) => void
  cycles?: readonly WorkCycle[]
  cycle: string | null
  onCycleChange: (id: string | null) => void
  sortKey: WorkSortKey
  sortDir: WorkSortDir
  onSortChange: (key: WorkSortKey, dir: WorkSortDir) => void
  onReset?: () => void
  onExpand?: () => void
  onRestore?: () => void
  expanded?: boolean
  labels?: Partial<WorkToolbarLabels>
  className?: string
}

export function WorkTableToolbar({
  query,
  onQueryChange,
  priorities,
  onPrioritiesChange,
  people = [],
  assignees,
  onAssigneesChange,
  cycles = [],
  cycle,
  onCycleChange,
  sortKey,
  sortDir,
  onSortChange,
  onReset,
  onExpand,
  onRestore,
  expanded = false,
  labels: labelOverrides,
  className,
}: WorkTableToolbarProps) {
  const labels = { ...defaultWorkToolbarLabels, ...labelOverrides }
  const selectedPeople = people.filter((person) => assignees.includes(person.id))

  function togglePriority(level: WorkPriority) {
    onPrioritiesChange(priorities.includes(level) ? priorities.filter((item) => item !== level) : [...priorities, level])
  }

  function toggleAssignee(id: string) {
    onAssigneesChange(assignees.includes(id) ? assignees.filter((item) => item !== id) : [...assignees, id])
  }

  return (
    <TooltipProvider>
      <div data-slot="work-toolbar" className={cn("flex flex-wrap items-center gap-2", className)}>
        <div className="relative min-w-40 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={labels.search}
            aria-label={labels.search}
            className="pl-8"
          />
        </div>

        <div role="group" aria-label={labels.priority} className="flex items-center gap-1">
          {WORK_PRIORITIES.map((level) => {
            const pressed = priorities.includes(level)
            return (
              <Button
                key={level}
                type="button"
                size="sm"
                variant={pressed ? "secondary" : "outline"}
                aria-pressed={pressed}
                onClick={() => togglePriority(level)}
              >
                {level.toUpperCase()}
              </Button>
            )
          })}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <span className="flex -space-x-1">
                {selectedPeople.slice(0, 3).map((person) => (
                  <Avatar key={person.id} size="sm" className="ring-2 ring-background">
                    {person.imageUrl ? <AvatarImage src={person.imageUrl} alt="" /> : null}
                    <AvatarFallback>{person.initials ?? person.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                ))}
              </span>
              {selectedPeople.length === 0 ? labels.assigneeEmpty : selectedPeople.length === 1 ? selectedPeople[0]?.name : `${selectedPeople.length} ${labels.assignee.toLowerCase()}`}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 gap-1 p-1">
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">{labels.assignee}</p>
            {people.map((person) => {
              const checked = assignees.includes(person.id)
              return (
                <label key={person.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                  <Checkbox checked={checked} onCheckedChange={() => toggleAssignee(person.id)} aria-label={person.name} />
                  <Avatar size="sm">
                    {person.imageUrl ? <AvatarImage src={person.imageUrl} alt="" /> : null}
                    <AvatarFallback>{person.initials ?? person.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">{person.name}</span>
                </label>
              )
            })}
          </PopoverContent>
        </Popover>

        {cycles.length > 0 ? (
          <Select value={cycle ?? "all"} onValueChange={(value) => onCycleChange(value === "all" ? null : value)}>
            <SelectTrigger aria-label={labels.cycle} className="w-40">
              <SelectValue placeholder={labels.cycleAll} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{labels.cycleAll}</SelectItem>
              {cycles.map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              {labels[SORT_LABEL[sortKey]]}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{labels.sort}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sortKey} onValueChange={(value) => onSortChange(value as WorkSortKey, sortDir)}>
              {WORK_SORT_KEYS.map((key) => (
                <DropdownMenuRadioItem key={key} value={key}>{labels[SORT_LABEL[key]]}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{labels.direction}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sortDir} onValueChange={(value) => onSortChange(sortKey, value as WorkSortDir)}>
              <DropdownMenuRadioItem value="asc">{labels.ascending}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="desc">{labels.descending}</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ms-auto flex items-center gap-1">
          {onReset ? (
            <Tip label={labels.reset}>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={labels.reset} onClick={onReset}>
                <RotateCcw />
              </Button>
            </Tip>
          ) : null}
          {onExpand ? (
            <Tip label={expanded ? labels.collapse : labels.expand}>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={expanded ? labels.collapse : labels.expand} aria-pressed={expanded} onClick={onExpand}>
                <Maximize2 />
              </Button>
            </Tip>
          ) : null}
          {onRestore ? (
            <Tip label={labels.restore}>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={labels.restore} onClick={onRestore}>
                <Undo2 />
              </Button>
            </Tip>
          ) : null}
        </div>
      </div>
    </TooltipProvider>
  )
}

function Tip({ label, children }: { label: string; children: ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
