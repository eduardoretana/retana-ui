export type BentoIconName = "flame" | "drops" | "box" | "frames"

export type BentoSizeName = "sm" | "wide" | "tall" | "lg"

export type BentoCellCopy = {
  id: string
  title: string
  description: string
  cta?: string
  href?: string
  span: { col: number; row: number }
  /** When set, the cell and the card use this preset instead of `span`. */
  size?: BentoSizeName
  /** Sketch id when `id` is unique but the drawing is shared. */
  sketch?: string
  icon: BentoIconName
  media: boolean
}

export type BentoLocaleCopy = {
  cells: BentoCellCopy[]
  emptyLabel: string
  loadingLabel: string
  errorLabel: string
}

const token = "Y".repeat(60)

const wallEs: BentoCellCopy[] = [
  {
    id: "horno",
    title: "Horno norte",
    description: "El calendario de quemas de la semana, con el turno de la mañana ya apartado.",
    cta: "Ver agenda",
    href: "#horno",
    span: { col: 2, row: 2 },
    icon: "flame",
    media: true,
  },
  {
    id: "esmalte",
    title: "Bitácora de esmalte",
    description: "Pruebas que salieron del taller.",
    cta: "Abrir notas",
    href: "#esmalte",
    span: { col: 1, row: 1 },
    icon: "drops",
    media: true,
  },
  {
    id: "empaque",
    title: "Carril de empaque",
    description: "Cajas listas y el orden de salida.",
    cta: "Revisar cajas",
    href: "#empaque",
    span: { col: 1, row: 2 },
    icon: "box",
    media: true,
  },
  {
    id: "muro",
    title: "Muro de galería",
    description: "Piezas que están en exhibición.",
    cta: "Recorrer",
    href: "#muro",
    span: { col: 1, row: 1 },
    icon: "frames",
    media: true,
  },
]

const wallEn: BentoCellCopy[] = [
  {
    id: "horno",
    title: "North kiln",
    description: "This week's firing calendar, with the morning shift already booked.",
    cta: "View schedule",
    href: "#horno",
    span: { col: 2, row: 2 },
    icon: "flame",
    media: true,
  },
  {
    id: "esmalte",
    title: "Glaze log",
    description: "Tests that left the studio.",
    cta: "Open notes",
    href: "#esmalte",
    span: { col: 1, row: 1 },
    icon: "drops",
    media: true,
  },
  {
    id: "empaque",
    title: "Packing lane",
    description: "Boxes ready and the order they go out.",
    cta: "Check boxes",
    href: "#empaque",
    span: { col: 1, row: 2 },
    icon: "box",
    media: true,
  },
  {
    id: "muro",
    title: "Gallery wall",
    description: "Pieces on show right now.",
    cta: "Walk through",
    href: "#muro",
    span: { col: 1, row: 1 },
    icon: "frames",
    media: true,
  },
]

function pack(cells: BentoCellCopy[], locale: "es" | "en"): BentoLocaleCopy {
  if (locale === "en") {
    return {
      cells,
      emptyLabel: "Nothing on the wall yet.",
      loadingLabel: "Loading the studio wall…",
      errorLabel: "The wall could not be loaded. Try again.",
    }
  }
  return {
    cells,
    emptyLabel: "Todavía no hay piezas en el muro.",
    loadingLabel: "Cargando el muro del taller…",
    errorLabel: "No se pudo cargar el muro. Inténtalo de nuevo.",
  }
}

/** Four cells, mixed spans, illustration and CTA. */
export const filled = { es: pack(wallEs, "es"), en: pack(wallEn, "en") }

/** No cells. */
export const empty = {
  es: pack([], "es"),
  en: pack([], "en"),
}

/** Same wall, shown after the skeleton. */
export const loading = filled

/** Same wall, the grid shows the alert instead. */
export const error = filled

/** Title that runs long, plus a 60-character token. */
export const long = {
  es: pack(
    [
      {
        ...wallEs[0]!,
        title: `Calendario de quemas del horno norte cuando el turno ya está apartado ${token}`,
        description: "El texto largo se queda en el nombre del enlace y se parte en cualquier carácter.",
      },
    ],
    "es",
  ),
  en: pack(
    [
      {
        ...wallEn[0]!,
        title: `North kiln firing calendar once the morning shift is booked ${token}`,
        description: "The long text stays in the link name and wraps at any character.",
      },
    ],
    "en",
  ),
}

/** The realistic mix: 2×2, 1×1, 1×2 and 1×1. */
export const mixed = filled

/** One 2×2 cell and nothing beside it. */
export const single = {
  es: pack([{ ...wallEs[0]!, span: { col: 2, row: 2 } }], "es"),
  en: pack([{ ...wallEn[0]!, span: { col: 2, row: 2 } }], "en"),
}

/** The kiln card without a call to action. */
export const noCta = {
  es: pack([{ ...wallEs[0]!, cta: undefined, href: "#horno" }], "es"),
  en: pack([{ ...wallEn[0]!, cta: undefined, href: "#horno" }], "en"),
}

/** The kiln card without an illustration. */
export const noMedia = {
  es: pack([{ ...wallEs[0]!, media: false }], "es"),
  en: pack([{ ...wallEn[0]!, media: false }], "en"),
}

const sizeSpan = {
  sm: { col: 1, row: 1 },
  wide: { col: 2, row: 1 },
  tall: { col: 1, row: 2 },
  lg: { col: 2, row: 2 },
} as const

function sized(source: BentoCellCopy, size: BentoSizeName, patch?: Partial<BentoCellCopy>): BentoCellCopy {
  return { ...source, ...patch, sketch: source.id, size, span: sizeSpan[size] }
}

/** One compact cell. */
export const sizeSm = {
  es: pack([sized(wallEs[1]!, "sm")], "es"),
  en: pack([sized(wallEn[1]!, "sm")], "en"),
}

/** One wide cell. The drawing sits beside the copy when the cell is actually wide. */
export const sizeWide = {
  es: pack([sized(wallEs[2]!, "wide")], "es"),
  en: pack([sized(wallEn[2]!, "wide")], "en"),
}

/** One tall cell. The drawing uses the height when the cell is actually tall. */
export const sizeTall = {
  es: pack([sized(wallEs[3]!, "tall")], "es"),
  en: pack([sized(wallEn[3]!, "tall")], "en"),
}

/** One large cell. */
export const sizeLg = {
  es: pack([sized(wallEs[0]!, "lg")], "es"),
  en: pack([sized(wallEn[0]!, "lg")], "en"),
}

/**
 * All four presets, in an order that tiles the track without dense packing.
 * At 4 columns this is 3 rows: lg, tall, sm, sm, wide, wide.
 * At 2 columns (30rem until 56rem) the same order still fills: the large and
 * wide cells take the full width, and the two compact cells sit beside the tall one.
 */
export const presets = {
  es: pack(
    [
      sized(wallEs[0]!, "lg"),
      sized(wallEs[3]!, "tall"),
      sized(wallEs[1]!, "sm"),
      sized(wallEs[1]!, "sm", {
        id: "esmalte-sabado",
        title: "Esmalte del sábado",
        description: "La prueba que sigue en el anaquel.",
        href: "#esmalte-sabado",
      }),
      sized(wallEs[2]!, "wide"),
      sized(wallEs[2]!, "wide", {
        id: "salida",
        title: "Salida de cajas",
        description: "El orden en que dejan el taller.",
        href: "#salida",
      }),
    ],
    "es",
  ),
  en: pack(
    [
      sized(wallEn[0]!, "lg"),
      sized(wallEn[3]!, "tall"),
      sized(wallEn[1]!, "sm"),
      sized(wallEn[1]!, "sm", {
        id: "esmalte-sabado",
        title: "Saturday glaze",
        description: "The test still on the shelf.",
        href: "#esmalte-sabado",
      }),
      sized(wallEn[2]!, "wide"),
      sized(wallEn[2]!, "wide", {
        id: "salida",
        title: "Box run",
        description: "The order they leave the studio.",
        href: "#salida",
      }),
    ],
    "en",
  ),
}
