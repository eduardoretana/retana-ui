"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AtSign,
  BookOpen,
  CalendarOff,
  Code2,
  CreditCard,
  Globe,
  Hash,
  Kanban,
  Mail,
  Megaphone,
  Music,
  Palette,
  Search,
  Sparkles,
  User,
  Users,
  Video,
  MessageSquare,
  ChevronsUpDown,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DetailField,
  DetailSection,
  LayeredPanel,
} from "@/registry/ui/layered-panel"
import { useLayeredPanelUrlState } from "@/registry/hooks/use-layered-panel-url-state"
import { ThemeToggle } from "@/components/demo/theme-toggle"
import { useZonedTime } from "@/components/demo/use-zoned-time"
import {
  departments,
  members,
  type CapacitySegment,
  type Member,
  type MemberRole,
  type MemberStatus,
  type MemberTask,
} from "@/components/demo/members"

type SortKey = "name" | "capacity" | "role" | "status"
type SortDir = "asc" | "desc"

const roleClass: Record<MemberRole, string> = {
  Designer:
    "bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-200",
  Developer:
    "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200",
  Marketer:
    "bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-200",
}

const statusClass: Record<MemberStatus, string> = {
  Available:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200",
  PTO: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
}

const avatarClass = [
  "bg-violet-100 text-violet-800 dark:bg-violet-400/20 dark:text-violet-100",
  "bg-sky-100 text-sky-800 dark:bg-sky-400/20 dark:text-sky-100",
  "bg-amber-100 text-amber-800 dark:bg-amber-400/20 dark:text-amber-100",
  "bg-rose-100 text-rose-800 dark:bg-rose-400/20 dark:text-rose-100",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-100",
]

const segmentClass: Record<CapacitySegment["tone"], string> = {
  spotify: "bg-sky-500",
  zoom: "bg-violet-500",
  slack: "bg-emerald-500",
  available: "bg-muted-foreground/20",
}

function capacityClass(value: number) {
  if (value <= 0) return "bg-muted-foreground/25"
  if (value < 40) return "bg-rose-500"
  if (value < 75) return "bg-amber-400"
  return "bg-emerald-500"
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

export function TeamDashboard() {
  const panel = useLayeredPanelUrlState({ param: "member", viewParam: "view" })
  const [query, setQuery] = React.useState("")
  const [department, setDepartment] = React.useState<MemberRole | null>(null)
  const [sortKey, setSortKey] = React.useState<SortKey>("name")
  const [sortDir, setSortDir] = React.useState<SortDir>("asc")
  const [timezoneMode, setTimezoneMode] = React.useState(true)
  const [pto, setPto] = React.useState<Record<string, boolean>>({})

  const rows = members
    .filter((member) => (department ? member.role === department : true))
    .filter((member) => {
      const haystack = `${member.name} ${member.discord} ${member.slackId} ${member.role}`.toLowerCase()
      return haystack.includes(query.trim().toLowerCase())
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1
      if (sortKey === "capacity") return (a.capacity - b.capacity) * dir
      const left = String(a[sortKey]).toLocaleLowerCase()
      const right = String(b[sortKey]).toLocaleLowerCase()
      return left.localeCompare(right) * dir
    })

  const active = members.find((member) => member.id === panel.id) ?? null
  const activeStatus: MemberStatus | null = active
    ? pto[active.id]
      ? "PTO"
      : active.status
    : null

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"))
      return
    }
    setSortKey(key)
    setSortDir("asc")
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <IconRail />
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-14 items-center px-4 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setDepartment(null)}
            className="rounded-md px-1 py-0.5 hover:bg-muted"
          >
            Team
          </button>
        </div>
        <div className="flex flex-col gap-1 px-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2 rounded-md px-2 py-1.5">
            <Users className="size-3.5" />
            New team member
          </span>
          <span className="flex items-center gap-2 rounded-md px-2 py-1.5">
            <Users className="size-3.5" />
            New department
          </span>
        </div>
        <div className="mt-6 px-5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Departments
        </div>
        <nav className="mt-2 flex flex-col gap-0.5 px-3" aria-label="Departments">
          {departments.map((role) => {
            const count = members.filter((member) => member.role === role).length
            const Icon = role === "Designer" ? Palette : role === "Developer" ? Code2 : Megaphone
            const selected = department === role
            return (
              <button
                key={role}
                type="button"
                aria-pressed={selected}
                onClick={() => setDepartment(selected ? null : role)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                  selected ? "bg-muted text-foreground" : "text-foreground/80 hover:bg-muted/70",
                )}
              >
                <Icon className="size-3.5 text-muted-foreground" />
                <span className="flex-1 text-left">{role}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </button>
            )
          })}
        </nav>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4 text-muted-foreground" />
            {department ?? "All Members"}
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
              {rows.length}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              aria-pressed={timezoneMode}
              onClick={() => setTimezoneMode((value) => !value)}
              className="hidden h-8 rounded-full px-3 sm:inline-flex"
            >
              <Globe className="size-3.5" />
              Timezone Mode
            </Button>
            <label className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
                aria-label="Search members"
                className="h-8 w-40 rounded-lg border border-border bg-background pr-2 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 sm:w-52"
              />
            </label>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-[13px]">
            <caption className="sr-only">Team members</caption>
            <thead className="sticky top-0 z-10 bg-background">
              <tr className="text-xs text-muted-foreground">
                <SortHeader label="Name" sortKey="name" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Capacity" sortKey="capacity" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="px-3 py-3 font-medium">Discord ID</th>
                <th className="px-3 py-3 font-medium">Slack ID</th>
                <SortHeader label="Role" sortKey="role" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Status" sortKey="status" active={sortKey} dir={sortDir} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-sm text-muted-foreground">
                    No members match.
                  </td>
                </tr>
              ) : (
                rows.map((member) => {
                  const status: MemberStatus = pto[member.id] ? "PTO" : member.status
                  const selected = panel.open && panel.id === member.id
                  return (
                    <tr
                      key={member.id}
                      tabIndex={0}
                      aria-selected={selected}
                      onClick={() => panel.openItem(member.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          panel.openItem(member.id)
                        }
                      }}
                      className={cn(
                        "cursor-pointer border-b border-border outline-none hover:bg-muted/60 focus-visible:bg-muted",
                        selected && "bg-muted/80",
                      )}
                    >
                      <td className="border-b border-border px-3 py-3">
                        <span className="flex items-center gap-2.5">
                          <Avatar name={member.name} index={members.indexOf(member)} />
                          <span className="font-medium">{member.name}</span>
                        </span>
                      </td>
                      <td className="border-b border-border px-3 py-3">
                        <span className="flex items-center gap-2">
                          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <span
                              className={cn("block h-full rounded-full", capacityClass(member.capacity))}
                              style={{ width: `${member.capacity}%` }}
                            />
                          </span>
                          <span className="w-8 text-muted-foreground tabular-nums">{member.capacity}%</span>
                        </span>
                      </td>
                      <td className="border-b border-border px-3 py-3 text-muted-foreground">{member.discord}</td>
                      <td className="border-b border-border px-3 py-3 text-muted-foreground">{member.slackId}</td>
                      <td className="border-b border-border px-3 py-3">
                        <Badge className={cn("border-transparent", roleClass[member.role])}>{member.role}</Badge>
                      </td>
                      <td className="border-b border-border px-3 py-3">
                        <Badge className={cn("border-transparent", statusClass[status])}>{status}</Badge>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
      <LayeredPanel
        open={panel.open}
        onOpenChange={panel.onOpenChange}
        mode={panel.mode}
        onModeChange={panel.onModeChange}
        title={active ? active.name : "Team member"}
        description="Member capacity, tasks, and profile."
      >
        {active && activeStatus ? (
          <MemberDetail
            member={active}
            status={activeStatus}
            timezoneMode={timezoneMode}
            onTogglePto={() =>
              setPto((current) => ({ ...current, [active.id]: !current[active.id] }))
            }
          />
        ) : (
          <LayeredPanel.Peek>
            <p className="px-5 py-8 text-sm text-muted-foreground">
              This member is not in the sample roster.
            </p>
          </LayeredPanel.Peek>
        )}
      </LayeredPanel>
    </div>
  )
}

function MemberDetail({
  member,
  status,
  timezoneMode,
  onTogglePto,
}: {
  member: Member
  status: MemberStatus
  timezoneMode: boolean
  onTogglePto: () => void
}) {
  const time = useZonedTime(timezoneMode ? member.timezone : undefined)
  return (
    <>
      <LayeredPanel.Header>
        <div className="flex items-start gap-3">
          <Avatar name={member.name} index={members.indexOf(member)} className="size-10 text-xs" />
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">{member.name}</h2>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge className={cn("border-transparent", roleClass[member.role])}>{member.role}</Badge>
              <Badge className={cn("border-transparent", statusClass[status])}>{status}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span aria-hidden>{member.flag}</span>
            {member.country} / {member.city}
          </span>
          <time dateTime={time}>{time}</time>
        </div>
      </LayeredPanel.Header>
      <LayeredPanel.ExpandToggle
        expandLabel="View full profile"
        collapseLabel="Close profile"
      />
      <LayeredPanel.Peek>
        <div className="flex flex-col gap-5 px-5 pt-1 pb-8">
          <section className="rounded-xl bg-muted/70 px-4 py-3.5">
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              <Sparkles className="size-3.5" />
              AI insights
            </h3>
            <p className="text-sm leading-relaxed text-foreground/90">{member.insight}</p>
          </section>
          <section>
            <div className="mb-2 flex items-center justify-between text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              <span>Capacity</span>
              <span className="normal-case">{member.capacity}% used</span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              {member.segments.map((segment) => (
                <span
                  key={segment.id}
                  className={segmentClass[segment.tone]}
                  style={{ width: `${segment.value}%` }}
                />
              ))}
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {member.segments.map((segment) => (
                <li key={segment.id} className="flex items-center gap-1.5">
                  <span className={cn("size-1.5 rounded-full", segmentClass[segment.tone])} />
                  {segment.label}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Assigned tasks
            </h3>
            <ul>
              {member.tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </ul>
          </section>
        </div>
      </LayeredPanel.Peek>
      <LayeredPanel.Full>
        <DetailSection title="Personal information" icon={<User />}>
          <DetailField label="Full name" icon={<User />} value={member.name} />
          <DetailField label="Country" icon={<Globe />} value={member.country} />
          <DetailField label="Email" icon={<Mail />} value={member.email} href={`mailto:${member.email}`} />
          <DetailField label="Discord" icon={<AtSign />} value={member.discord} />
          <DetailField label="Discord ID" icon={<Hash />} value={member.discordId} />
          <DetailField label="Slack ID" icon={<Hash />} value={member.slackId} />
        </DetailSection>
        <DetailSection title="Time off" icon={<CalendarOff />}>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full active:scale-[0.96] motion-reduce:active:scale-100"
            onClick={onTogglePto}
          >
            {status === "PTO" ? "End PTO" : "Give PTO"}
          </Button>
        </DetailSection>
        <DetailSection title="Payment information" icon={<CreditCard />}>
          <DetailField label="Method" icon={<CreditCard />} value={member.payment.method} />
          <DetailField label="Account" icon={<Hash />} value={member.payment.account} />
          <DetailField label="Cadence" icon={<CalendarOff />} value={member.payment.cadence} />
          <DetailField label="Started" icon={<CalendarOff />} value={member.started} />
          <DetailField label="Manager" icon={<User />} value={member.manager} />
        </DetailSection>
      </LayeredPanel.Full>
    </>
  )
}

function TaskRow({ task }: { task: MemberTask }) {
  const Icon = task.source === "Slack" ? MessageSquare : task.source === "Zoom" ? Video : Music
  return (
    <li className="flex items-start gap-3 py-2">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{task.title}</span>
        <span className="text-xs text-muted-foreground">
          {task.source} · {task.when}
        </span>
      </span>
    </li>
  )
}

function Avatar({
  name,
  index,
  className,
}: {
  name: string
  index: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
        avatarClass[index % avatarClass.length],
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}

function SortHeader({
  label,
  sortKey,
  active,
  dir,
  onSort,
}: {
  label: string
  sortKey: SortKey
  active: SortKey
  dir: SortDir
  onSort: (key: SortKey) => void
}) {
  const selected = active === sortKey
  return (
    <th className="px-3 py-3 font-medium" aria-sort={selected ? (dir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        <ChevronsUpDown className={cn("size-3", selected && "text-foreground")} />
      </button>
    </th>
  )
}

function IconRail() {
  const pathname = usePathname()
  const items = [
    { href: "/examples/layered-panel/team", label: "Team", icon: Users },
    { href: "/examples/layered-panel/lead", label: "Pipeline", icon: Kanban },
    { href: "/docs", label: "Registry docs", icon: BookOpen, top: true },
  ]
  return (
    <div className="flex w-14 shrink-0 flex-col items-center border-r border-border py-3">
      <Link
        href="/"
        target="_top"
        className="mb-4 grid size-8 place-items-center rounded-lg bg-foreground text-xs font-semibold text-background"
        aria-label="Retana UI catalog"
      >
        R
      </Link>
      <nav className="flex flex-1 flex-col items-center gap-1" aria-label="Demo">
        {items.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              target={"top" in item && item.top ? "_top" : undefined}
              aria-label={item.label}
              title={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground",
                active && "bg-muted text-foreground",
              )}
            >
              <Icon className="size-4" />
            </Link>
          )
        })}
      </nav>
      <ThemeToggle />
    </div>
  )
}
