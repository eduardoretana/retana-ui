"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DataTableGrouping,
  DataTableGroupingMeter,
  DataTableGroupingPeople,
  DataTableGroupingRing,
  type DataTableGroupingColumn,
  type DataTableGroupingLabels,
} from "@/registry/ui/data-table-grouping"

const labels: Partial<DataTableGroupingLabels> = {
  table: "Tabla",
  groupBy: "Agrupar por",
  collapse: "Plegar",
  expand: "Desplegar",
  collapseAll: "Plegar todo",
  expandAll: "Desplegar todo",
  view: "Vista",
  columns: "Columnas",
  density: "Densidad",
  compact: "Compacta",
  comfortable: "Cómoda",
  spacious: "Amplia",
  moveLeft: "Mover a la izquierda",
  moveRight: "Mover a la derecha",
  hideColumn: "Ocultar columna",
  columnMenu: "Opciones de columna",
  selectAll: "Seleccionar todo",
  selectRow: "Seleccionar",
  selectGroup: "Seleccionar grupo",
  selected: "seleccionadas",
  rowsPerPage: "Filas por página",
  page: "Página",
  of: "de",
  previous: "Anterior",
  next: "Siguiente",
  search: "Buscar",
  emptyTitle: "Sin filas",
  emptyDescription: "Nada coincide con estos filtros.",
  loading: "Cargando filas",
  errorTitle: "No se pudieron cargar las filas",
  retry: "Reintentar",
  grandTotal: "Total",
  showDetails: "Ver detalle",
  hideDetails: "Ocultar detalle",
  filterAny: "Cualquiera",
  sortAscending: "Orden ascendente",
  sortDescending: "Orden descendente",
  clearSort: "Quitar orden",
}

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
})

function moneyCell(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—"
  return money.format(value)
}

type Piece = {
  id: string
  name: string
  stage: string
  client: string
  status: string
  people: string[]
  progress: number
  amount: number
}

const pieces: Piece[] = [
  { id: "p1", name: "Cuenco de sal", stage: "Amasado", client: "Casa Pell", status: "En curso", people: ["Nuria Cal", "Teo Bruma"], progress: 18, amount: 2400 },
  { id: "p2", name: "Jarra niebla", stage: "Torno", client: "Hostal Duna", status: "En curso", people: ["Lía Sosa"], progress: 46, amount: 3800 },
  { id: "p3", name: "Plato de marea", stage: "Torno", client: "Casa Pell", status: "En espera", people: ["Omar Pell", "Nuria Cal"], progress: 32, amount: 1600 },
  { id: "p4", name: "Taza de horno", stage: "Esmalte", client: "Mercado Norte", status: "En curso", people: ["Teo Bruma", "Lía Sosa", "Nuria Cal"], progress: 64, amount: 900 },
  { id: "p5", name: "Fuente ancha", stage: "Esmalte", client: "Hostal Duna", status: "En espera", people: ["Omar Pell"], progress: 58, amount: 5200 },
  { id: "p6", name: "Vaso de río", stage: "Cochura", client: "Casa Pell", status: "Listo", people: ["Lía Sosa", "Teo Bruma"], progress: 88, amount: 700 },
  { id: "p7", name: "Bol de ceniza", stage: "Cochura", client: "Mercado Norte", status: "En curso", people: ["Nuria Cal"], progress: 76, amount: 1100 },
  { id: "p8", name: "Bandeja litoral", stage: "Entrega", client: "Hostal Duna", status: "Listo", people: ["Omar Pell", "Lía Sosa"], progress: 100, amount: 4300 },
]

const pieceColumns: DataTableGroupingColumn<Piece>[] = [
  { accessorKey: "name", header: "Pieza" },
  { accessorKey: "stage", header: "Etapa" },
  { accessorKey: "client", header: "Cliente" },
  { accessorKey: "status", header: "Estado" },
  {
    id: "people",
    header: "Taller",
    accessorFn: (row) => row.people.join(" "),
    cell: ({ row }) => <DataTableGroupingPeople names={row.original.people} />,
  },
  {
    accessorKey: "progress",
    header: "Avance",
    cell: ({ getValue }) => <DataTableGroupingRing value={Number(getValue() ?? 0)} />,
  },
  {
    accessorKey: "amount",
    header: "Importe",
    cell: ({ getValue }) => moneyCell(getValue<number>()),
  },
]

function PipelineDemo() {
  return (
    <DataTableGrouping
      data={pieces}
      columns={pieceColumns}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      labels={labels}
      searchText={(row) => `${row.name} ${row.client} ${row.stage}`}
      searchPlaceholder="Buscar pieza o cliente"
      aggregates={{ amount: "sum", progress: "avg" }}
      align={{ amount: "end", progress: "end" }}
      defaultGroupBy="stage"
      groupCriteria={[
        { id: "stage", label: "Etapa", columnId: "stage" },
        { id: "client", label: "Cliente", columnId: "client" },
        { id: "status", label: "Estado", columnId: "status" },
        { id: "none", label: "Sin grupo", columnId: null },
      ]}
      getGroupClassName={(group) => (group.text === "Cochura" ? "bg-accent/40" : undefined)}
      filters={[
        {
          id: "status",
          label: "Estado",
          options: [
            { value: "En curso", label: "En curso" },
            { value: "En espera", label: "En espera" },
            { value: "Listo", label: "Listo" },
          ],
          predicate: (row, value) => row.status === value,
        },
      ]}
    />
  )
}

type BudgetNode = {
  id: string
  name: string
  budget: number
  used: number
  children?: BudgetNode[]
}

const budget: BudgetNode[] = [
  {
    id: "investigacion",
    name: "Investigación",
    budget: 0,
    used: 0,
    children: [
      { id: "boyas", name: "Boyas", budget: 180000, used: 96000 },
      { id: "bitacoras", name: "Bitácoras", budget: 42000, used: 40000 },
    ],
  },
  {
    id: "embarcacion",
    name: "Embarcación",
    budget: 0,
    used: 0,
    children: [
      { id: "casco", name: "Casco", budget: 260000, used: 260000 },
      { id: "combustible", name: "Combustible", budget: 80000, used: 91000 },
    ],
  },
  {
    id: "casa",
    name: "Casa del muelle",
    budget: 0,
    used: 0,
    children: [
      { id: "renta", name: "Renta del muelle", budget: 120000, used: 60000 },
      { id: "luz", name: "Luz del taller", budget: 24000, used: 18000 },
    ],
  },
]

function healthOf(used: number, budgetAmount: number) {
  if (budgetAmount <= 0) return "holgado"
  const ratio = used / budgetAmount
  if (ratio > 1) return "sobre"
  if (ratio >= 0.85) return "al limite"
  return "holgado"
}

function healthBadge(kind: string) {
  if (kind === "sobre") return <Badge variant="destructive">Sobre</Badge>
  if (kind === "al limite") return <Badge variant="outline">Al límite</Badge>
  return <Badge variant="secondary">Holgado</Badge>
}

type BudgetWalk = { original: BudgetNode; subRows: readonly BudgetWalk[] }

function rollup(row: BudgetWalk) {
  const leaves: BudgetNode[] = []
  const walk = (node: BudgetWalk) => {
    if (node.subRows.length === 0) {
      leaves.push(node.original)
      return
    }
    for (const child of node.subRows) walk(child)
  }
  walk(row)
  const budgetAmount = leaves.reduce((sum, item) => sum + item.budget, 0)
  const used = leaves.reduce((sum, item) => sum + item.used, 0)
  return { budgetAmount, used }
}

const budgetColumns: DataTableGroupingColumn<BudgetNode>[] = [
  { accessorKey: "name", header: "Partida" },
  {
    accessorKey: "budget",
    header: "Presupuesto",
    cell: ({ getValue }) => moneyCell(getValue<number>()),
  },
  {
    accessorKey: "used",
    header: "Usado",
    cell: ({ getValue }) => moneyCell(getValue<number>()),
  },
  {
    id: "usage",
    header: "Uso",
    accessorFn: (row) => (row.budget > 0 ? (row.used / row.budget) * 100 : 0),
    cell: ({ row }) => {
      const totals = rollup(row)
      if (totals.budgetAmount <= 0) return "—"
      return (
        <DataTableGroupingMeter
          value={(totals.used / totals.budgetAmount) * 100}
          label={`Uso de ${row.original.name}`}
        />
      )
    },
  },
  {
    id: "variance",
    header: "Variación",
    accessorFn: (row) => row.budget - row.used,
    cell: ({ getValue }) => moneyCell(getValue<number>()),
  },
  {
    id: "health",
    header: "Salud",
    accessorFn: (row) => healthOf(row.used, row.budget),
    cell: ({ row }) => {
      const totals = rollup(row)
      return healthBadge(healthOf(totals.used, totals.budgetAmount))
    },
  },
]

function BudgetDemo() {
  return (
    <DataTableGrouping
      data={budget}
      columns={budgetColumns}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      getSubRows={(row) => row.children}
      labels={labels}
      aggregates={{ budget: "sum", used: "sum", variance: "sum" }}
      align={{ budget: "end", used: "end", variance: "end" }}
      filters={[
        {
          id: "health",
          label: "Salud",
          options: [
            { value: "holgado", label: "Holgado" },
            { value: "al limite", label: "Al límite" },
            { value: "sobre", label: "Sobre" },
          ],
          predicate: (row, value) => (row.children?.length ? false : healthOf(row.used, row.budget) === value),
        },
      ]}
    />
  )
}

type Task = { id: string; name: string; owner: string; state: string }
type Order = { id: string; name: string; berth: string; owner: string; priority: string; due: string; tasks: Task[] }

const orders: Order[] = [
  { id: "o1", name: "Noray 4", berth: "Muelle A", owner: "Rita Sol", priority: "Alta", due: "12 mar", tasks: [
    { id: "t1", name: "Inspeccionar soldadura", owner: "Rita Sol", state: "Hecha" },
    { id: "t2", name: "Pintar corona", owner: "Iván Marea", state: "Abierta" },
  ] },
  { id: "o2", name: "Escala de gatos", berth: "Muelle A", owner: "Iván Marea", priority: "Media", due: "18 mar", tasks: [
    { id: "t3", name: "Cambiar peldaño 3", owner: "Noa Vidal", state: "Abierta" },
    { id: "t4", name: "Apretar anclajes", owner: "Iván Marea", state: "Hecha" },
  ] },
  { id: "o3", name: "Bitácora de pleamar", berth: "Caseta", owner: "Noa Vidal", priority: "Baja", due: "21 mar", tasks: [
    { id: "t5", name: "Pasar lecturas", owner: "Noa Vidal", state: "Abierta" },
  ] },
  { id: "o4", name: "Defensa del pantalán", berth: "Muelle B", owner: "Rita Sol", priority: "Alta", due: "22 mar", tasks: [
    { id: "t6", name: "Retirar defensa rota", owner: "Luz Cano", state: "Hecha" },
    { id: "t7", name: "Colocar defensa nueva", owner: "Rita Sol", state: "Abierta" },
  ] },
  { id: "o5", name: "Luz del espigón", berth: "Espigón", owner: "Luz Cano", priority: "Media", due: "2 abr", tasks: [
    { id: "t8", name: "Medir consumo", owner: "Luz Cano", state: "Abierta" },
    { id: "t9", name: "Cambiar luminaria", owner: "Iván Marea", state: "Abierta" },
  ] },
  { id: "o6", name: "Cadena del muerto", berth: "Fondeo", owner: "Noa Vidal", priority: "Alta", due: "4 abr", tasks: [
    { id: "t10", name: "Revisar grillete", owner: "Rita Sol", state: "Hecha" },
  ] },
  { id: "o7", name: "Boya 12", berth: "Canal", owner: "Iván Marea", priority: "Baja", due: "9 abr", tasks: [
    { id: "t11", name: "Limpiar valva", owner: "Noa Vidal", state: "Abierta" },
    { id: "t12", name: "Reponer reflector", owner: "Luz Cano", state: "Abierta" },
  ] },
  { id: "o8", name: "Portón del varadero", berth: "Varadero", owner: "Luz Cano", priority: "Media", due: "15 abr", tasks: [
    { id: "t13", name: "Engrasar guía", owner: "Iván Marea", state: "Hecha" },
    { id: "t14", name: "Ajustar cierre", owner: "Luz Cano", state: "Abierta" },
  ] },
]

const orderColumns: DataTableGroupingColumn<Order>[] = [
  { accessorKey: "name", header: "Orden" },
  { accessorKey: "berth", header: "Lugar" },
  { accessorKey: "owner", header: "Responsable" },
  { accessorKey: "priority", header: "Prioridad" },
  { accessorKey: "due", header: "Fecha" },
]

function OrderDetail({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Tareas de {order.name}</p>
      <Table aria-label={`Tareas de ${order.name}`}>
        <TableHeader>
          <TableRow>
            <TableHead>Tarea</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.name}</TableCell>
              <TableCell>{task.owner}</TableCell>
              <TableCell>{task.state}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function OrdersDemo() {
  return (
    <DataTableGrouping
      data={orders}
      columns={orderColumns}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      labels={labels}
      renderDetail={(row) => <OrderDetail order={row} />}
      defaultPageSize={4}
      pageSizeOptions={[4, 8]}
      searchText={(row) => `${row.name} ${row.owner} ${row.berth}`}
      filters={[
        {
          id: "priority",
          label: "Prioridad",
          options: [
            { value: "Alta", label: "Alta" },
            { value: "Media", label: "Media" },
            { value: "Baja", label: "Baja" },
          ],
          predicate: (row, value) => row.priority === value,
        },
      ]}
    />
  )
}

export function DataTableGroupingDemo() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Pipeline del obrador</h2>
        <p className="text-sm text-muted-foreground">
          Piezas ficticias del obrador Ciénaga, agrupadas por etapa. El anillo es el avance y las caras son el taller.
        </p>
        <PipelineDemo />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Presupuesto del archivo</h2>
        <p className="text-sm text-muted-foreground">
          Árbol del Archivo Litoral: cada padre suma a sus partidas y el pie fija el gran total.
        </p>
        <BudgetDemo />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Bitácora del muelle</h2>
        <p className="text-sm text-muted-foreground">
          Al desplegar una orden aparece la subtabla de tareas. Las filas se parten por página.
        </p>
        <OrdersDemo />
      </section>
    </div>
  )
}
