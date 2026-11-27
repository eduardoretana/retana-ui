import type { CapacityZone } from "@/registry/lib/capacity-map"

function slot(id: string, label: string, status: string, detail?: string) {
  return { id, label, status, detail }
}

/** Fictional community clinic "Clínica Alameda". Cubicles and observation beds, not a car park. */
export function filledZones(): CapacityZone[] {
  return [
    {
      id: "pb",
      label: "Planta baja",
      capacity: 20,
      groups: [
        {
          id: "consulta",
          label: "Pasillo de consulta",
          columns: 6,
          slots: [
            slot("c-11", "C-11", "occupied", "Sofía Muestra"),
            slot("c-12", "C-12", "occupied", "Pablo Ejemplo"),
            slot("c-13", "C-13", "special", "Camilla accesible"),
            slot("c-14", "C-14", "exceeded", "Inés Ejemplo"),
            slot("c-15", "C-15", "free"),
            slot("c-16", "C-16", "free"),
            slot("c-21", "C-21", "occupied", "Diego Ejemplo"),
            slot("c-22", "C-22", "occupied", "Nora Muestra"),
            slot("c-23", "C-23", "free"),
            slot("c-24", "C-24", "free"),
            slot("c-25", "C-25", "special", "Aislamiento"),
            slot("c-26", "C-26", "free"),
          ],
        },
        {
          id: "observacion",
          label: "Observación",
          columns: 4,
          slots: [
            slot("o-11", "O-11", "occupied", "Luis Ejemplo"),
            slot("o-12", "O-12", "free"),
            slot("o-13", "O-13", "exceeded", "Marta Muestra"),
            slot("o-14", "O-14", "free"),
            slot("o-21", "O-21", "occupied", "Carla Ejemplo"),
            slot("o-22", "O-22", "free"),
            slot("o-23", "O-23", "free"),
            slot("o-24", "O-24", "special", "Pediátrica"),
          ],
        },
      ],
    },
    {
      id: "p1",
      label: "Primer piso",
      capacity: 16,
      groups: [
        {
          id: "sur",
          label: "Cubículos sur",
          columns: 6,
          slots: [
            slot("s-11", "S-11", "occupied", "Hugo Muestra"),
            slot("s-12", "S-12", "free"),
            slot("s-13", "S-13", "free"),
            slot("s-14", "S-14", "occupied", "Elena Ejemplo"),
            slot("s-15", "S-15", "free"),
            slot("s-16", "S-16", "free"),
            slot("s-21", "S-21", "special", "Procedimientos"),
            slot("s-22", "S-22", "occupied", "Iván Muestra"),
            slot("s-23", "S-23", "free"),
            slot("s-24", "S-24", "free"),
            slot("s-25", "S-25", "free"),
            slot("s-26", "S-26", "exceeded", "Rita Ejemplo"),
          ],
        },
        {
          id: "salas",
          label: "Salas de espera",
          columns: 2,
          slots: [
            slot("r-1", "Sala 1", "occupied", "Familia Ortega"),
            slot("r-2", "Sala 2", "free"),
            slot("r-3", "Sala 3", "free"),
            slot("r-4", "Sala 4", "occupied", "Familia Peña"),
          ],
        },
      ],
    },
  ]
}

export function longNameZones(): CapacityZone[] {
  return [
    {
      id: "z",
      label: "Planta de observación extendida para referencias clínicas compartidas",
      groups: [
        {
          id: "g",
          label: "Pasillo de espera compartida entre consultas de seguimiento",
          slots: [
            {
              id: "long",
              label: "Cubículo de observación compartida con nombre muy largo para revisar el corte",
              status: "occupied",
              detail: "Inés Ejemplo",
            },
          ],
        },
      ],
    },
  ]
}

export function stressZones(count = 500): CapacityZone[] {
  const statuses = ["free", "occupied", "special", "exceeded"] as const
  const groups = []
  let cursor = 0
  let groupIndex = 0
  while (cursor < count) {
    const take = Math.min(10, count - cursor)
    const slots = Array.from({ length: take }, (_, i) => {
      const n = cursor + i
      const status = statuses[n % statuses.length]
      return {
        id: `st-${n}`,
        label: `N-${n + 1}`,
        status,
        detail: status === "free" ? undefined : `Persona ${n + 1}`,
      }
    })
    groups.push({ id: `z0-g${groupIndex}`, label: `Pasillo ${groupIndex + 1}`, columns: 5, slots })
    cursor += take
    groupIndex += 1
  }
  return [{ id: "z0", label: "Zona 1", groups }]
}


export const filled = filledZones()
export const empty: ReturnType<typeof filledZones> = []
export const loading = filledZones()
export const error = filledZones()
