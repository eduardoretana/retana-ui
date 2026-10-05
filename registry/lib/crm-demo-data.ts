/**
 * Fictional Spanish sales book for the CRM demo.
 * Names, amounts, and notes are invented. Nothing here is a real company.
 */

import type { CrmCompany, CrmNotice, CrmStatusTone } from "@/registry/retana/lib/crm-companies"

export type CrmDemoOwner = {
  id: string
  name: string
}

export const crmDemoOwners: readonly CrmDemoOwner[] = [
  { id: "elena", name: "Elena Voss" },
  { id: "diego", name: "Diego Alarcón" },
  { id: "marina", name: "Marina Soler" },
]

const MONTHS = [
  { key: "ene", label: "ene" },
  { key: "feb", label: "feb" },
  { key: "mar", label: "mar" },
  { key: "abr", label: "abr" },
  { key: "may", label: "may" },
  { key: "jun", label: "jun" },
] as const

function trend(values: readonly number[]) {
  return MONTHS.map((month, index) => ({
    key: month.key,
    label: month.label,
    value: values[index] ?? 0,
  }))
}

function company(
  id: string,
  name: string,
  status: string,
  statusLabel: string,
  statusTone: CrmStatusTone,
  ownerId: string,
  pipelineValue: number,
  score: number,
  activity: number[],
  activityLabel: string,
  industry: string,
  region: string,
  notes: string,
  series: number[],
): CrmCompany {
  const owner = crmDemoOwners.find((person) => person.id === ownerId)?.name ?? ownerId
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
  return {
    id,
    name,
    status,
    statusLabel,
    statusTone,
    owner,
    ownerId,
    pipelineValue,
    score,
    health: score,
    activity,
    activityLabel,
    industry,
    region,
    email: `hola@${slug}.example`,
    website: `https://${slug}.example`,
    notes,
    trend: trend(series),
  }
}

export const crmDemoCompanies: readonly CrmCompany[] = [
  company("valle", "Hornos del Valle", "active", "Activa", "emphasis", "elena", 186000, 82, [4, 6, 5, 8, 7, 9, 11, 10], "hoy", "Cerámica", "Oaxaca", "Retainer de hornos y fichas de producto.", [3, 4, 4, 6, 7, 8]),
  company("lince", "Papelería Lince", "lead", "Prospecto", "neutral", "diego", 42000, 61, [2, 2, 3, 3, 4, 3, 5, 4], "ayer", "Impresión", "Ciudad de México", "Pidió una muestra de empaque.", [1, 1, 2, 2, 3, 3]),
  company("ambar", "Mercado Ámbar", "active", "Activa", "emphasis", "marina", 240000, 74, [6, 5, 7, 8, 6, 9, 8, 10], "hoy", "Alimentos", "Guadalajara", "Quiere ampliar el mostrador de marzo.", [4, 5, 5, 6, 6, 8]),
  company("bruma", "Clínica Bruma", "churned", "Inactiva", "muted", "elena", 0, 28, [8, 6, 4, 3, 2, 1, 1, 0], "hace 40 días", "Salud", "Monterrey", "Pausó el acompañamiento de marca.", [6, 4, 3, 2, 1, 0]),
  company("olivo", "Radio Olivo", "lead", "Prospecto", "neutral", "diego", 15000, 55, [1, 1, 2, 2, 2, 3, 3, 4], "hace 2 días", "Medios", "Oaxaca", "Ensayo de pauta para el programa del jueves.", [1, 1, 1, 2, 2, 2]),
  company("sombra", "Taller Sombra", "active", "Activa", "emphasis", "marina", 98000, 69, [3, 4, 4, 5, 6, 5, 7, 6], "hace 4 h", "Mobiliario", "Ciudad de México", "Revisión de la silla de fresno.", [2, 3, 3, 4, 5, 5]),
  company("marea", "Editorial Marea", "active", "Activa", "emphasis", "elena", 127000, 88, [5, 6, 7, 7, 8, 9, 10, 12], "hoy", "Editorial", "Guadalajara", "Catálogo de otoño en corrección.", [4, 5, 6, 7, 8, 9]),
  company("norte", "Café Norte", "lead", "Prospecto", "neutral", "marina", 36000, 47, [1, 2, 2, 1, 3, 2, 2, 3], "hace 6 días", "Alimentos", "Monterrey", "Probó el menú de barra y pidió precios.", [1, 1, 2, 1, 2, 2]),
  company("rio", "Museo del Río", "churned", "Inactiva", "muted", "diego", 0, 22, [5, 4, 3, 2, 1, 1, 0, 0], "hace 3 meses", "Cultura", "Oaxaca", "Cerró la temporada sin renovar.", [4, 3, 2, 1, 1, 0]),
  company("lumen", "Fábrica Lumen", "active", "Activa", "emphasis", "elena", 310000, 91, [7, 8, 8, 9, 10, 11, 12, 13], "hoy", "Iluminación", "Ciudad de México", "Línea de sobremesa para dos tiendas.", [6, 7, 8, 8, 9, 11]),
  company("duna", "Agencia Duna", "lead", "Prospecto", "neutral", "marina", 54000, 63, [2, 3, 3, 4, 4, 5, 4, 6], "hace 1 día", "Estudio", "Guadalajara", "Comparte un pitch con su cliente de calzado.", [2, 2, 3, 3, 4, 4]),
  company("quietud", "Viñedo Quietud", "active", "Activa", "emphasis", "diego", 76000, 71, [3, 3, 4, 5, 5, 6, 7, 6], "hace 8 h", "Alimentos", "Monterrey", "Etiqueta de la cosecha nueva.", [2, 3, 3, 4, 5, 5]),
]

export const crmDemoNotices: readonly CrmNotice[] = [
  {
    id: "llamada",
    title: "Llamada anotada",
    description: "Elena registró una llamada con Hornos del Valle.",
    time: "hace 12 min",
    dateTime: "2026-10-05T12:00:00",
    companyId: "valle",
  },
  {
    id: "alcance",
    title: "Propuesta pedida",
    description: "Mercado Ámbar pidió el alcance de marzo.",
    time: "hace 1 h",
    dateTime: "2026-10-05T11:00:00",
    companyId: "ambar",
  },
  {
    id: "pausa",
    title: "Cuenta en pausa",
    description: "Clínica Bruma pasó a inactiva.",
    time: "ayer",
    dateTime: "2026-10-04T16:00:00",
    read: true,
    companyId: "bruma",
  },
  {
    id: "precio",
    title: "Nota de precio",
    description: "Diego ajustó el valor de Radio Olivo.",
    time: "hace 3 días",
    dateTime: "2026-10-02T15:00:00",
    read: true,
    companyId: "olivo",
  },
]
