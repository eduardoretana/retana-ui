import type { StatusTone } from "@/registry/retana/lib/status-tone"

export type CapacitySlot = {
  id: string
  label: string
  status: string
  /** Short fact for the accessible name and the default popover, such as the occupant. */
  detail?: string
}

export type CapacityGroup = {
  id: string
  label: string
  slots: readonly CapacitySlot[]
  columns?: number
}

export type CapacityZone = {
  id: string
  label: string
  /** Defaults to the number of slots. */
  capacity?: number
  groups: readonly CapacityGroup[]
}

export type SlotStatusDef = {
  id: string
  label: string
  tone: StatusTone
  /** Counts toward the free side of the capacity bar. */
  available?: boolean
  /** Can be taken by a demand preview. Defaults to `available`. */
  fillable?: boolean
}

export type CapacityLocale = "es-MX" | "es" | "en"

export type ZoneStats = {
  total: number
  capacity: number
  available: number
  occupied: number
  special: number
  exceeded: number
  fillable: number
}

export type ZoneSimulation = {
  from: number
  to: number
  capacity: number
  filled: number
  overflow: number
}

export type DemandSimulation = {
  filledIds: string[]
  overflow: number
  byZone: Record<string, ZoneSimulation>
}

export type CapacityMapLabels = {
  available: (available: number, capacity: number) => string
  simulate: string
  demand: string
  discard: string
  overflow: (count: number) => string
  loading: string
  empty: string
  retry: string
  zones: string
  preview: string
  close: string
  table: string
  person: string
  slot: string
  status: string
}

const builtIn = (locale: CapacityLocale): SlotStatusDef[] =>
  locale === "en"
    ? [
        { id: "free", label: "Free", tone: "neutral", available: true, fillable: true },
        { id: "occupied", label: "Occupied", tone: "accent", available: false, fillable: false },
        { id: "special", label: "Special", tone: "info", available: false, fillable: false },
        { id: "exceeded", label: "Exceeded", tone: "critical", available: false, fillable: false },
      ]
    : [
        { id: "free", label: "Libre", tone: "neutral", available: true, fillable: true },
        { id: "occupied", label: "Ocupado", tone: "accent", available: false, fillable: false },
        { id: "special", label: "Especial", tone: "info", available: false, fillable: false },
        { id: "exceeded", label: "Excedido", tone: "critical", available: false, fillable: false },
      ]

export function defaultStatuses(locale: CapacityLocale = "es-MX"): SlotStatusDef[] {
  return builtIn(locale)
}

export function resolveStatuses(extra: readonly SlotStatusDef[] | undefined, locale: CapacityLocale = "es-MX"): SlotStatusDef[] {
  const base = builtIn(locale)
  if (!extra?.length) return base
  const byId = new Map(base.map((item) => [item.id, item]))
  for (const item of extra) byId.set(item.id, { ...byId.get(item.id), ...item })
  return [...byId.values()]
}

export function statusOf(statuses: readonly SlotStatusDef[], id: string): SlotStatusDef {
  return (
    statuses.find((item) => item.id === id) ?? {
      id,
      label: id,
      tone: "neutral",
      available: false,
      fillable: false,
    }
  )
}

export function isAvailable(def: SlotStatusDef) {
  return def.available === true
}

export function isFillable(def: SlotStatusDef) {
  return def.fillable ?? def.available === true
}

export function slotsOf(zones: readonly CapacityZone[]): CapacitySlot[] {
  return zones.flatMap((zone) => zone.groups.flatMap((group) => [...group.slots]))
}

export function slotsInZone(zone: CapacityZone): CapacitySlot[] {
  return zone.groups.flatMap((group) => [...group.slots])
}

function counts(slots: readonly CapacitySlot[], statuses: readonly SlotStatusDef[], filledIds?: ReadonlySet<string>) {
  let available = 0
  let occupied = 0
  let special = 0
  let exceeded = 0
  let fillable = 0
  for (const slot of slots) {
    const real = statusOf(statuses, slot.status)
    if (isFillable(real)) fillable += 1
    const shown = filledIds?.has(slot.id) ? statusOf(statuses, "occupied") : real
    if (isAvailable(shown)) available += 1
    else if (shown.id === "special") special += 1
    else if (shown.id === "exceeded") exceeded += 1
    else occupied += 1
  }
  return { available, occupied, special, exceeded, fillable, total: slots.length }
}

export function zoneStats(zone: CapacityZone, statuses: readonly SlotStatusDef[], filledIds?: ReadonlySet<string>): ZoneStats {
  const slots = slotsInZone(zone)
  const counted = counts(slots, statuses, filledIds)
  return { ...counted, capacity: zone.capacity ?? counted.total }
}

export function availableCount(zone: CapacityZone, statuses: readonly SlotStatusDef[], filledIds?: ReadonlySet<string>) {
  return zoneStats(zone, statuses, filledIds).available
}

export function aisleRows(slots: readonly CapacitySlot[], columns?: number) {
  const cols = Math.max(1, columns ?? (Math.ceil(slots.length / 2) || 1))
  return {
    columns: cols,
    top: slots.slice(0, cols),
    bottom: slots.slice(cols),
  }
}

export function simulateDemand(zones: readonly CapacityZone[], demand: number, statuses: readonly SlotStatusDef[]): DemandSimulation {
  const extra = Math.max(0, Math.floor(Number.isFinite(demand) ? demand : 0))
  const filledIds: string[] = []
  const byZone: Record<string, ZoneSimulation> = {}
  let remaining = extra
  for (const zone of zones) {
    const stats = zoneStats(zone, statuses)
    let filled = 0
    if (remaining > 0) {
      for (const group of zone.groups) {
        for (const slot of group.slots) {
          if (remaining <= 0) break
          if (!isFillable(statusOf(statuses, slot.status))) continue
          filledIds.push(slot.id)
          filled += 1
          remaining -= 1
        }
      }
    }
    const overflowHere = 0
    byZone[zone.id] = {
      from: stats.available,
      to: stats.available - filled,
      capacity: stats.capacity,
      filled,
      overflow: overflowHere,
    }
  }
  return { filledIds, overflow: remaining, byZone }
}

export function slotAccessibleName(slot: CapacitySlot, statuses: readonly SlotStatusDef[], extra?: string, preview = false, labels?: Pick<CapacityMapLabels, "preview">) {
  const parts = [slot.label, statusOf(statuses, slot.status).label]
  if (preview) parts.push(labels?.preview ?? "previsión")
  if (extra ?? slot.detail) parts.push((extra ?? slot.detail) as string)
  return parts.filter(Boolean).join(", ")
}

export const capacityMapLabelsEs: CapacityMapLabels = {
  available: (available, capacity) => `${available} de ${capacity} disponibles`,
  simulate: "Simular demanda",
  demand: "Demanda extra",
  discard: "Descartar",
  overflow: (count) => `${count} se quedarían fuera`,
  loading: "Cargando el mapa",
  empty: "No hay cupos que mostrar.",
  retry: "Reintentar",
  zones: "Zonas",
  preview: "previsión",
  close: "Cerrar",
  table: "Sesiones",
  person: "Persona",
  slot: "Cupo",
  status: "Estado",
}

export const capacityMapLabelsEn: CapacityMapLabels = {
  available: (available, capacity) => `${available} of ${capacity} available`,
  simulate: "Simulate demand",
  demand: "Extra demand",
  discard: "Discard",
  overflow: (count) => `${count} would be left out`,
  loading: "Loading the map",
  empty: "There are no slots to show.",
  retry: "Retry",
  zones: "Zones",
  preview: "preview",
  close: "Close",
  table: "Sessions",
  person: "Person",
  slot: "Slot",
  status: "Status",
}

export function resolveCapacityMapLabels(locale: CapacityLocale = "es-MX", labels?: Partial<CapacityMapLabels>): CapacityMapLabels {
  return { ...(locale === "en" ? capacityMapLabelsEn : capacityMapLabelsEs), ...labels }
}

export type CapacityRow = {
  id: string
  slotId: string
  title: string
  slotLabel: string
  status: string
}

export function rowsFromZones(zones: readonly CapacityZone[]): CapacityRow[] {
  const rows: CapacityRow[] = []
  for (const zone of zones) {
    for (const group of zone.groups) {
      for (const slot of group.slots) {
        if (slot.status === "free" || slot.status === "special" || slot.status === "held") continue
        rows.push({
          id: slot.id,
          slotId: slot.id,
          title: slot.detail ?? slot.label,
          slotLabel: slot.label,
          status: slot.status,
        })
      }
    }
  }
  return rows
}
