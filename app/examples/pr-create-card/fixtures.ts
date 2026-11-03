import type { CommitNode, PrCreateCardProps } from "@/registry/ui/pr-create-card"
import { prCreateCardLabels, prCreateCardLabelsEs } from "@/registry/ui/pr-create-card"

export type PrFixture = {
  props: Omit<PrCreateCardProps, "labels" | "variant">
  es: typeof prCreateCardLabelsEs
  en: typeof prCreateCardLabels
}

const commits: CommitNode[] = [
  {
    sha: "b7e21aa",
    message: "Leer el folio desde la ficha",
    author: "Noa Ferrer",
    timeLabel: "hace 40 min",
    branches: ["feat/folio-horno"],
  },
  {
    sha: "c4d90f1",
    message: "Subir el horno de pruebas",
    author: "Sam Ríos",
    timeLabel: "hace 3 h",
    branches: ["main"],
  },
]

const base = {
  title: "Guardar el folio del horno al recargar",
  number: 42,
  diffStat: { add: 86, del: 12 },
}

export const filled: PrFixture = {
  props: { ...base, state: "open", commits, defaultOpen: true },
  es: prCreateCardLabelsEs,
  en: prCreateCardLabels,
}

export const empty: PrFixture = {
  props: { title: "Sin pull request", state: "closed", diffStat: { add: 0, del: 0 }, commits: [], defaultOpen: true },
  es: prCreateCardLabelsEs,
  en: prCreateCardLabels,
}

export const loading: PrFixture = {
  props: { ...base, state: "creating", commits: [], defaultOpen: false },
  es: prCreateCardLabelsEs,
  en: prCreateCardLabels,
}

export const error: PrFixture = {
  props: {
    ...base,
    state: "error",
    commits,
    defaultOpen: true,
    errorMessage: "El remoto rechazó la rama del horno.",
  },
  es: prCreateCardLabelsEs,
  en: prCreateCardLabels,
}

export const collapsed: PrFixture = {
  props: { ...base, state: "open", commits, defaultOpen: false },
  es: prCreateCardLabelsEs,
  en: prCreateCardLabels,
}
