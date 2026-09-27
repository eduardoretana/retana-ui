"use client"

import * as React from "react"
import {
  BadgeDollarSign,
  Building2,
  Calendar,
  ChartColumn,
  CircleHelp,
  Folder,
  Image as ImageIcon,
  Images,
  LayoutDashboard,
  Quote,
  RotateCcw,
  Tags,
  Type,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { LegacyColumnDef } from "@tanstack/react-table/legacy"

import { summarizeAnalytics, sumDaily } from "@/registry/retana/lib/analytics-summary"
import type {
  AdminSeed,
  Booking,
  Category,
  Faq,
  Plan,
  Project,
} from "@/registry/retana/lib/admin-types"
import { resolveRange, type RangeKey } from "@/registry/retana/lib/date-range"
import { formatWhen } from "@/registry/retana/lib/format"
import { createMemoryAdmin } from "@/registry/retana/lib/memory-admin"
import { keepPosition } from "@/registry/retana/lib/reorder"
import { createId, uniqueSlug } from "@/registry/retana/lib/slug"
import { useDateRange } from "@/registry/retana/hooks/use-date-range"
import type { ThemeController } from "@/registry/retana/hooks/use-admin-theme"
import {
  FunnelChart,
  Heatmap,
  RankedBars,
  ScrollDepthChart,
  StatCard,
  TrendChart,
} from "@/registry/retana/ui/admin-charts"
import { AdminShell, type AdminNavGroup } from "@/registry/retana/ui/admin-shell"
import { AdminDataTable } from "@/registry/retana/ui/data-table"
import { AdminSection, EntityForm } from "@/registry/retana/ui/entity-form"
import { MediaField, MediaLibrary } from "@/registry/retana/ui/media-library"
import { OverviewDashboard } from "@/registry/retana/ui/overview-dashboard"
import { SettingsForm, type SettingsGroup } from "@/registry/retana/ui/settings-form"
import { SortableBoard } from "@/registry/retana/ui/sortable-board"
import { SortableList } from "@/registry/retana/ui/sortable-list"
import { buildDemoSeed } from "@/registry/retana/lib/admin-demo-data"

const NAV: AdminNavGroup[] = [
  {
    label: "Sitio",
    items: [
      { href: "overview", label: "Resumen", icon: LayoutDashboard, description: "El día de un vistazo" },
      { href: "analytics", label: "Analítica", icon: ChartColumn, description: "Visitas, fuentes y clics" },
      { href: "bookings", label: "Reservas", icon: Calendar, description: "Llamadas de introducción" },
      { href: "settings", label: "Textos y etiquetas", icon: Type, description: "Titular, botones y SEO" },
      { href: "clients", label: "Logotipos", icon: Building2, description: "Clientes del sitio" },
      { href: "photos", label: "Fotos", icon: ImageIcon, description: "Galería" },
    ],
  },
  {
    label: "Trabajo",
    items: [
      { href: "projects", label: "Proyectos", icon: Folder, description: "Orden del sitio" },
      { href: "categories", label: "Categorías", icon: Tags, description: "Pestañas del trabajo" },
    ],
  },
  {
    label: "Página",
    items: [
      { href: "about", label: "Acerca de", icon: UserRound, description: "Historia, experiencia y premios" },
      { href: "plans", label: "Planes", icon: BadgeDollarSign, description: "Oferta" },
      { href: "testimonials", label: "Testimonios", icon: Quote, description: "Recomendaciones" },
      { href: "faqs", label: "Preguntas", icon: CircleHelp, description: "Acordeón" },
    ],
  },
  {
    label: "Archivos",
    items: [{ href: "media", label: "Biblioteca", icon: Images, description: "Todo lo subido" }],
  },
]

const DRAG_ES = {
  reorderLabel: "Reordenar",
  moveTopLabel: "Al inicio",
  moveUpLabel: "Subir",
  moveDownLabel: "Bajar",
  moveBottomLabel: "Al final",
  dragInstructions:
    "Para reordenar, pulsa Espacio. Flechas para mover, Espacio para soltar, Escape para cancelar.",
  pickedUp: "Recogido, posición",
  ofWord: "de",
  overPlace: "Sobre la posición",
  notOver: "No está sobre una posición.",
  droppedAt: "Soltado en la posición",
  dropped: "Soltado.",
  cancelled: "Cancelado.",
  savedMessage: "Orden guardado",
  errorMessage: "No se pudo guardar el orden",
}

const CHART_ES = {
  visitorsLabel: "Visitantes",
  viewsLabel: "Páginas vistas",
  rangeLabel: "Periodo",
}

const FIELD_ES = {
  uploadLabel: "Subir",
  uploadingLabel: "Subiendo…",
  dropLabel: "Suelta un archivo",
  emptyLibrary: "La biblioteca está vacía",
  uploadedMessage: "Archivo subido",
  uploadFailed: "No se pudo subir",
  pickLabel: "Biblioteca",
  clearLabel: "Quitar",
}

const LIBRARY_ES = {
  uploadLabel: FIELD_ES.uploadLabel,
  uploadingLabel: FIELD_ES.uploadingLabel,
  dropLabel: FIELD_ES.dropLabel,
  uploadedMessage: FIELD_ES.uploadedMessage,
  uploadFailed: FIELD_ES.uploadFailed,
  emptyTitle: "Todavía no hay archivos",
  emptyDescription: "Sube una imagen o un vídeo.",
  nameLabel: "Nombre",
  typeLabel: "Tipo",
  sizeLabel: "Tamaño",
  addedLabel: "Añadido",
  deleteTitle: "Eliminar archivo",
  deleteDescription: "El archivo sale de la biblioteca.",
  deleteLabel: "Eliminar",
  viewLabel: "Vista",
}

const SETTING_GROUPS: SettingsGroup[] = [
  {
    id: "home",
    title: "Portada",
    description: "El titular y el botón principal.",
    fields: [
      { key: "site.name", label: "Nombre del sitio" },
      { key: "site.headline", label: "Titular", kind: "textarea", rows: 2 },
      { key: "site.subhead", label: "Subtítulo", kind: "textarea", rows: 3 },
      { key: "cta.label", label: "Texto del botón" },
      { key: "cta.href", label: "Enlace del botón", kind: "url" },
    ],
  },
  {
    id: "seo",
    title: "SEO y pie",
    fields: [
      { key: "seo.title", label: "Título" },
      { key: "seo.description", label: "Descripción", kind: "textarea" },
      { key: "footer.note", label: "Nota del pie", kind: "textarea", rows: 2 },
    ],
  },
]

export type AdminKitProps = {
  themeController?: ThemeController
  className?: string
  /** Replace the in-memory demo. The kit still starts from `seed` until ports resolve. */
  seed?: AdminSeed
  /** Mount sonner's toaster. Turn off when the host already renders one. */
  showToaster?: boolean
}

export function AdminKit({ themeController, className, seed: seedProp, showToaster = true }: AdminKitProps) {
  const seed = React.useMemo(() => seedProp ?? buildDemoSeed(), [seedProp])
  const admin = React.useMemo(() => createMemoryAdmin(seed), [seed])
  const [data, setData] = React.useState(seed)
  const [screen, setScreen] = React.useState("overview")
  const refresh = React.useCallback(() => setData(admin.read()), [admin])

  return (
    <AdminShell
      className={className}
      groups={NAV}
      pathname={screen}
      onNavigate={setScreen}
      themeController={themeController}
      showToaster={showToaster}
      commandLabel="Buscar páginas"
      emptyCommand="Ninguna página"
      themeLabel="Tema"
      themeNames={{ light: "claro", dark: "oscuro", system: "sistema" }}
      rootLabel="Estudio"
      sidebarLabel="Alternar el menú"
      brand={
        <div className="px-2 py-1 group-data-[collapsible=icon]:hidden">
          <p className="text-sm font-semibold">{data.settings["site.name"] || "Estudio"}</p>
          <p className="text-xs text-muted-foreground">Datos de demostración</p>
        </div>
      }
      actions={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Reiniciar la demo"
          title="Reiniciar la demo"
          onClick={() => window.location.reload()}
        >
          <RotateCcw />
        </Button>
      }
    >
      {screen === "overview" ? <OverviewScreen data={data} onOpen={setScreen} /> : null}
      {screen === "analytics" ? <AnalyticsScreen data={data} /> : null}
      {screen === "bookings" ? (
        <BookingsScreen
          rows={data.bookings}
          now={data.asOf}
          onDelete={async (ids) => {
            await admin.bookings.removeMany(ids)
            refresh()
            toast.success("Reservas eliminadas")
          }}
        />
      ) : null}
      {screen === "settings" ? (
        <SettingsForm
          groups={SETTING_GROUPS}
          values={data.settings}
          saveLabel="Guardar"
          discardLabel="Descartar"
          dirtyLabel="Cambios sin guardar"
          cleanLabel="Todo guardado"
          pendingLabel="Guardando…"
          leaveMessage="Hay textos sin guardar."
          onSave={async (values) => {
            await admin.settings.save(values)
            refresh()
            toast.success("Textos guardados")
          }}
        />
      ) : null}
      {screen === "projects" ? (
        <ProjectsScreen
          data={data}
          onReorder={async (ids) => {
            await admin.projects.reorder(ids)
            refresh()
          }}
          onToggle={async (id, show) => {
            const row = data.projects.find((item) => item.id === id)
            if (!row) return
            await admin.projects.save({ ...row, showOnHomepage: show })
            refresh()
          }}
          onSave={async (row) => {
            await admin.projects.save(row)
            refresh()
            toast.success("Proyecto guardado")
          }}
          onDelete={async (id) => {
            await admin.projects.remove(id)
            refresh()
          }}
          onUpload={(file) => admin.media.upload(file).then((asset) => {
            refresh()
            return asset
          })}
        />
      ) : null}
      {screen === "categories" ? (
        <SimpleList
          title="Categorías"
          addLabel="Añadir categoría"
          source={data.categories}
          items={data.categories.map((row) => ({ id: row.id, title: row.title, meta: row.slug }))}
          onReorder={async (ids) => {
            await admin.categories.reorder(ids)
            refresh()
          }}
          onSave={async (row) => {
            await admin.categories.save(row)
            refresh()
          }}
          onDelete={async (id) => {
            await admin.categories.remove(id)
            refresh()
          }}
          toRow={(current, form) => {
            const title = String(form.get("title") ?? "")
            return keepPosition(current, {
              ...(current ?? {
                id: createId(),
                position: data.categories.length,
                published: true,
                slug: "",
                title: "",
              }),
              title,
              slug: uniqueSlug(
                title,
                data.categories.map((item) => item.slug),
                current?.slug,
              ),
              published: form.get("published") === "on",
            })
          }}
          fields={(row) => (
            <>
              <TextField name="title" label="Título" defaultValue={row?.title} />
              <CheckField name="published" label="Publicada" defaultChecked={row?.published ?? true} />
            </>
          )}
        />
      ) : null}
      {screen === "clients" ? (
        <NamedList
          title="Logotipos"
          rows={data.clients}
          nameOf={(row) => row.name}
          metaOf={(row) => `Fila ${row.rowIndex + 1}`}
          onReorder={async (ids) => {
            await admin.clients.reorder(ids)
            refresh()
          }}
          onSave={async (row) => {
            await admin.clients.save(row)
            refresh()
          }}
          onDelete={async (id) => {
            await admin.clients.remove(id)
            refresh()
          }}
          create={(name) => ({
            id: createId(),
            name,
            logoUrl: null,
            rowIndex: 0,
            position: data.clients.length,
            published: true,
          })}
          edit={(row, name, form) =>
            keepPosition(row, {
              ...row,
              name,
              rowIndex: Number(form.get("rowIndex") ?? row.rowIndex) || 0,
              published: form.get("published") === "on",
            })
          }
          extra={(row) => (
            <>
              <TextField name="rowIndex" label="Fila (0 o 1)" defaultValue={String(row?.rowIndex ?? 0)} />
              <CheckField name="published" label="Publicado" defaultChecked={row?.published ?? true} />
            </>
          )}
        />
      ) : null}
      {screen === "photos" ? (
        <NamedList
          title="Fotos"
          rows={data.photos}
          nameOf={(row) => row.alt || "Sin texto alternativo"}
          metaOf={(row) => (row.showOnHomepage ? "En portada" : "Oculta en portada")}
          onReorder={async (ids) => {
            await admin.photos.reorder(ids)
            refresh()
          }}
          onSave={async (row) => {
            await admin.photos.save(row)
            refresh()
          }}
          onDelete={async (id) => {
            await admin.photos.remove(id)
            refresh()
          }}
          create={(name) => ({
            id: createId(),
            alt: name,
            src: "",
            showOnHomepage: false,
            position: data.photos.length,
            published: true,
          })}
          edit={(row, name, form) =>
            keepPosition(row, {
              ...row,
              alt: name,
              showOnHomepage: form.get("showOnHomepage") === "on",
              published: form.get("published") === "on",
            })
          }
          extra={(row) => (
            <>
              <CheckField name="showOnHomepage" label="En la portada" defaultChecked={row?.showOnHomepage} />
              <CheckField name="published" label="Publicada" defaultChecked={row?.published ?? true} />
            </>
          )}
        />
      ) : null}
      {screen === "testimonials" ? (
        <NamedList
          title="Testimonios"
          rows={data.testimonials}
          nameOf={(row) => row.name}
          metaOf={(row) => row.role}
          onReorder={async (ids) => {
            await admin.testimonials.reorder(ids)
            refresh()
          }}
          onSave={async (row) => {
            await admin.testimonials.save(row)
            refresh()
          }}
          onDelete={async (id) => {
            await admin.testimonials.remove(id)
            refresh()
          }}
          create={(name) => ({
            id: createId(),
            name,
            role: "",
            quote: "",
            avatarUrl: null,
            position: data.testimonials.length,
            published: true,
          })}
          edit={(row, name, form) =>
            keepPosition(row, {
              ...row,
              name,
              role: String(form.get("role") ?? ""),
              quote: String(form.get("quote") ?? ""),
              published: form.get("published") === "on",
            })
          }
          extra={(row) => (
            <>
              <TextField name="role" label="Cargo" defaultValue={row?.role} />
              <TextField name="quote" label="Cita" defaultValue={row?.quote} multiline />
              <CheckField name="published" label="Publicado" defaultChecked={row?.published ?? true} />
            </>
          )}
        />
      ) : null}
      {screen === "faqs" ? (
        <NamedList
          title="Preguntas"
          rows={data.faqs}
          nameOf={(row) => row.question}
          metaOf={(row) => row.answer}
          onReorder={async (ids) => {
            await admin.faqs.reorder(ids)
            refresh()
          }}
          onSave={async (row) => {
            await admin.faqs.save(row)
            refresh()
          }}
          onDelete={async (id) => {
            await admin.faqs.remove(id)
            refresh()
          }}
          create={(name) => ({
            id: createId(),
            question: name,
            answer: "",
            position: data.faqs.length,
            published: true,
          })}
          edit={(row, name, form) =>
            keepPosition(row, {
              ...row,
              question: name,
              answer: String(form.get("answer") ?? ""),
              published: form.get("published") === "on",
            })
          }
          extra={(row) => (
            <>
              <TextField name="answer" label="Respuesta" defaultValue={row?.answer} multiline />
              <CheckField name="published" label="Publicada" defaultChecked={row?.published ?? true} />
            </>
          )}
        />
      ) : null}
      {screen === "plans" ? <PlansScreen data={data} adminSave={async (row) => { await admin.plans.save(row); refresh() }} adminRemove={async (id) => { await admin.plans.remove(id); refresh() }} adminReorder={async (ids) => { await admin.plans.reorder(ids); refresh() }} /> : null}
      {screen === "about" ? (
        <div className="flex flex-col gap-4">
          <SettingsForm
            groups={[{
              id: "story",
              title: "Historia",
              fields: [{ key: "about.story", label: "Texto", kind: "textarea", rows: 5 }],
            }]}
            values={data.settings}
            saveLabel="Guardar"
            discardLabel="Descartar"
            dirtyLabel="Cambios sin guardar"
            cleanLabel="Todo guardado"
            pendingLabel="Guardando…"
            leaveMessage="Hay textos sin guardar."
            onSave={async (values) => {
              await admin.settings.save({ ...data.settings, ...values })
              refresh()
              toast.success("Historia guardada")
            }}
          />
          <AdminSection title="Cifras" description="Las tres cifras bajo la historia.">
            <SortableList
              {...DRAG_ES}
              label="cifras"
              editLabel="Editar"
              items={data.stats.map((row) => ({ id: row.id, title: row.value, meta: row.label }))}
              onReorder={async (ids) => {
                await admin.stats.reorder(ids)
                refresh()
              }}
            />
          </AdminSection>
          <AdminSection title="Experiencia">
            <SortableList
              {...DRAG_ES}
              label="puestos"
              items={data.experience.map((row) => ({ id: row.id, title: row.role, meta: `${row.company} · ${row.period}` }))}
              onReorder={async (ids) => {
                await admin.experience.reorder(ids)
                refresh()
              }}
            />
          </AdminSection>
          <AdminSection title="Premios">
            <SortableList
              {...DRAG_ES}
              label="premios"
              items={data.awards.map((row) => ({ id: row.id, title: row.name, meta: row.count }))}
              onReorder={async (ids) => {
                await admin.awards.reorder(ids)
                refresh()
              }}
            />
          </AdminSection>
        </div>
      ) : null}
      {screen === "media" ? (
        <MediaLibrary
          {...LIBRARY_ES}
          assets={data.media}
          onUpload={async (file) => {
            const asset = await admin.media.upload(file)
            refresh()
            return asset
          }}
          onDelete={async (id) => {
            await admin.media.remove(id)
            refresh()
          }}
        />
      ) : null}
    </AdminShell>
  )
}

function OverviewScreen({ data, onOpen }: { data: AdminSeed; onOpen: (href: string) => void }) {
  const week = resolveRange("7d", data.asOf, "UTC")
  const prev = { from: week.prevFrom, to: week.prevTo }
  const current = summarizeAnalytics(data.views, data.clicks, week.from, week.to)
  const previous = summarizeAnalytics(data.views, data.clicks, prev.from, prev.to)
  const nowSum = sumDaily(current.daily)
  const prevSum = sumDaily(previous.daily)
  const upcoming = data.bookings
    .filter((row) => row.status === "booked" && row.startTime != null && row.startTime >= data.asOf)
    .sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0))
    .slice(0, 4)
  return (
    <OverviewDashboard
      title="Resumen"
      trendTitle="Esta semana"
      upcomingTitle="Próximas llamadas"
      countsTitle="En el sitio"
      emptyUpcoming="Nada programado."
      {...CHART_ES}
      onOpen={onOpen}
      stats={[
        { id: "visitors", label: "Visitantes", value: nowSum.visitors, previous: prevSum.visitors, sparkline: current.daily.map((d) => d.visitors), tone: 1, caption: "vs. la semana anterior" },
        { id: "views", label: "Páginas vistas", value: nowSum.views, previous: prevSum.views, sparkline: current.daily.map((d) => d.views), tone: 2, caption: "vs. la semana anterior" },
        { id: "clicks", label: "Clics", value: nowSum.clicks, previous: prevSum.clicks, sparkline: current.daily.map((d) => d.clicks), tone: 3, caption: "vs. la semana anterior" },
        { id: "calls", label: "Llamadas por venir", value: upcoming.length, tone: 4 },
      ]}
      trend={current.daily.map((day) => ({ label: day.date.slice(5), visitors: day.visitors, views: day.views }))}
      upcoming={upcoming.map((row) => ({
        id: row.id,
        title: row.name,
        meta: `${row.plan} · ${formatWhen(row.startTime, "es")}`,
      }))}
      counts={[
        { label: "Proyectos", value: data.projects.length, href: "projects" },
        { label: "En portada", value: data.projects.filter((row) => row.showOnHomepage).length, href: "projects" },
        { label: "Categorías", value: data.categories.length, href: "categories" },
        { label: "Reservas", value: data.bookings.length, href: "bookings" },
        { label: "Planes", value: data.plans.length, href: "plans" },
        { label: "Archivos", value: data.media.length, href: "media" },
      ]}
    />
  )
}

function AnalyticsScreen({ data }: { data: AdminSeed }) {
  const range = useDateRange("7d", "UTC")
  const snap = summarizeAnalytics(data.views, data.clicks, range.range.from, range.range.to)
  const prev = summarizeAnalytics(data.views, data.clicks, range.range.prevFrom, range.range.prevTo)
  const sum = sumDaily(snap.daily)
  const prevSum = sumDaily(prev.daily)
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Visitantes" value={sum.visitors} previous={prevSum.visitors} sparkline={snap.daily.map((d) => d.visitors)} tone={1} caption="periodo anterior" />
        <StatCard label="Páginas vistas" value={sum.views} previous={prevSum.views} sparkline={snap.daily.map((d) => d.views)} tone={2} caption="periodo anterior" />
        <StatCard label="Clics" value={sum.clicks} previous={prevSum.clicks} tone={3} caption="periodo anterior" />
      </div>
      <TrendChart
        title="Tendencia"
        {...CHART_ES}
        points={snap.daily.map((day) => ({ label: day.date.slice(5), visitors: day.visitors, views: day.views }))}
        ranges={[
          { key: "today", label: "Hoy" },
          { key: "7d", label: "7 días" },
          { key: "30d", label: "30 días" },
          { key: "90d", label: "90 días" },
        ]}
        range={range.key}
        onRangeChange={(key) => range.setKey(key as RangeKey)}
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <FunnelChart title="Embudo" steps={snap.funnel.map((step, index) => ({ ...step, tone: ((index % 5) + 1) as 1 | 2 | 3 | 4 | 5 }))} />
        <RankedBars title="Fuentes" items={snap.sources} tone={2} emptyLabel="Sin datos" />
      </div>
      <Heatmap
        grid={snap.heat}
        title="Día y hora"
        tone={1}
        description="Las celdas más oscuras tuvieron más visitas."
        dayLabels={["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]}
      />
      <ScrollDepthChart
        marks={snap.scroll}
        title="Profundidad de scroll"
        description="Parte de las visitas que llegó a cada marca."
        valueLabel="Alcanzaron"
      />
    </div>
  )
}

const bookingColumns: LegacyColumnDef<Booking>[] = [
  { accessorKey: "name", header: "Nombre", cell: ({ row }) => row.original.name },
  { accessorKey: "status", header: "Estado", cell: ({ row }) => (row.original.status === "cancelled" ? "Cancelada" : "Reservada") },
  { accessorKey: "plan", header: "Plan" },
  { accessorKey: "needs", header: "Interés" },
  { id: "from", header: "Origen", accessorFn: (row) => row.cameFrom, cell: ({ row }) => row.original.cameFrom },
  { id: "call", header: "Llamada", accessorFn: (row) => row.startTime ?? 0, cell: ({ row }) => formatWhen(row.original.startTime, "es") },
  { id: "booked", header: "Reservada", accessorFn: (row) => row.createdAt, cell: ({ row }) => formatWhen(row.original.createdAt, "es") },
]

function BookingsScreen({
  rows,
  now,
  onDelete,
}: {
  rows: Booking[]
  now: number
  onDelete: (ids: string[]) => Promise<void>
}) {
  return (
    <AdminDataTable
      data={rows}
      columns={bookingColumns}
      searchPlaceholder="Buscar reservas"
      searchText={(row) => `${row.name} ${row.email} ${row.plan} ${row.needs} ${row.note} ${row.cameFrom}`}
      tabs={[
        { id: "all", label: "Todas" },
        { id: "upcoming", label: "Próximas", predicate: (row) => row.status === "booked" && (row.startTime ?? 0) >= now },
        { id: "past", label: "Pasadas", predicate: (row) => row.status === "booked" && row.startTime != null && row.startTime < now },
        { id: "cancelled", label: "Canceladas", predicate: (row) => row.status === "cancelled" },
      ]}
      filters={[
        {
          id: "plan",
          label: "Plan",
          options: [...new Set(rows.map((row) => row.plan))].map((plan) => ({ value: plan, label: plan })),
          predicate: (row, value) => row.plan === value,
        },
        {
          id: "source",
          label: "Origen",
          options: [...new Set(rows.map((row) => row.cameFrom))].map((value) => ({ value, label: value })),
          predicate: (row, value) => row.cameFrom === value,
        },
      ]}
      bulkActions={[{
        id: "delete",
        label: "Eliminar",
        destructive: true,
        onAction: (selected) => onDelete(selected.map((row) => row.id)),
      }]}
      csvFilename="reservas.csv"
      csvColumns={[
        { key: "name", header: "Nombre" },
        { key: "email", header: "Correo" },
        { key: "phone", header: "Teléfono" },
        { key: "plan", header: "Plan" },
        { key: "status", header: "Estado" },
      ]}
      toCsvRow={(row) => ({ ...row })}
      detailTitle={(row) => row.name}
      renderDetail={(row) => (
        <div className="flex flex-col gap-3 text-sm">
          <p>{row.email}</p>
          <p className="text-muted-foreground">{row.phone}</p>
          <p>{row.needs}</p>
          <p>{row.note}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(row.email)
              toast.success("Correo copiado")
            }}
          >
            Copiar correo
          </Button>
        </div>
      )}
      emptyTitle="No hay reservas"
      columnsLabel="Columnas"
      csvLabel="CSV"
      selectedLabel="seleccionadas"
      previousLabel="Anterior"
      nextLabel="Siguiente"
      detailFallback="Detalle"
      detailDescription="Detalle de la reserva"
      viewsLabel="Vistas"
      selectAllLabel="Seleccionar todas"
      selectRowLabel="Seleccionar fila"
    />
  )
}

function ProjectsScreen({
  data,
  onReorder,
  onToggle,
  onSave,
  onDelete,
  onUpload,
}: {
  data: AdminSeed
  onReorder: (ids: readonly string[]) => Promise<void>
  onToggle: (id: string, show: boolean) => Promise<void>
  onSave: (row: Project) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onUpload: (file: File) => Promise<AdminSeed["media"][number]>
}) {
  const [editing, setEditing] = React.useState<Project | "new" | null>(null)
  const [busy, setBusy] = React.useState(false)
  const current = editing && editing !== "new" ? editing : undefined
  const editingKey = editing === "new" ? "new" : (editing?.id ?? "")
  const [seenEditing, setSeenEditing] = React.useState(editingKey)
  const [cover, setCover] = React.useState("")
  const [categoryId, setCategoryId] = React.useState("none")
  if (seenEditing !== editingKey) {
    setSeenEditing(editingKey)
    setCover(current?.coverUrl ?? "")
    setCategoryId(current?.categoryId ?? "none")
  }
  const titleByCategory = new Map(data.categories.map((category) => [category.id, category.title]))

  return (
    <>
      <SortableBoard
        homepageLabel="Portada"
        searchLabel="Buscar proyectos"
        editLabel="Editar"
        emptyTitle="Ningún proyecto coincide"
        allLabel="Todos"
        uncategorizedLabel="Sin categoría"
        listLabel="Lista"
        gridLabel="Cuadrícula"
        viewLabel="Vista"
        orderHint="Arrastra el asa. Este orden es el del sitio."
        filteredHint="Al reordenar solo cambian los proyectos en pantalla. El resto se queda."
        savedMessage="Orden guardado"
        updateError="No se pudo actualizar"
        reorderLabel="Reordenar"
        dragInstructions={DRAG_ES.dragInstructions}
        pickedUp={DRAG_ES.pickedUp}
        ofWord={DRAG_ES.ofWord}
        overPlace={DRAG_ES.overPlace}
        droppedAt={DRAG_ES.droppedAt}
        dropped={DRAG_ES.dropped}
        cancelled={DRAG_ES.cancelled}
        items={data.projects.map((row) => ({
          id: row.id,
          title: row.title,
          categoryId: row.categoryId,
          categoryTitle: row.categoryId ? titleByCategory.get(row.categoryId) : null,
          imageUrl: row.coverUrl,
          showOnHomepage: row.showOnHomepage,
        }))}
        categories={data.categories.map((row) => ({ id: row.id, title: row.title }))}
        onReorder={onReorder}
        onToggleHomepage={onToggle}
        onEdit={(id) => {
          const row = data.projects.find((item) => item.id === id)
          if (row) setEditing(row)
        }}
        addButton={
          <Button type="button" onClick={() => setEditing("new")}>
            Añadir proyecto
          </Button>
        }
      />
      <EntityForm
        open={editing != null}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
        title={current ? "Editar proyecto" : "Nuevo proyecto"}
        description="La posición no cambia al guardar."
        busy={busy}
        submitLabel="Guardar"
        pendingLabel="Guardando…"
        cancelLabel="Cancelar"
        deleteLabel="Eliminar"
        onDelete={current ? () => onDelete(current.id) : undefined}
        onSubmit={async (form) => {
          const title = String(form.get("title") ?? "").trim()
          const chosen = String(form.get("categoryId") ?? "")
          const row: Project = keepPosition(current, {
            id: current?.id ?? createId(),
            title,
            slug: uniqueSlug(title, data.projects.map((item) => item.slug), current?.slug),
            categoryId: chosen && chosen !== "none" ? chosen : null,
            summary: String(form.get("summary") ?? ""),
            client: String(form.get("client") ?? ""),
            year: String(form.get("year") ?? ""),
            liveUrl: String(form.get("liveUrl") ?? ""),
            coverUrl: cover || null,
            showOnHomepage: current?.showOnHomepage ?? false,
            published: form.get("published") === "on",
            position: current?.position ?? data.projects.length,
          })
          await onSave(row)
          setEditing(null)
        }}
      >
        <TextField name="title" label="Título" defaultValue={current?.title} required />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoryId">Categoría</Label>
          <input type="hidden" name="categoryId" value={categoryId} />
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="categoryId" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin categoría</SelectItem>
              {data.categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <TextField name="summary" label="Resumen" defaultValue={current?.summary} multiline />
        <TextField name="client" label="Cliente" defaultValue={current?.client} />
        <TextField name="year" label="Año" defaultValue={current?.year} />
        <TextField name="liveUrl" label="Enlace" defaultValue={current?.liveUrl} />
        <MediaField
          {...FIELD_ES}
          label="Portada"
          value={cover}
          onChange={(url) => setCover(url)}
          assets={data.media}
          onUpload={onUpload}
          onBusyChange={setBusy}
        />
        <CheckField name="published" label="Publicado" defaultChecked={current?.published ?? true} />
      </EntityForm>
    </>
  )
}

function PlansScreen({
  data,
  adminSave,
  adminRemove,
  adminReorder,
}: {
  data: AdminSeed
  adminSave: (row: Plan) => Promise<void>
  adminRemove: (id: string) => Promise<void>
  adminReorder: (ids: readonly string[]) => Promise<void>
}) {
  const [editing, setEditing] = React.useState<Plan | "new" | null>(null)
  const current = editing && editing !== "new" ? editing : undefined
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setEditing("new")}>Añadir plan</Button>
      </div>
      <SortableList
              {...DRAG_ES}
        label="planes"
        editLabel="Editar"
        items={data.plans.map((row) => ({
          id: row.id,
          title: row.name,
          meta: row.monthlyPrice == null ? "Sin precio" : `${row.monthlyPrice} / mes`,
        }))}
        onReorder={adminReorder}
        onEdit={(id) => {
          const row = data.plans.find((item) => item.id === id)
          if (row) setEditing(row)
        }}
      />
      <EntityForm
        open={editing != null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={current ? "Editar plan" : "Nuevo plan"}
        submitLabel="Guardar"
        pendingLabel="Guardando…"
        cancelLabel="Cancelar"
        deleteLabel="Eliminar"
        onDelete={current ? () => adminRemove(current.id) : undefined}
        onSubmit={async (form) => {
          const name = String(form.get("name") ?? "")
          const price = String(form.get("monthlyPrice") ?? "").trim()
          const row: Plan = keepPosition(current, {
            id: current?.id ?? createId(),
            name,
            blurb: String(form.get("blurb") ?? ""),
            monthlyPrice: price ? Number(price) : null,
            badge: String(form.get("badge") ?? ""),
            ctaLabel: String(form.get("ctaLabel") ?? "Reservar"),
            ctaHref: String(form.get("ctaHref") ?? ""),
            features: String(form.get("features") ?? "").split("\n").map((line) => line.trim()).filter(Boolean),
            published: form.get("published") === "on",
            position: current?.position ?? data.plans.length,
          })
          await adminSave(row)
          setEditing(null)
          toast.success("Plan guardado")
        }}
      >
        <TextField name="name" label="Nombre" defaultValue={current?.name} required />
        <TextField name="blurb" label="Resumen" defaultValue={current?.blurb} multiline />
        <TextField name="monthlyPrice" label="Precio mensual (vacío si no aplica)" defaultValue={current?.monthlyPrice == null ? "" : String(current.monthlyPrice)} />
        <TextField name="badge" label="Etiqueta" defaultValue={current?.badge} />
        <TextField name="ctaLabel" label="Botón" defaultValue={current?.ctaLabel} />
        <TextField name="features" label="Incluye (una línea por punto)" defaultValue={current?.features.join("\n")} multiline />
        <CheckField name="published" label="Publicado" defaultChecked={current?.published ?? true} />
      </EntityForm>
    </div>
  )
}

function SimpleList<T extends Category | Faq>({
  title,
  addLabel,
  source,
  items,
  onReorder,
  onSave,
  onDelete,
  toRow,
  fields,
}: {
  title: string
  addLabel: string
  source: readonly T[]
  items: { id: string; title: string; meta?: string }[]
  onReorder: (ids: readonly string[]) => Promise<void>
  onSave: (row: T) => Promise<void>
  onDelete: (id: string) => Promise<void>
  toRow: (current: T | undefined, form: FormData) => T
  fields: (row: T | undefined) => React.ReactNode
}) {
  const [editing, setEditing] = React.useState<T | "new" | null>(null)
  const current = editing && editing !== "new" ? editing : undefined
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <Button type="button" onClick={() => setEditing("new")}>{addLabel}</Button>
      </div>
      <SortableList
              {...DRAG_ES}
        label={title.toLowerCase()}
        editLabel="Editar"
        items={items}
        onReorder={onReorder}
        onEdit={(id) => {
          const found = source.find((item) => item.id === id)
          if (found) setEditing(found)
        }}
      />
      <EntityForm
        open={editing != null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={current ? `Editar` : addLabel}
        submitLabel="Guardar"
        pendingLabel="Guardando…"
        cancelLabel="Cancelar"
        deleteLabel="Eliminar"
        onDelete={current ? async () => { await onDelete(current.id); setEditing(null) } : undefined}
        onSubmit={async (form) => {
          await onSave(toRow(current, form))
          setEditing(null)
          toast.success("Guardado")
        }}
      >
        {fields(current && current.id === (editing as T).id ? current : current)}
      </EntityForm>
    </div>
  )
}

function NamedList<T extends { id: string; position: number }>({
  title,
  rows,
  nameOf,
  metaOf,
  onReorder,
  onSave,
  onDelete,
  create,
  edit,
  extra,
}: {
  title: string
  rows: readonly T[]
  nameOf: (row: T) => string
  metaOf?: (row: T) => string
  onReorder: (ids: readonly string[]) => Promise<void>
  onSave: (row: T) => Promise<void>
  onDelete: (id: string) => Promise<void>
  create: (name: string) => T
  edit: (row: T, name: string, form: FormData) => T
  extra?: (row: T | undefined) => React.ReactNode
}) {
  const [editing, setEditing] = React.useState<T | "new" | null>(null)
  const current = editing && editing !== "new" ? rows.find((row) => row.id === editing.id) ?? editing : undefined
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <Button type="button" onClick={() => setEditing("new")}>Añadir</Button>
      </div>
      <SortableList
              {...DRAG_ES}
        label={title.toLowerCase()}
        editLabel="Editar"
        emptyTitle="Nada todavía"
        items={rows.map((row) => ({ id: row.id, title: nameOf(row), meta: metaOf?.(row) }))}
        onReorder={onReorder}
        onEdit={(id) => {
          const row = rows.find((item) => item.id === id)
          if (row) setEditing(row)
        }}
      />
      <EntityForm
        open={editing != null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={current ? "Editar" : "Nuevo"}
        description="Al guardar se conserva la posición."
        submitLabel="Guardar"
        pendingLabel="Guardando…"
        cancelLabel="Cancelar"
        deleteLabel="Eliminar"
        onDelete={current ? async () => { await onDelete(current.id) } : undefined}
        onSubmit={async (form) => {
          const name = String(form.get("name") ?? "").trim()
          const row = current ? edit(current, name, form) : create(name)
          await onSave(row)
          setEditing(null)
          toast.success("Guardado")
        }}
      >
        <TextField name="name" label="Nombre" defaultValue={current ? nameOf(current) : ""} required />
        {extra?.(current)}
      </EntityForm>
    </div>
  )
}

function TextField({
  name,
  label,
  defaultValue,
  multiline,
  required,
}: {
  name: string
  label: string
  defaultValue?: string
  multiline?: boolean
  required?: boolean
}) {
  const id = React.useId()
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea id={id} name={name} defaultValue={defaultValue} rows={3} required={required} />
      ) : (
        <Input id={id} name={name} defaultValue={defaultValue} required={required} />
      )}
    </div>
  )
}

function CheckField({
  name,
  label,
  defaultChecked,
}: {
  name: string
  label: string
  defaultChecked?: boolean
}) {
  const [on, setOn] = React.useState(defaultChecked ?? false)
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={on} onCheckedChange={(value) => setOn(value === true)} />
      <input type="hidden" name={name} value={on ? "on" : ""} />
      {label}
    </label>
  )
}
