import type { SceneLocale } from "@/app/catalog/scene-types"
import type {
  ChecklistItem,
  ExpandableAction,
  ExpandableColumn,
  ExpandableFilter,
  ExpandableTableLabels,
  ExpansionLine,
} from "@/registry/ui/expandable-table"

export type OrderRow = {
  id: string
  code: string
  account: string
  owner: string
  status: "open" | "late" | "done"
  statusLabel: string
  checks?: ChecklistItem[]
  lines?: ExpansionLine[]
  subRows?: OrderRow[]
}

const statusLabel = {
  es: { open: "Abierto", late: "Tarde", done: "Listo" },
  en: { open: "Open", late: "Late", done: "Done" },
} as const

function order(locale: SceneLocale, row: Omit<OrderRow, "statusLabel">): OrderRow {
  return { ...row, statusLabel: statusLabel[locale][row.status] }
}

export function checklistRows(locale: SceneLocale): OrderRow[] {
  const es = locale === "es"
  return [
    order(locale, {
      id: "ped-1048",
      code: "PED-1048",
      account: "Cerámica del Bajío",
      owner: "Horno",
      status: "late",
      checks: [
        {
          id: "horno",
          title: es ? "El horno 2 no enciende" : "Kiln 2 will not light",
          status: es ? "Tarde" : "Late",
          owner: "Horno",
          date: es ? "30 oct" : "30 Oct",
          comment: es ? "La entrega a León pasa al lunes 2 de noviembre." : "The León delivery moves to Monday 2 November.",
        },
        {
          id: "cobalto",
          title: es ? "El cobalto sale distinto" : "The cobalt comes out different",
          status: es ? "Abierto" : "Open",
          owner: "Mariana Ruiz",
          date: es ? "2 nov" : "2 Nov",
          comment: es ? "En el horno 1 no se quema igual." : "Kiln 1 does not fire it the same way.",
        },
        {
          id: "anticipo",
          title: es ? "Confirmar el anticipo" : "Confirm the deposit",
          status: es ? "Listo" : "Done",
          owner: "Caja",
          date: es ? "28 oct" : "28 Oct",
          comment: es ? "Sigue en $18,400.00 MXN, no en $16,200.00." : "It stays at $18,400.00 MXN, not $16,200.00.",
        },
      ],
    }),
    order(locale, {
      id: "ped-990",
      code: "PED-990",
      account: "Cerámica del Bajío",
      owner: "Bruma",
      status: "open",
      checks: [
        {
          id: "correo",
          title: es ? "El correo a Celaya no salió" : "The Celaya mail did not go out",
          status: es ? "Abierto" : "Open",
          owner: "Bruma",
          date: es ? "28 oct" : "28 Oct",
          comment: es ? "Ramón Solís sigue en pedidos@bajio.example." : "Ramón Solís is still at pedidos@bajio.example.",
        },
      ],
    }),
    order(locale, {
      id: "ped-880",
      code: "PED-880",
      account: es ? "Taller de León" : "León workshop",
      owner: "Caja",
      status: "done",
      checks: [
        {
          id: "entrega",
          title: es ? "Pieza entregada" : "Piece delivered",
          status: es ? "Listo" : "Done",
          owner: "Mariana Ruiz",
          date: es ? "20 oct" : "20 Oct",
        },
      ],
    }),
    order(locale, {
      id: "ped-772",
      code: "PED-772",
      account: "Cerámica del Bajío",
      owner: "Horno",
      status: "open",
      checks: [
        {
          id: "bitacora",
          title: es ? "Anotar la bitácora" : "Write the log",
          status: es ? "Abierto" : "Open",
          owner: "Horno",
          date: es ? "3 nov" : "3 Nov",
          comment: "bitacora/horno-2.txt",
        },
      ],
    }),
    order(locale, {
      id: "ped-641",
      code: "PED-641",
      account: es ? "Tienda de Celaya" : "Celaya shop",
      owner: "Bruma",
      status: "late",
      checks: [
        {
          id: "pago",
          title: es ? "Falta el complemento" : "The balance is still due",
          status: es ? "Tarde" : "Late",
          owner: "Caja",
          date: es ? "1 nov" : "1 Nov",
          comment: "$4,200.00 MXN",
        },
      ],
    }),
    order(locale, {
      id: "ped-510",
      code: "PED-510",
      account: "Cerámica del Bajío",
      owner: "Caja",
      status: "done",
      checks: [
        {
          id: "archivo",
          title: es ? "Pedido archivado" : "Order filed",
          status: es ? "Listo" : "Done",
          owner: "Caja",
          date: es ? "12 oct" : "12 Oct",
        },
      ],
    }),
  ]
}

export function nestedRows(locale: SceneLocale): OrderRow[] {
  const es = locale === "es"
  return [
    order(locale, {
      id: "ped-1048",
      code: "PED-1048",
      account: "Cerámica del Bajío",
      owner: "Caja",
      status: "open",
      lines: [
        { id: "platos", kind: "line", name: es ? "Platos hondos" : "Deep plates", qty: "20", price: "$420.00", amount: "$8,400.00" },
        { id: "tazas", kind: "line", name: es ? "Tazas de cobalto" : "Cobalt cups", qty: "40", price: "$180.00", amount: "$7,200.00" },
        { id: "sub", kind: "subtotal", name: es ? "Subtotal" : "Subtotal", qty: "", price: "", amount: "$15,600.00" },
        { id: "empaque", kind: "line", name: es ? "Empaque para León" : "Packing for León", qty: "1", price: "$2,800.00", amount: "$2,800.00" },
        { id: "total", kind: "total", name: es ? "Total del pedido" : "Order total", qty: "", price: "", amount: "$18,400.00 MXN" },
      ],
    }),
    order(locale, {
      id: "ped-990",
      code: "PED-990",
      account: "Cerámica del Bajío",
      owner: "Bruma",
      status: "late",
      lines: [
        { id: "nota", kind: "line", name: es ? "Nota de esmalte" : "Glaze note", qty: "1", price: "$0.00", amount: "$0.00" },
        { id: "total", kind: "total", name: es ? "Total" : "Total", qty: "", price: "", amount: "$0.00 MXN" },
      ],
    }),
  ]
}

export function taskRows(locale: SceneLocale): OrderRow[] {
  const es = locale === "es"
  const leaf = (id: string, code: string, owner: string, status: OrderRow["status"]): OrderRow =>
    order(locale, { id, code, account: "Cerámica del Bajío", owner, status })
  return [
    order(locale, {
      id: "horno",
      code: es ? "Preparar el horno 2" : "Prepare kiln 2",
      account: "PED-1048",
      owner: "Horno",
      status: "late",
      subRows: [
        order(locale, {
          id: "termopar",
          code: es ? "Revisar el termopar" : "Check the thermocouple",
          account: "PED-1048",
          owner: "Horno",
          status: "open",
          subRows: [leaf("lectura", es ? "Anotar la lectura de las 6" : "Write down the 6 a.m. reading", "Horno", "open")],
        }),
        leaf("aviso", es ? "Avisar a Mariana Ruiz" : "Tell Mariana Ruiz", "Bruma", "open"),
      ],
    }),
    order(locale, {
      id: "empaque",
      code: es ? "Empacar PED-1048" : "Pack PED-1048",
      account: "Cerámica del Bajío",
      owner: "Caja",
      status: "open",
      subRows: [leaf("contar", es ? "Contar los platos" : "Count the plates", "Caja", "done")],
    }),
  ]
}

export function orderColumns(locale: SceneLocale): ExpandableColumn<OrderRow>[] {
  const es = locale === "es"
  return [
    { id: "code", header: es ? "Pedido" : "Order", cell: (row) => row.code },
    { id: "account", header: es ? "Cuenta" : "Account", cell: (row) => row.account },
    { id: "owner", header: es ? "Responsable" : "Owner", cell: (row) => row.owner },
    { id: "status", header: es ? "Estado" : "Status", cell: (row) => row.statusLabel },
  ]
}

export function orderFilter(locale: SceneLocale): ExpandableFilter<OrderRow> {
  const es = locale === "es"
  return {
    id: "status",
    label: es ? "Estado" : "Status",
    all: es ? "Todos" : "All",
    options: [
      { value: "open", label: statusLabel[locale].open },
      { value: "late", label: statusLabel[locale].late },
      { value: "done", label: statusLabel[locale].done },
    ],
    predicate: (row, value) => row.status === value,
  }
}

export function orderActions(locale: SceneLocale): ExpandableAction[] {
  const es = locale === "es"
  return [
    { id: "open", label: es ? "Abrir el pedido" : "Open the order" },
    { id: "note", label: es ? "Anotar" : "Add a note" },
  ]
}

export function tableLabels(locale: SceneLocale): Partial<ExpandableTableLabels> {
  if (locale === "en") return {}
  return {
    expand: (title) => `Abrir ${title}`,
    collapse: (title) => `Cerrar ${title}`,
    expandAll: "Abrir todas",
    collapseAll: "Cerrar todas",
    search: "Buscar",
    density: "Densidad",
    regular: "Regular",
    compact: "Compacta",
    subtasks: "Mostrar subtareas",
    select: (title) => `Seleccionar ${title}`,
    selectPage: "Seleccionar las filas de esta página",
    actions: (title) => `Acciones de ${title}`,
    previous: "Página anterior",
    next: "Página siguiente",
    page: (current, total) => `Página ${current} de ${total}`,
    empty: "No hay filas.",
    noMatches: "Nada coincide.",
    loading: "Cargando la tabla",
    rows: (count) => `${count} seleccionadas`,
  }
}

export const checklistCaption = { es: "Tareas del pedido", en: "Order tasks" }
export const linesCaption = { es: "Partidas del pedido", en: "Order lines" }

export type TableSceneSpec = {
  mode: "checks" | "lines" | "tasks"
  empty?: boolean
  loading?: boolean
  fail?: boolean
  openId?: string
  all?: boolean
}

export const filled: TableSceneSpec = { mode: "checks", openId: "ped-1048" }
export const empty: TableSceneSpec = { mode: "checks", empty: true }
export const loading: TableSceneSpec = { mode: "checks", loading: true }
export const error: TableSceneSpec = { mode: "checks", fail: true }
export const nested: TableSceneSpec = { mode: "lines", openId: "ped-1048" }
export const subtasks: TableSceneSpec = { mode: "tasks" }
export const allExpanded: TableSceneSpec = { mode: "checks", all: true }
export const threeLevels: TableSceneSpec = { mode: "tasks", all: true }
