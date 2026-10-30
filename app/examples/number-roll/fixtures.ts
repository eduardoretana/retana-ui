export type BalanceCopy = { es: string; en: string }

export type BalanceFixture = {
  value: number
  label: BalanceCopy
  hint: BalanceCopy
}

/** A fictional kiln workshop. Not a real ledger. */
export const filled: BalanceFixture = {
  value: 18640.5,
  label: { es: "Saldo del taller", en: "Workshop balance" },
  hint: { es: "Esta semana", en: "This week" },
}

export const empty: BalanceFixture = {
  value: 0,
  label: { es: "Sin movimientos", en: "No activity" },
  hint: { es: "El horno todavía no anota", en: "The kiln has not logged anything yet" },
}

/** Shown while the ledger request is in flight. */
export const loading: BalanceFixture = {
  ...filled,
  value: 0,
  label: { es: "Leyendo el saldo", en: "Reading the balance" },
}

/** What a retry would reveal. The scene starts before this arrives. */
export const error: BalanceFixture = filled

export function add(fixture: BalanceFixture, delta: number): BalanceFixture {
  return { ...fixture, value: Math.round((fixture.value + delta) * 100) / 100 }
}
