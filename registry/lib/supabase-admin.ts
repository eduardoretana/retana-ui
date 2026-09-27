import type { SupabaseClient } from "@supabase/supabase-js"

import type {
  Booking,
  Category,
  ClientLogo,
  ContentPort,
  Experience,
  Faq,
  MediaAsset,
  MediaPort,
  Photo,
  Plan,
  Project,
  SettingsPort,
  Testimonial,
} from "@/registry/retana/lib/admin-types"

/**
 * Host-owned Supabase client. This module never constructs one.
 * Column names match registry/lib/supabase/001_admin_content.sql.
 */

type Row = Record<string, unknown>

export type AdminSupabase = SupabaseClient

function asRows(data: unknown): Row[] {
  if (!Array.isArray(data)) return []
  return data.filter((row): row is Row => typeof row === "object" && row !== null)
}

function asRow(data: unknown): Row {
  if (typeof data === "object" && data !== null && !Array.isArray(data)) return data as Row
  throw new Error("Expected a row")
}

function str(row: Row, key: string): string {
  const value = row[key]
  return typeof value === "string" ? value : value == null ? "" : String(value)
}

function num(row: Row, key: string): number {
  const value = row[key]
  return typeof value === "number" ? value : Number(value ?? 0) || 0
}

function bool(row: Row, key: string): boolean {
  const value = row[key]
  return value === true || value === 1 || value === "true"
}

function nullableNum(row: Row, key: string): number | null {
  const value = row[key]
  if (value == null || value === "") return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

async function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

function contentPort<T extends { id: string; position: number }>(
  client: AdminSupabase,
  table: string,
  fromRow: (row: Row) => T,
  toRow: (row: T) => Row,
): ContentPort<T> {
  return {
    async list() {
      const { data, error } = await client.from(table).select("*").order("position", { ascending: true })
      await throwIf(error)
      return asRows(data).map(fromRow)
    },
    async save(row) {
      const { data, error } = await client.from(table).upsert(toRow(row)).select("*").single()
      await throwIf(error)
      return fromRow(asRow(data))
    },
    async remove(id) {
      const { error } = await client.from(table).delete().eq("id", id)
      await throwIf(error)
    },
    async reorder(ids) {
      const results = await Promise.all(
        ids.map((id, position) => client.from(table).update({ position }).eq("id", id)),
      )
      for (const result of results) await throwIf(result.error)
    },
  }
}

function categoryFrom(row: Row): Category {
  return {
    id: str(row, "id"),
    title: str(row, "title"),
    slug: str(row, "slug"),
    position: num(row, "position"),
    published: bool(row, "published"),
  }
}

function projectFrom(row: Row): Project {
  return {
    id: str(row, "id"),
    title: str(row, "title"),
    slug: str(row, "slug"),
    categoryId: str(row, "category_id") || null,
    summary: str(row, "summary"),
    client: str(row, "client"),
    year: str(row, "year"),
    liveUrl: str(row, "live_url"),
    coverUrl: str(row, "cover_url") || null,
    showOnHomepage: bool(row, "show_on_homepage"),
    published: bool(row, "published"),
    position: num(row, "position"),
  }
}

function projectTo(row: Project): Row {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category_id: row.categoryId,
    summary: row.summary,
    client: row.client,
    year: row.year,
    live_url: row.liveUrl,
    cover_url: row.coverUrl,
    show_on_homepage: row.showOnHomepage,
    published: row.published,
    position: row.position,
  }
}

export function createSupabaseSettings(client: AdminSupabase): SettingsPort {
  return {
    async getAll() {
      const { data, error } = await client.from("settings").select("key,value")
      await throwIf(error)
      const values: Record<string, string> = {}
      for (const row of asRows(data)) values[str(row, "key")] = str(row, "value")
      return values
    },
    async save(values) {
      const payload = Object.entries(values).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }))
      const { error } = await client.from("settings").upsert(payload)
      await throwIf(error)
    },
  }
}

export function createSupabaseMedia(client: AdminSupabase, bucket = "media"): MediaPort {
  return {
    async list() {
      const { data, error } = await client.from("media").select("*").order("created_at", { ascending: false })
      await throwIf(error)
      return asRows(data).map(mediaFrom)
    },
    async upload(file) {
      const id = crypto.randomUUID()
      const path = `${id}-${file.name}`
      const uploaded = await client.storage.from(bucket).upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      })
      await throwIf(uploaded.error)
      const url = client.storage.from(bucket).getPublicUrl(path).data.publicUrl
      const row = {
        id,
        filename: file.name,
        mime: file.type || "application/octet-stream",
        size: file.size,
        url,
        storage_path: path,
        created_at: new Date().toISOString(),
      }
      const inserted = await client.from("media").insert(row).select("*").single()
      await throwIf(inserted.error)
      return mediaFrom(asRow(inserted.data))
    },
    async remove(id) {
      const { data, error } = await client.from("media").select("storage_path").eq("id", id).maybeSingle()
      await throwIf(error)
      const path = data ? str(asRow(data), "storage_path") : ""
      if (path) await throwIf((await client.storage.from(bucket).remove([path])).error)
      await throwIf((await client.from("media").delete().eq("id", id)).error)
    },
  }
}

function mediaFrom(row: Row): MediaAsset {
  return {
    id: str(row, "id"),
    filename: str(row, "filename"),
    mime: str(row, "mime"),
    size: num(row, "size"),
    url: str(row, "url"),
    width: nullableNum(row, "width"),
    height: nullableNum(row, "height"),
    createdAt: str(row, "created_at"),
  }
}

function bookingFrom(row: Row): Booking {
  return {
    id: str(row, "id"),
    name: str(row, "name"),
    email: str(row, "email"),
    phone: str(row, "phone"),
    needs: str(row, "needs"),
    plan: str(row, "plan"),
    note: str(row, "note"),
    source: str(row, "source"),
    cameFrom: str(row, "came_from"),
    status: str(row, "status") === "cancelled" ? "cancelled" : "booked",
    startTime: nullableNum(row, "start_time"),
    endTime: nullableNum(row, "end_time"),
    timezone: str(row, "timezone"),
    meetUrl: str(row, "meet_url"),
    createdAt: num(row, "created_at"),
  }
}

function planFrom(row: Row): Plan {
  return {
    id: str(row, "id"),
    name: str(row, "name"),
    blurb: str(row, "blurb"),
    monthlyPrice: nullableNum(row, "monthly_price"),
    badge: str(row, "badge"),
    ctaLabel: str(row, "cta_label"),
    ctaHref: str(row, "cta_href"),
    features: [],
    position: num(row, "position"),
    published: bool(row, "published"),
  }
}

async function loadPlanFeatures(client: AdminSupabase, plans: Plan[]): Promise<Plan[]> {
  const { data, error } = await client.from("plan_features").select("*").order("position", { ascending: true })
  await throwIf(error)
  const grouped = new Map<string, string[]>()
  for (const row of asRows(data)) {
    const planId = str(row, "plan_id")
    const list = grouped.get(planId) ?? []
    list.push(str(row, "text"))
    grouped.set(planId, list)
  }
  return plans.map((plan) => ({ ...plan, features: grouped.get(plan.id) ?? plan.features }))
}

async function replacePlanFeatures(client: AdminSupabase, planId: string, features: readonly string[]) {
  await throwIf((await client.from("plan_features").delete().eq("plan_id", planId)).error)
  if (features.length === 0) return
  const payload = features.map((text, position) => ({
    id: `${planId}:${position}`,
    plan_id: planId,
    text,
    position,
  }))
  await throwIf((await client.from("plan_features").insert(payload)).error)
}

function plansPort(client: AdminSupabase): ContentPort<Plan> {
  const base = contentPort<Plan>(
    client,
    "plans",
    planFrom,
    (row) => ({
      id: row.id,
      name: row.name,
      blurb: row.blurb,
      monthly_price: row.monthlyPrice,
      badge: row.badge,
      cta_label: row.ctaLabel,
      cta_href: row.ctaHref,
      position: row.position,
      published: row.published,
    }),
  )
  return {
    async list() {
      return loadPlanFeatures(client, await base.list())
    },
    async save(row) {
      const saved = await base.save(row)
      await replacePlanFeatures(client, saved.id, row.features)
      return { ...saved, features: [...row.features] }
    },
    remove: (id) => base.remove(id),
    reorder: (ids) => base.reorder(ids),
  }
}

export function createSupabaseAdmin(client: AdminSupabase, bucket = "media") {
  return {
    settings: createSupabaseSettings(client),
    categories: contentPort(client, "categories", categoryFrom, (row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      position: row.position,
      published: row.published,
    })),
    projects: contentPort(client, "projects", projectFrom, projectTo),
    clients: contentPort<ClientLogo>(client, "clients", (row) => ({
      id: str(row, "id"),
      name: str(row, "name"),
      logoUrl: str(row, "logo_url") || null,
      rowIndex: num(row, "row_index"),
      position: num(row, "position"),
      published: bool(row, "published"),
    }), (row) => ({
      id: row.id,
      name: row.name,
      logo_url: row.logoUrl,
      row_index: row.rowIndex,
      position: row.position,
      published: row.published,
    })),
    photos: contentPort<Photo>(client, "photos", (row) => ({
      id: str(row, "id"),
      src: str(row, "src"),
      alt: str(row, "alt"),
      showOnHomepage: bool(row, "show_on_homepage"),
      position: num(row, "position"),
      published: bool(row, "published"),
    }), (row) => ({
      id: row.id,
      src: row.src,
      alt: row.alt,
      show_on_homepage: row.showOnHomepage,
      position: row.position,
      published: row.published,
    })),
    testimonials: contentPort<Testimonial>(client, "testimonials", (row) => ({
      id: str(row, "id"),
      quote: str(row, "quote"),
      name: str(row, "name"),
      role: str(row, "role"),
      avatarUrl: str(row, "avatar_url") || null,
      position: num(row, "position"),
      published: bool(row, "published"),
    }), (row) => ({
      id: row.id,
      quote: row.quote,
      name: row.name,
      role: row.role,
      avatar_url: row.avatarUrl,
      position: row.position,
      published: row.published,
    })),
    faqs: contentPort<Faq>(client, "faqs", (row) => ({
      id: str(row, "id"),
      question: str(row, "question"),
      answer: str(row, "answer"),
      position: num(row, "position"),
      published: bool(row, "published"),
    }), (row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      position: row.position,
      published: row.published,
    })),
    plans: plansPort(client),
    experience: contentPort<Experience>(client, "experience", (row) => ({
      id: str(row, "id"),
      role: str(row, "role"),
      company: str(row, "company"),
      period: str(row, "period"),
      position: num(row, "position"),
      published: bool(row, "published"),
    }), (row) => ({
      id: row.id,
      role: row.role,
      company: row.company,
      period: row.period,
      position: row.position,
      published: row.published,
    })),
    awards: contentPort(client, "awards", (row) => ({
      id: str(row, "id"),
      name: str(row, "name"),
      count: str(row, "count"),
      href: str(row, "href"),
      position: num(row, "position"),
      published: bool(row, "published"),
    }), (row) => ({
      id: row.id,
      name: row.name,
      count: row.count,
      href: row.href,
      position: row.position,
      published: row.published,
    })),
    stats: contentPort(client, "about_stats", (row) => ({
      id: str(row, "id"),
      value: str(row, "value"),
      label: str(row, "label"),
      position: num(row, "position"),
      published: bool(row, "published"),
    }), (row) => ({
      id: row.id,
      value: row.value,
      label: row.label,
      position: row.position,
      published: row.published,
    })),
    media: createSupabaseMedia(client, bucket),
    bookings: {
      async list() {
        const { data, error } = await client.from("bookings").select("*").order("created_at", { ascending: false })
        await throwIf(error)
        return asRows(data).map(bookingFrom)
      },
      async save(row: Booking) {
        const payload = {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          needs: row.needs,
          plan: row.plan,
          note: row.note,
          source: row.source,
          came_from: row.cameFrom,
          status: row.status,
          start_time: row.startTime,
          end_time: row.endTime,
          timezone: row.timezone,
          meet_url: row.meetUrl,
          created_at: row.createdAt,
          updated_at: Date.now(),
        }
        const { data, error } = await client.from("bookings").upsert(payload).select("*").single()
        await throwIf(error)
        return bookingFrom(asRow(data))
      },
      async remove(id: string) {
        await throwIf((await client.from("bookings").delete().eq("id", id)).error)
      },
      async removeMany(ids: readonly string[]) {
        await throwIf((await client.from("bookings").delete().in("id", [...ids])).error)
      },
    },
    /** Load feature lines and attach them to plans. `plans.list()` already does this. */
    hydratePlanFeatures(plans: Plan[]) {
      return loadPlanFeatures(client, plans)
    },
  }
}
