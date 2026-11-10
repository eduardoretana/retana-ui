/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { describe, expect, it } from "vitest"

import { bandejaProps } from "../src/lib/bandeja-scene"

describe("receipts fixture", () => {
  it("RECEIPTS-FIXTURE matches the React scene props", () => {
    const props = bandejaProps("receipts", "es")
    expect(props.filters.map((filter) => filter.label)).toEqual(["Todos", "Clientes", "Equipo", "Sin leer"])
    const ambar = props.conversations[0]
    expect(ambar && "channel" in ambar ? ambar.channel : undefined).toBeUndefined()
    expect(props.party.files?.map((file) => file.name)).toEqual(["corte-marca.pdf", "cronograma-v3.fig"])
    expect(props.party.members?.map((member) => member.name)).toEqual(["Marina Soler", "Diego Rueda", "Renata Vidal"])
    expect(props.party.facts?.map((fact) => fact.value)).toEqual(["10 dic", "52 h", "1"])
    expect(props.threadTitle).toBe("Taller Ámbar")
    expect(props.messages.map((message) => message.delivery)).toEqual(["sent", "delivered", "read"])
  })
})
