"use client"

/**
 * Clean-room sales CRM page. Behavior is inspired by an unlicensed reference.
 * No source, class names, copy, sample rows, or assets were copied.
 * Composes the company table, toolbar, detail panel, command menu, create dialog,
 * and notices inside rail-sidebar. State stays in React.
 */

import * as React from "react"
import { Building2, Plus, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RailSidebar, type RailSection } from "@/registry/retana/blocks/rail-sidebar"
import { downloadCsv } from "@/registry/retana/lib/csv"
import {
  companyFacetValue,
  companyFromDraft,
  facetSelectionCount,
  filterCompanies,
  type CrmCompany,
  type CrmCompanyDraft,
  type CrmFacetSelection,
  type CrmNotice,
  type CrmSort,
  type CrmStatusTone,
} from "@/registry/retana/lib/crm-companies"
import { crmDemoCompanies, crmDemoNotices, crmDemoOwners } from "@/registry/retana/lib/crm-demo-data"
import { CrmCommandMenu, type CrmCommandAction } from "@/registry/retana/ui/crm-command-menu"
import { companiesToCsv, CrmCompaniesTable } from "@/registry/retana/ui/crm-companies-table"
import { CrmCompanyDetail } from "@/registry/retana/ui/crm-company-detail"
import { CrmNewCompanyDialog } from "@/registry/retana/ui/crm-new-company-dialog"
import { CrmNotifications } from "@/registry/retana/ui/crm-notifications"
import { CrmToolbar, type CrmToolbarFacet } from "@/registry/retana/ui/crm-toolbar"
import { ToastStack, ToastStackProvider, useToastStack } from "@/registry/retana/ui/toast-stack"

const SEGMENTS = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "lead", label: "Prospectos" },
  { value: "churned", label: "Inactivas" },
] as const

const STATUS_TONE: Record<string, CrmStatusTone> = {
  active: "emphasis",
  lead: "neutral",
  churned: "muted",
}

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })

export type CrmDashboardProps = {
  companies?: readonly CrmCompany[]
  notices?: readonly CrmNotice[]
  /** Extra controls in the header, such as a theme switch in the catalog. */
  headerSlot?: React.ReactNode
  className?: string
}

export function CrmDashboard({
  companies = crmDemoCompanies,
  notices = crmDemoNotices,
  headerSlot,
  className,
}: CrmDashboardProps) {
  return (
    <ToastStackProvider>
      <CrmDashboardScreen companies={companies} notices={notices} headerSlot={headerSlot} className={className} />
      <ToastStack label="Resultados" />
    </ToastStackProvider>
  )
}

function CrmDashboardScreen({
  companies: initialCompanies,
  notices: initialNotices,
  headerSlot,
  className,
}: {
  companies: readonly CrmCompany[]
  notices: readonly CrmNotice[]
  headerSlot?: React.ReactNode
  className?: string
}) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState<number | null>(null)
  const [companies, setCompanies] = React.useState<CrmCompany[]>(() => [...initialCompanies])
  const [notices, setNotices] = React.useState<CrmNotice[]>(() => [...initialNotices])
  const [query, setQuery] = React.useState("")
  const [segment, setSegment] = React.useState("all")
  const [facets, setFacets] = React.useState<CrmFacetSelection>({})
  const [sort, setSort] = React.useState<CrmSort>({ key: "name", direction: "asc" })
  const [page, setPage] = React.useState(0)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const toast = useToastStack()

  React.useEffect(() => {
    const node = rootRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.contentRect.width
      if (next > 0) setWidth(next)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const viewport = typeof window === "undefined" ? 1024 : window.innerWidth
  const embedded = width != null && width < 720 && viewport >= 768
  const filtered = React.useMemo(
    () => filterCompanies(companies, { search: query, segment, facets }),
    [companies, facets, query, segment],
  )
  const openCompany = companies.find((company) => company.id === openId) ?? null
  const facetDefs = React.useMemo(() => deriveFacets(companies), [companies])
  const counts = {
    all: companies.length,
    active: companies.filter((company) => company.status === "active").length,
    lead: companies.filter((company) => company.status === "lead").length,
    churned: companies.filter((company) => company.status === "churned").length,
  }

  function applySegment(next: string) {
    setSegment(next)
    setPage(0)
  }

  function createCompany(draft: CrmCompanyDraft & { logoUrl?: string }) {
    const ownerName = crmDemoOwners.find((owner) => owner.id === draft.ownerId)?.name ?? draft.ownerId
    const statusLabel = SEGMENTS.find((item) => item.value === draft.status)?.label ?? draft.status
    const company = companyFromDraft(draft, {
      id: globalThis.crypto?.randomUUID?.() ?? `company-${companies.length + 1}`,
      ownerName,
      statusLabel,
      statusTone: STATUS_TONE[draft.status] ?? "neutral",
      activityLabel: "recién creada",
    })
    setCompanies((current) => [company, ...current])
    setOpenId(company.id)
    toast.toast({ type: "success", title: "Empresa guardada", description: company.name })
  }

  const actions: CrmCommandAction[] = [
    { id: "create", label: "Nueva empresa", shortcut: "N" },
  ]

  const workspace = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold">Empresas</h1>
          <p className="truncate text-sm text-muted-foreground">Estudio Nube · cartera ficticia</p>
        </div>
        <Button type="button" variant="outline" onClick={() => setCommandOpen(true)} aria-keyshortcuts="Meta+K Control+K">
          <Search data-icon="inline-start" aria-hidden="true" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>
        <CrmNotifications
          items={notices}
          onItemsChange={setNotices}
          onSelect={(notice) => {
            if (notice.companyId) setOpenId(notice.companyId)
          }}
          labels={{
            label: "Avisos",
            empty: "Sin avisos",
            markAll: "Marcar leídos",
            unread: (count) => (count ? `Avisos, ${count} sin leer` : "Avisos"),
          }}
        />
        <Button type="button" onClick={() => setCreating(true)}>
          <Plus data-icon="inline-start" aria-hidden="true" />
          Nueva
        </Button>
        {headerSlot}
      </header>
      <div className="flex min-w-0 flex-col gap-4 p-4">
        <CrmToolbar
          query={query}
          onQueryChange={(next) => {
            setQuery(next)
            setPage(0)
          }}
          segment={segment}
          onSegmentChange={applySegment}
          segments={[...SEGMENTS]}
          facets={facetDefs}
          selection={facets}
          onSelectionChange={(next) => {
            setFacets(next)
            setPage(0)
          }}
          labels={{
            search: "Buscar empresas",
            searchPlaceholder: "Nombre, responsable o giro",
            segments: "Segmentos",
            filters: "Filtros",
            filterMenu: "Menú de filtros",
            openFilters: "Abrir filtros",
            filterDescription: "Puedes marcar varios valores. La empresa tiene que coincidir con cada faceta.",
            clear: "Quitar filtros",
          }}
        />
        <CrmCompaniesTable
          rows={filtered}
          sort={sort}
          onSortChange={setSort}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          page={page}
          onPageChange={setPage}
          pageSize={8}
          onRowOpen={(company) => setOpenId(company.id)}
          formatValue={(value) => money.format(value)}
          onExport={(rows) => {
            downloadCsv(
              "empresas.csv",
              companiesToCsv(
                rows,
                {
                  name: "Empresa",
                  status: "Estado",
                  owner: "Responsable",
                  pipeline: "Valor",
                  score: "Puntuación",
                  activity: "Actividad",
                },
                (value) => money.format(value),
              ),
            )
            toast.toast({
              type: "success",
              title: "CSV listo",
              description: rows.length === 1 ? "1 empresa" : `${rows.length} empresas`,
            })
          }}
          labels={{
            caption: "Empresas",
            name: "Empresa",
            status: "Estado",
            owner: "Responsable",
            pipeline: "Valor",
            score: "Puntuación",
            activity: "Actividad",
            selectAll: "Seleccionar esta página",
            selectRow: (company) => `Seleccionar ${company.name}`,
            empty: "Ninguna empresa con estos filtros",
            selected: (count) => (count === 1 ? "1 seleccionada" : `${count} seleccionadas`),
            range: (start, end, total) => (total === 0 ? "0 empresas" : `${start}–${end} de ${total}`),
            previous: "Anterior",
            next: "Siguiente",
            page: (current, pages) => `${current} / ${pages}`,
            export: "Exportar CSV",
          }}
          csvLabels={{
            name: "Empresa",
            status: "Estado",
            owner: "Responsable",
            pipeline: "Valor",
            score: "Puntuación",
            activity: "Actividad",
          }}
        />
        {facetSelectionCount(facets) > 0 ? (
          <p className="sr-only" aria-live="polite">
            Filtros activos
          </p>
        ) : null}
      </div>
    </div>
  )

  const sections = React.useMemo<RailSection[]>(
    () => [
      {
        id: "book",
        label: "Cartera",
        icon: <Building2 />,
        nav: [
          {
            id: "views",
            label: "Vistas",
            items: [
              { id: "all", label: "Todas", href: "#all", badge: counts.all },
              { id: "active", label: "Activas", href: "#active", badge: counts.active },
              { id: "lead", label: "Prospectos", href: "#lead", badge: counts.lead },
              { id: "churned", label: "Inactivas", href: "#churned", badge: counts.churned },
            ],
          },
        ],
      },
    ],
    [counts.active, counts.all, counts.churned, counts.lead],
  )

  return (
    <div ref={rootRef} data-slot="crm-dashboard" className={cn("min-h-svh min-w-0 bg-background", className)}>
      {embedded ? (
        <div className="flex min-h-svh min-w-0 flex-col">{workspace}</div>
      ) : (
        <RailSidebar
          className="min-h-svh"
          sections={sections}
          defaultValue="book"
          activeHref={`#${segment}`}
          onNavigate={(href) => applySegment(href.replace("#", ""))}
          onOpenCommand={() => setCommandOpen((current) => !current)}
          workspace={{ name: "Estudio Nube", subtitle: "Cartera ficticia" }}
          user={{ name: "Elena Voss", email: "elena@estudionube.example" }}
          markLabel="N"
          searchPlaceholder="Empresas"
          searchLabel="Buscar en la cartera"
          commandLabel="Abrir la paleta"
          railLabel="Secciones"
          panelLabel="Cartera"
        >
          {workspace}
        </RailSidebar>
      )}
      <CrmCompanyDetail
        company={openCompany}
        open={openCompany != null}
        onOpenChange={(next) => {
          if (!next) setOpenId(null)
        }}
        formatValue={(value) => money.format(value)}
        labels={{
          close: "Cerrar",
          score: "Puntuación",
          scoreContext: "De 100",
          health: "Salud del pipeline",
          healthDetail: "Cómo está esta cuenta en la cartera",
          healthLow: "Baja",
          healthWatch: "Atención",
          healthHigh: "Sana",
          trend: "Actividad",
          trendEmpty: "Sin actividad en este rango",
          about: "Detalle",
          owner: "Responsable",
          industry: "Giro",
          region: "Región",
          email: "Correo",
          website: "Sitio",
          phone: "Teléfono",
          notes: "Notas",
        }}
      />
      <CrmCommandMenu
        companies={companies}
        open={commandOpen}
        onOpenChange={setCommandOpen}
        hotkey={embedded}
        formatValue={(value) => money.format(value)}
        actions={actions}
        onSelectAction={(action) => {
          if (action.id === "create") setCreating(true)
        }}
        onSelectCompany={(company) => setOpenId(company.id)}
        labels={{
          label: "Buscar empresas",
          description: "Empresas y acciones",
          placeholder: "Nombre, responsable o giro",
          empty: "Ninguna empresa coincide",
          companies: "Empresas",
          actions: "Acciones",
        }}
      />
      <CrmNewCompanyDialog
        open={creating}
        onOpenChange={setCreating}
        statuses={SEGMENTS.filter((item) => item.value !== "all").map((item) => ({ value: item.value, label: item.label }))}
        owners={crmDemoOwners.map((owner) => ({ value: owner.id, label: owner.name }))}
        onSubmit={createCompany}
        labels={{
          title: "Nueva empresa",
          description: "Los campos con asterisco son obligatorios.",
          identity: "Identidad",
          relationship: "Relación",
          commercial: "Comercial",
          logo: "Logo",
          upload: "Subir logo",
          removeLogo: "Quitar logo",
          name: "Nombre",
          email: "Correo",
          website: "Sitio",
          status: "Estado",
          statusPlaceholder: "Elige un estado",
          owner: "Responsable",
          ownerPlaceholder: "Elige a alguien",
          industry: "Giro",
          region: "Región",
          pipeline: "Valor del pipeline",
          notes: "Notas",
          cancel: "Cancelar",
          save: "Guardar empresa",
          invalid: "Revisa los campos marcados",
          issues: {
            "name-required": "Escribe un nombre",
            "status-required": "Elige un estado",
            "owner-required": "Elige un responsable",
            "email-invalid": "Ese correo no es válido",
            "website-invalid": "El sitio debe empezar por http:// o https://",
            "pipeline-invalid": "El valor tiene que ser cero o más",
            "logo-type": "El logo tiene que ser PNG, JPEG, WebP o GIF",
            "logo-size": "El logo tiene que pesar 2 MB o menos",
          },
        }}
      />
    </div>
  )
}

function deriveFacets(companies: readonly CrmCompany[]): CrmToolbarFacet[] {
  const specs = [
    { id: "owner", label: "Responsable" },
    { id: "industry", label: "Giro" },
    { id: "region", label: "Región" },
  ]
  return specs.map((spec) => {
    const options = new Map<string, string>()
    for (const company of companies) {
      const value = companyFacetValue(company, spec.id)
      if (!value) continue
      options.set(value, spec.id === "owner" ? company.owner : value)
    }
    return {
      id: spec.id,
      label: spec.label,
      options: [...options.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label, "es")),
    }
  })
}
