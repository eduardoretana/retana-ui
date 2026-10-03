"use client"

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { Calendar, Check, Circle, Flag, Sparkles, UserRound, Users, Banknote } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  AdaptiveTable,
  formatAdaptiveNumber,
  type AdaptiveColumn,
  type AdaptiveGroup,
} from "@/registry/ui/adaptive-table"

type Account = {
  id: string
  name: string
  amount: number
  date: string
  owner: string
  people: string[]
}

const accounts: Account[] = [
  { id: "pebble", name: "Pebble Co", amount: 1800, date: "2026-03-04", owner: "Elena", people: ["Elena", "Mateo"] },
  { id: "marlowe", name: "Marlowe Studio", amount: 640, date: "2026-04-18", owner: "Priya", people: ["Priya"] },
  { id: "kindred", name: "Kindred Supply", amount: 9200, date: "2026-05-02", owner: "Mateo", people: ["Mateo", "Elena", "Noor"] },
  { id: "lowland", name: "Lowland Press", amount: 410, date: "2026-05-21", owner: "Noor", people: ["Noor", "Priya"] },
  { id: "harbor", name: "Harbor Glass", amount: 2750, date: "2026-06-09", owner: "Elena", people: ["Elena"] },
  { id: "cinder", name: "Cinder Mail", amount: 150, date: "2026-06-28", owner: "Mateo", people: ["Mateo", "Noor"] },
  { id: "otter", name: "Otter Lane", amount: 3300, date: "2026-07-14", owner: "Priya", people: ["Priya", "Elena"] },
  { id: "fern", name: "Fern Kiln", amount: 870, date: "2026-08-03", owner: "Noor", people: ["Noor"] },
  { id: "sable", name: "Sable Route", amount: 12800, date: "2026-08-19", owner: "Elena", people: ["Elena", "Mateo"] },
  { id: "paper", name: "Paperfinch", amount: 540, date: "2026-09-07", owner: "Mateo", people: ["Mateo"] },
  { id: "redwood", name: "Redwood Desk", amount: 2100, date: "2026-09-22", owner: "Priya", people: ["Priya", "Noor"] },
]

function initials(name: string) {
  return name.slice(0, 1)
}

function columnsFor(locale: string): AdaptiveColumn<Account>[] {
  return [
    {
      id: "name",
      priority: 10,
      minWidth: 220,
      header: { icon: <UserRound />, label: "Account" },
      render: (row) => <span className="font-medium">{row.name}</span>,
      textValue: (row) => row.name,
    },
    {
      id: "amount",
      priority: 4,
      minWidth: 110,
      mergeInto: "name",
      align: "end",
      header: { icon: <Banknote />, label: "Amount" },
      render: (row) => formatAdaptiveNumber(row.amount, { locale, currency: "USD" }),
      compactRender: (row) => formatAdaptiveNumber(row.amount, { locale, currency: "USD", notation: "compact" }),
      textValue: (row) => formatAdaptiveNumber(row.amount, { locale, currency: "USD" }),
    },
    {
      id: "people",
      priority: 1,
      minWidth: 130,
      header: { icon: <Users />, label: "Participants" },
      render: (row) => (
        <span className="flex">
          {row.people.map((person) => (
            <Avatar key={person} size="sm" className="-ms-1.5 first:ms-0">
              <AvatarFallback>{initials(person)}</AvatarFallback>
            </Avatar>
          ))}
        </span>
      ),
      textValue: (row) => row.people.join(", "),
    },
    {
      id: "date",
      priority: 2,
      minWidth: 100,
      align: "end",
      header: { icon: <Calendar />, label: "Date" },
      render: (row) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(row.date)),
      textValue: (row) => row.date,
    },
    {
      id: "owner",
      priority: 3,
      minWidth: 88,
      align: "end",
      header: { icon: <UserRound />, label: "Owner" },
      render: (row) => (
        <span className="inline-flex items-center justify-end">
          <Avatar size="sm">
            <AvatarFallback>{initials(row.owner)}</AvatarFallback>
          </Avatar>
        </span>
      ),
      textValue: (row) => row.owner,
    },
  ]
}

const groups: AdaptiveGroup<Account>[] = [
  { id: "intro", label: "Intro", icon: <Circle />, rows: accounts.slice(0, 3) },
  { id: "scope", label: "Scoping", icon: <Sparkles />, rows: accounts.slice(3, 6) },
  { id: "talk", label: "Negotiation", icon: <Flag />, rows: accounts.slice(6, 9) },
  { id: "signed", label: "Signed", icon: <Check />, rows: accounts.slice(9) },
]

export function Demo() {
  const frameRef = useRef<HTMLDivElement>(null)
  const sizedByUser = useRef(false)
  const [width, setWidth] = useState(720)
  const [filtered, setFiltered] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const locale = "en"
  const columns = useMemo(() => columnsFor(locale), [])
  const visibleGroups = filtered ? groups.filter((group) => group.id !== "signed") : groups

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const observer = new ResizeObserver(() => {
      if (!sizedByUser.current) setWidth(Math.max(280, Math.round(frame.clientWidth)))
    })
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  function onDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const handle = event.currentTarget
    sizedByUser.current = true
    handle.setPointerCapture(event.pointerId)
    const startX = event.clientX
    const startWidth = width
    const move = (pointer: PointerEvent) => {
      setWidth(Math.min(1100, Math.max(280, startWidth + pointer.clientX - startX)))
    }
    const up = () => {
      handle.removeEventListener("pointermove", move)
      handle.removeEventListener("pointerup", up)
    }
    handle.addEventListener("pointermove", move)
    handle.addEventListener("pointerup", up)
  }

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-8">
      <div ref={frameRef} className="w-full max-w-full">
        <p className="mb-2 text-sm text-muted-foreground">Arrastra el borde. Ancho {width}px.</p>
        <div className="min-w-0 max-w-full overflow-x-auto contain-paint">
          <div className="relative" style={{ width }}>
            <AdaptiveTable
              title="Pipeline"
              locale={locale}
              columns={columns}
              groups={visibleGroups}
              getRowId={(row) => row.id}
              onRowClick={(row) => setPicked(row.name)}
              onFilter={() => setFiltered((value) => !value)}
              filterLabel="Filtrar"
              collapsibleGroups
            />
            <button
              type="button"
              aria-label="Cambiar ancho de la tabla"
              onPointerDown={onDrag}
              className="absolute inset-y-0 end-0 w-3 cursor-ew-resize rounded-full hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
        {picked ? <p className="mt-2 text-sm">Seleccionado: {picked}</p> : null}
      </div>
      <div className="flex w-full min-w-0 max-w-full flex-col gap-4">
        {[320, 480, 720, 1100].map((size) => (
          <div key={size} className="min-w-0 max-w-full overflow-x-auto contain-paint">
            <p className="mb-1 text-xs text-muted-foreground">{size}px</p>
            <div style={{ width: size }}>
              <AdaptiveTable title="Pipeline" locale={locale} columns={columns} groups={groups} getRowId={(row) => row.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
