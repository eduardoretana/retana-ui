import type { CrmCompaniesTableLabels } from "@/registry/ui/crm-companies-table"
import type { CrmToolbarLabels } from "@/registry/ui/crm-toolbar"

export const crmMoney = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
})

export const crmTableLabels: CrmCompaniesTableLabels = {
  caption: "Empresas",
  name: "Empresa",
  status: "Estado",
  owner: "Responsable",
  pipeline: "Valor",
  score: "Puntuación",
  activity: "Actividad",
  selectAll: "Seleccionar esta página",
  selectRow: (company) => `Seleccionar ${company.name}`,
  empty: "Ninguna empresa",
  loading: "Cargando empresas",
  selected: (count) => (count === 1 ? "1 seleccionada" : `${count} seleccionadas`),
  range: (start, end, total) => (total === 0 ? "0 empresas" : `${start}–${end} de ${total}`),
  previous: "Anterior",
  next: "Siguiente",
  page: (page, pages) => `${page} / ${pages}`,
  export: "Exportar CSV",
}

export const crmToolbarLabels: CrmToolbarLabels = {
  search: "Buscar empresas",
  searchPlaceholder: "Nombre, responsable o giro",
  segments: "Segmentos",
  filters: "Filtros",
  filterMenu: "Menú de filtros",
  openFilters: "Abrir filtros",
  filterDescription: "Puedes marcar varios valores.",
  clear: "Quitar filtros",
}

export const crmSegments = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "lead", label: "Prospectos" },
  { value: "churned", label: "Inactivas" },
]
