import type {
  AdminPorts,
  AdminSeed,
  Booking,
  ContentPort,
  MediaAsset,
  MediaPort,
  SettingsPort,
} from "@/registry/retana/lib/admin-types"
import { createId } from "@/registry/retana/lib/slug"

type Row = { id: string }

function clone<T>(value: T): T {
  return structuredClone(value)
}

function collection<T extends Row & { position: number }>(
  rows: T[],
): ContentPort<T> & { snapshot: () => T[] } {
  let current = rows
  return {
    snapshot: () => current.slice(),
    async list() {
      return current.slice()
    },
    async save(row) {
      const index = current.findIndex((item) => item.id === row.id)
      if (index === -1) current = [...current, clone(row)]
      else {
        const next = current.slice()
        next[index] = clone(row)
        current = next
      }
      return clone(row)
    },
    async remove(id) {
      current = current.filter((item) => item.id !== id)
    },
    async reorder(ids) {
      const byId = new Map(current.map((item) => [item.id, item]))
      const next: T[] = []
      ids.forEach((id, position) => {
        const row = byId.get(id)
        if (!row) return
        next.push({ ...row, position } as T)
        byId.delete(id)
      })
      for (const row of byId.values()) {
        next.push({ ...row, position: next.length } as T)
      }
      current = next
    },
  }
}

function settingsPort(initial: Record<string, string>): SettingsPort & {
  snapshot: () => Record<string, string>
} {
  let current = { ...initial }
  return {
    snapshot: () => ({ ...current }),
    async getAll() {
      return { ...current }
    },
    async save(values) {
      current = { ...values }
    },
  }
}

function mediaPort(initial: MediaAsset[]): MediaPort & { snapshot: () => MediaAsset[] } {
  let current = initial.slice()
  return {
    snapshot: () => current.slice(),
    async list() {
      return current.slice()
    },
    async upload(file) {
      const url = URL.createObjectURL(file)
      const asset: MediaAsset = {
        id: createId(),
        filename: file.name,
        mime: file.type || "application/octet-stream",
        size: file.size,
        url,
        createdAt: new Date().toISOString(),
      }
      current = [asset, ...current]
      return asset
    },
    async remove(id) {
      const asset = current.find((item) => item.id === id)
      if (asset?.url.startsWith("blob:")) URL.revokeObjectURL(asset.url)
      current = current.filter((item) => item.id !== id)
    },
  }
}

function bookingsPort(initial: Booking[]): AdminPorts["bookings"] & { snapshot: () => Booking[] } {
  let current = initial.slice()
  return {
    snapshot: () => current.slice(),
    async list() {
      return current.slice()
    },
    async save(row) {
      const index = current.findIndex((item) => item.id === row.id)
      if (index === -1) current = [clone(row), ...current]
      else {
        const next = current.slice()
        next[index] = clone(row)
        current = next
      }
      return clone(row)
    },
    async remove(id) {
      current = current.filter((item) => item.id !== id)
    },
    async removeMany(ids) {
      const drop = new Set(ids)
      current = current.filter((item) => !drop.has(item.id))
    },
  }
}

export type MemoryAdmin = AdminPorts & {
  read: () => AdminSeed
}

/** In-browser store. Nothing is written outside the page. */
export function createMemoryAdmin(seed: AdminSeed): MemoryAdmin {
  const settings = settingsPort(seed.settings)
  const categories = collection(clone(seed.categories))
  const projects = collection(clone(seed.projects))
  const clients = collection(clone(seed.clients))
  const photos = collection(clone(seed.photos))
  const testimonials = collection(clone(seed.testimonials))
  const faqs = collection(clone(seed.faqs))
  const plans = collection(clone(seed.plans))
  const experience = collection(clone(seed.experience))
  const awards = collection(clone(seed.awards))
  const stats = collection(clone(seed.stats))
  const media = mediaPort(clone(seed.media))
  const bookings = bookingsPort(clone(seed.bookings))

  return {
    settings,
    categories,
    projects,
    clients,
    photos,
    testimonials,
    faqs,
    plans,
    experience,
    awards,
    stats,
    media,
    bookings,
    read: () => ({
      asOf: seed.asOf,
      settings: settings.snapshot(),
      categories: categories.snapshot(),
      projects: projects.snapshot(),
      clients: clients.snapshot(),
      photos: photos.snapshot(),
      testimonials: testimonials.snapshot(),
      faqs: faqs.snapshot(),
      plans: plans.snapshot(),
      experience: experience.snapshot(),
      awards: awards.snapshot(),
      stats: stats.snapshot(),
      media: media.snapshot(),
      bookings: bookings.snapshot(),
      views: seed.views,
      clicks: seed.clicks,
    }),
  }
}
