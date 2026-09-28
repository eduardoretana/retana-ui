/**
 * Shared shapes for the admin kit.
 *
 * Pieces never fetch data themselves. A host passes rows and callbacks, or
 * an adapter that implements these ports (in-memory, Supabase, or anything
 * else). Field names are camelCase. The SQL recipe uses snake_case and the
 * Supabase adapter maps between them.
 */

export type EntityId = string

export type ContentRow = {
  id: EntityId
  position: number
}

export type ContentPort<T extends { id: EntityId }> = {
  list: () => Promise<T[]>
  save: (row: T) => Promise<T>
  remove: (id: EntityId) => Promise<void>
  reorder: (ids: readonly EntityId[]) => Promise<void>
}

export type SettingsPort = {
  getAll: () => Promise<Record<string, string>>
  save: (values: Record<string, string>) => Promise<void>
}

export type MediaAsset = {
  id: EntityId
  filename: string
  mime: string
  size: number
  url: string
  width?: number | null
  height?: number | null
  createdAt: string
}

export type MediaPort = {
  list: () => Promise<MediaAsset[]>
  upload: (file: File) => Promise<MediaAsset>
  remove: (id: EntityId) => Promise<void>
}

export type Category = ContentRow & {
  title: string
  slug: string
  published: boolean
}

export type Project = ContentRow & {
  title: string
  slug: string
  categoryId: string | null
  summary: string
  client: string
  year: string
  liveUrl: string
  coverUrl: string | null
  showOnHomepage: boolean
  published: boolean
}

export type ClientLogo = ContentRow & {
  name: string
  logoUrl: string | null
  rowIndex: number
  published: boolean
}

export type Photo = ContentRow & {
  src: string
  alt: string
  showOnHomepage: boolean
  published: boolean
}

export type Testimonial = ContentRow & {
  quote: string
  name: string
  role: string
  avatarUrl: string | null
  published: boolean
}

export type Faq = ContentRow & {
  question: string
  answer: string
  published: boolean
}

export type Plan = ContentRow & {
  name: string
  blurb: string
  monthlyPrice: number | null
  badge: string
  ctaLabel: string
  ctaHref: string
  features: string[]
  published: boolean
}

export type Experience = ContentRow & {
  role: string
  company: string
  period: string
  published: boolean
}

export type Award = ContentRow & {
  name: string
  count: string
  href: string
  published: boolean
}

export type AboutStat = ContentRow & {
  value: string
  label: string
  published: boolean
}

export type BookingStatus = "booked" | "cancelled"

export type Booking = {
  id: EntityId
  name: string
  email: string
  phone: string
  needs: string
  plan: string
  note: string
  source: string
  cameFrom: string
  status: BookingStatus
  startTime: number | null
  endTime: number | null
  timezone: string
  meetUrl: string
  createdAt: number
}

export type BookingsPort = {
  list: () => Promise<Booking[]>
  save: (row: Booking) => Promise<Booking>
  remove: (id: EntityId) => Promise<void>
  removeMany: (ids: readonly EntityId[]) => Promise<void>
}

export type AnalyticsView = {
  ts: number
  visitor: string
  session: string
  path: string
  referrer: string | null
  device: string | null
  durationMs: number
  scrollPct: number
}

export type AnalyticsClick = {
  ts: number
  session: string
  path: string
  label: string
  target: string | null
}

export type DailyMetric = {
  date: string
  visitors: number
  views: number
  clicks: number
}

export type LabeledValue = {
  label: string
  value: number
}

export type AnalyticsSnapshot = {
  daily: DailyMetric[]
  sources: LabeledValue[]
  funnel: LabeledValue[]
  scroll: LabeledValue[]
  /** Monday-first, 7 rows of 24 hours. */
  heat: number[][]
}

export type AdminSeed = {
  /** Clock the sample was built against. Screens compare bookings to this instead of `Date.now()`. */
  asOf: number
  settings: Record<string, string>
  categories: Category[]
  projects: Project[]
  clients: ClientLogo[]
  photos: Photo[]
  testimonials: Testimonial[]
  faqs: Faq[]
  plans: Plan[]
  experience: Experience[]
  awards: Award[]
  stats: AboutStat[]
  media: MediaAsset[]
  bookings: Booking[]
  views: AnalyticsView[]
  clicks: AnalyticsClick[]
}

export type AdminPorts = {
  settings: SettingsPort
  categories: ContentPort<Category>
  projects: ContentPort<Project>
  clients: ContentPort<ClientLogo>
  photos: ContentPort<Photo>
  testimonials: ContentPort<Testimonial>
  faqs: ContentPort<Faq>
  plans: ContentPort<Plan>
  experience: ContentPort<Experience>
  awards: ContentPort<Award>
  stats: ContentPort<AboutStat>
  media: MediaPort
  bookings: BookingsPort
}
