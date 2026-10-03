import type { FieldDef, MultiRecord, ViewConfig } from "@/registry/lib/multi-view"

export const opportunityFields: FieldDef[] = [
  { id: "name", label: "Name", type: "text", icon: "text", section: "Deal" },
  { id: "company", label: "Company", type: "relation", icon: "building", section: "Relations" },
  { id: "amount", label: "Amount", type: "currency", icon: "currency", currency: "USD", section: "Deal" },
  {
    id: "stage",
    label: "Stage",
    type: "status",
    icon: "status",
    section: "Deal",
    options: [
      { value: "new", label: "New", tone: 1 },
      { value: "qualified", label: "Qualified", tone: 2 },
      { value: "proposal", label: "Proposal", tone: 3 },
      { value: "won", label: "Won", tone: 4 },
      { value: "lost", label: "Lost", tone: 5 },
    ],
  },
  { id: "owner", label: "Owner", type: "person", icon: "user", section: "Relations" },
  { id: "close", label: "Close", type: "date", icon: "calendar", section: "Deal" },
  { id: "created", label: "Created", type: "date", icon: "calendar", section: "System", readOnly: true },
]

export const opportunityViews: ViewConfig[] = [
  { id: "table", kind: "table", label: "Table", titleField: "name", columns: ["name", "company", "amount", "stage", "owner", "close"] },
  { id: "board", kind: "kanban", label: "Board", titleField: "name", groupField: "stage", sumField: "amount", cardFields: ["company", "amount", "owner"] },
  { id: "calendar", kind: "calendar", label: "Calendar", titleField: "name", dateField: "close" },
]

export const opportunities: MultiRecord[] = [
  { id: "op-bruma", name: "Bruma lighting retrofit", company: { name: "Bruma Studio" }, amount: 42000, stage: "proposal", owner: { name: "Inés Valdés" }, close: "2026-04-16", created: "2026-01-08" },
  { id: "op-nube", name: "Nube lenta retainer", company: { name: "Nube Lenta" }, amount: 18000, stage: "qualified", owner: { name: "Mateo Rueda" }, close: "2026-04-02", created: "2026-02-11" },
  { id: "op-orbita", name: "Órbita wayfinding", company: { name: "Taller Órbita" }, amount: 76000, stage: "new", owner: { name: "Clara Ibáñez" }, close: "2026-05-20", created: "2026-03-01" },
  { id: "op-puerto", name: "Puerto claro kiosk", company: { name: "Puerto Claro" }, amount: 125000, stage: "won", owner: { name: "Hugo Paredes" }, close: "2026-03-28", created: "2025-11-19" },
  { id: "op-mesa", name: "Mesa norte catalog", company: { name: "Mesa Norte" }, amount: 9400, stage: "lost", owner: { name: "Noa Ferrer" }, close: "2026-03-12", created: "2026-01-22" },
  { id: "op-faro", name: "Faro íntimo residency", company: { name: "Faro Íntimo" }, amount: 31000, stage: "proposal", owner: { name: "Inés Valdés" }, close: "2026-04-16", created: "2026-02-02" },
  { id: "op-calle", name: "Calle once signage", company: { name: "Calle Once" }, amount: 54000, stage: "qualified", owner: { name: "Mateo Rueda" }, close: "2026-06-04", created: "2026-03-18" },
  { id: "op-lumen", name: "Lumen río pavilion", company: { name: "Lumen Río" }, amount: 210000, stage: "new", owner: { name: "Clara Ibáñez" }, close: "2026-07-01", created: "2026-03-20" },
]

export const projectFields: FieldDef[] = [
  { id: "name", label: "Name", type: "text", icon: "text", section: "Project" },
  { id: "summary", label: "Summary", type: "text", icon: "text", section: "Project" },
  {
    id: "team",
    label: "Team",
    type: "select",
    icon: "tag",
    section: "Project",
    options: [
      { value: "field", label: "Field", tone: 1 },
      { value: "studio", label: "Studio", tone: 2 },
      { value: "archive", label: "Archive", tone: 3 },
    ],
  },
  {
    id: "health",
    label: "Health",
    type: "status",
    icon: "status",
    section: "Project",
    options: [
      { value: "on-track", label: "On track", tone: 4 },
      { value: "watch", label: "Watch", tone: 3 },
      { value: "blocked", label: "Blocked", tone: 5 },
    ],
  },
  {
    id: "priority",
    label: "Priority",
    type: "select",
    icon: "flag",
    section: "Project",
    options: [
      { value: "low", label: "Low", tone: 1 },
      { value: "mid", label: "Mid", tone: 2 },
      { value: "high", label: "High", tone: 5 },
    ],
  },
  { id: "lead", label: "Lead", type: "person", icon: "user", section: "Relations" },
  { id: "start", label: "Start", type: "date", icon: "calendar", section: "Schedule" },
  { id: "end", label: "Target", type: "date", icon: "calendar", section: "Schedule" },
  { id: "progress", label: "Progress", type: "progress", icon: "progress", section: "Project" },
  { id: "tasks", label: "Tasks", type: "number", icon: "hash", section: "Project" },
]

export const projectViews: ViewConfig[] = [
  {
    id: "list",
    kind: "grouped-list",
    label: "List",
    titleField: "name",
    subtitleField: "summary",
    groupField: "team",
    cardFields: ["health", "priority", "lead", "end", "tasks", "progress"],
  },
  { id: "board", kind: "kanban", label: "Board", titleField: "name", groupField: "health", cardFields: ["team", "lead", "progress"] },
  { id: "timeline", kind: "timeline", label: "Timeline", titleField: "name", groupField: "team", startField: "start", endField: "end" },
]

export const projects: MultiRecord[] = [
  { id: "pr-patio", name: "Patio de los naranjos", summary: "Shade study and seating", team: "field", health: "on-track", priority: "mid", lead: { name: "Inés Valdés" }, start: "2026-04-01", end: "2026-05-15", progress: 46, tasks: 12 },
  { id: "pr-atlas", name: "Atlas de oficios", summary: "Interview series", team: "studio", health: "watch", priority: "high", lead: { name: "Mateo Rueda" }, start: "2026-03-20", end: "2026-06-30", progress: 22, tasks: 8 },
  { id: "pr-muelle", name: "Muelle quieto", summary: "Night lighting test", team: "field", health: "blocked", priority: "high", lead: { name: "Hugo Paredes" }, start: "2026-04-10", end: "2026-04-28", progress: 10, tasks: 4 },
  { id: "pr-caja", name: "Caja de herramientas", summary: "Internal kit", team: "archive", health: "on-track", priority: "low", lead: { name: "Noa Ferrer" }, start: "2026-02-02", end: "2026-04-18", progress: 80, tasks: 15 },
  { id: "pr-rio", name: "Río de cartas", summary: "Print run", team: "studio", health: "on-track", priority: "mid", lead: { name: "Clara Ibáñez" }, start: "2026-05-01", end: "2026-07-12", progress: 5, tasks: 6 },
]

export const promotionFields: FieldDef[] = [
  { id: "name", label: "Name", type: "text", icon: "text", section: "Promotion" },
  { id: "blurb", label: "Description", type: "text", icon: "text", section: "Promotion" },
  {
    id: "channel",
    label: "Channel",
    type: "select",
    icon: "tag",
    section: "Promotion",
    options: [
      { value: "shop", label: "Shop", tone: 1 },
      { value: "mail", label: "Mail", tone: 2 },
      { value: "event", label: "Event", tone: 3 },
    ],
  },
  {
    id: "state",
    label: "Status",
    type: "status",
    icon: "status",
    section: "Promotion",
    options: [
      { value: "draft", label: "Draft", tone: 1 },
      { value: "live", label: "Live", tone: 4 },
      { value: "ended", label: "Ended", tone: 5 },
    ],
  },
  { id: "discount", label: "Headline", type: "text", icon: "currency", section: "Promotion" },
  { id: "cover", label: "Cover", type: "image", icon: "image", section: "Promotion" },
  { id: "starts", label: "Starts", type: "date", icon: "calendar", section: "Promotion" },
]

export const promotionViews: ViewConfig[] = [
  { id: "table", kind: "table", label: "Table", titleField: "name", columns: ["name", "channel", "state", "discount", "starts"] },
  { id: "gallery", kind: "gallery", label: "Gallery", titleField: "name", coverField: "cover", chipField: "channel", headlineField: "discount" },
]

export const promotions: MultiRecord[] = [
  { id: "pm-sunday", name: "Market Sunday", blurb: "A morning stall for sample tiles.", channel: "event", state: "live", discount: "Two for the set", cover: "placeholder:market", starts: "2026-04-05" },
  { id: "pm-letter", name: "Letter from the kiln", blurb: "A short note with a making-of.", channel: "mail", state: "draft", discount: "Early look", cover: "placeholder:letter", starts: "2026-04-18" },
  { id: "pm-shelf", name: "Shelf refresh", blurb: "New glaze line on the shop wall.", channel: "shop", state: "live", discount: "First week marked", cover: "placeholder:shelf", starts: "2026-03-30" },
  { id: "pm-rain", name: "Rain check", blurb: "Postponed courtyard tasting.", channel: "event", state: "ended", discount: "Moved indoors", cover: "placeholder:rain", starts: "2026-02-14" },
]

export type CollectionId = "opportunities" | "projects" | "promotions"

export const collections = {
  opportunities: {
    id: "opportunities" as const,
    title: "Opportunities",
    fields: opportunityFields,
    views: opportunityViews,
    records: opportunities,
  },
  projects: {
    id: "projects" as const,
    title: "Projects",
    fields: projectFields,
    views: projectViews,
    records: projects,
  },
  promotions: {
    id: "promotions" as const,
    title: "Promotions",
    fields: promotionFields,
    views: promotionViews,
    records: promotions,
  },
}

const LONG_TITLE = "A".repeat(60)

export function withEdges(records: MultiRecord[], kind: CollectionId): MultiRecord[] {
  if (kind === "opportunities") {
    return [
      ...records,
      { id: "op-long", name: LONG_TITLE, company: { name: "Caja Larga" }, amount: 42000, stage: "new", owner: { name: "Noa Ferrer" }, close: "2026-04-09", created: "2026-04-01" },
      { id: "op-emoji", name: "🌅 Dawn shift", company: { name: "Faro Íntimo" }, amount: 8000, stage: "qualified", owner: { name: "Inés Valdés" }, close: "2026-04-11", created: "2026-04-01" },
      { id: "op-rtl", name: "مشروع النور", company: { name: "Nur" }, amount: 15000, stage: "proposal", owner: { name: "Clara Ibáñez" }, close: "2026-04-21", created: "2026-04-01" },
      { id: "op-missing", name: "Untitled follow-up", company: { name: "Mesa Norte" }, amount: 1000, stage: "new", created: "2026-04-01" },
    ]
  }
  if (kind === "projects") {
    return [
      ...records,
      { id: "pr-long", name: LONG_TITLE, summary: "Edge title", team: "studio", health: "watch", priority: "low", lead: { name: "Noa Ferrer" }, start: "2026-04-01", end: "2026-04-20", progress: 12, tasks: 1 },
      { id: "pr-emoji", name: "🧵 Hilo suelto", summary: "Emoji title", team: "field", health: "on-track", priority: "mid", lead: { name: "Mateo Rueda" }, start: "2026-04-06", end: "2026-04-19", progress: 30, tasks: 2 },
      { id: "pr-rtl", name: "ورشة الضوء", summary: "RTL title", team: "archive", health: "blocked", priority: "high", start: "2026-04-08", end: "2026-05-02", progress: 0, tasks: 0 },
      { id: "pr-missing", name: "Loose notes", summary: "No lead or dates", team: "studio", health: "watch", priority: "low", progress: 0, tasks: 0 },
    ]
  }
  return [
    ...records,
    { id: "pm-long", name: LONG_TITLE, blurb: "Edge title", channel: "shop", state: "draft", discount: "Plain", cover: "placeholder:long", starts: "2026-04-12" },
    { id: "pm-emoji", name: "🍋 Citrus hour", blurb: "Emoji title", channel: "event", state: "live", discount: "Sample", cover: "placeholder:citrus", starts: "2026-04-08" },
    { id: "pm-rtl", name: "عرض المساء", blurb: "RTL title", channel: "mail", state: "draft", discount: "Note", cover: "placeholder:rtl", starts: "2026-04-15" },
    { id: "pm-missing", name: "Bare card", blurb: "No cover or date", channel: "shop", state: "draft", discount: "—" },
  ]
}

export function scaleRecords(kind: CollectionId, scale: "0" | "1" | "real" | "10x" | "200"): MultiRecord[] {
  const base = withEdges(collections[kind].records, kind)
  if (scale === "0") return []
  if (scale === "1") return base.slice(0, 1)
  if (scale === "real") return base
  if (scale === "10x") {
    return Array.from({ length: 10 }, (_, copy) =>
      base.map((record) => ({ ...record, id: `${record.id}-x${copy}` })),
    ).flat()
  }
  const template = base[0]
  if (!template) return []
  return Array.from({ length: 200 }, (_, index) => ({
    ...template,
    id: `${kind}-${index}`,
    name: index === 0 ? LONG_TITLE : `${template.name} ${index + 1}`,
  }))
}
