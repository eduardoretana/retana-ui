# Esquema de reglas

No usa Zod. El repo no lo tenía y el núcleo queda sin dependencias. `parseRuleset` valida el JSON. La alternativa, si más adelante hace falta, es agregar `zod` al item.

## Ruleset

```json
{
  "id": "mejoravit-whatsapp",
  "accountId": "marca-sintetica",
  "version": 1,
  "name": "Mejoravit WhatsApp",
  "rules": []
}
```

## Regla

```json
{
  "id": "block-unvalidated-offer",
  "name": "Monto sin validar",
  "enabled": true,
  "kinds": ["whatsapp.before_send"],
  "conditions": { "op": "and", "conditions": [] },
  "decision": "block",
  "reasonKey": "block_unvalidated_offer",
  "approvalTtlMs": 900000
}
```

`kinds` incluye el `kind` de la acción, o `"*"` para todas. `approvalTtlMs` solo importa en `require_approval`.

`decision`: `allow`, `require_approval`, `block`, `handoff_to_human`, `log`.

Un `allow` no puede tener un AND vacío. Un `log` sí: significa “siempre”.

## Condiciones

| op | Lee | Resultado si la ruta no está |
| --- | --- | --- |
| `and` / `or` | hijos | ver la tabla de abajo |
| `not` | un hijo | `missing` si el hijo es `missing` |
| `eq` / `neq` | un escalar, sin coerción | `missing` |
| `gt` / `gte` / `lt` / `lte` | un número | `missing` si no es número |
| `in` | escalar contra una lista | `missing` |
| `includes` | arreglo de strings | `missing` si no es ese arreglo |
| `text_includes` | string. NFKC, sin caracteres de ancho cero, minúsculas es-MX | `missing` si no hay string |
| `exists` / `missing` | solo presencia | no son `missing` de evaluación: responden true o false |

AND: un hijo falso vuelve falso el grupo. Si no hay falso y hay un `missing`, el grupo es `missing`. AND vacío es verdadero.

OR: un hijo verdadero vuelve verdadero el grupo. Si no hay verdadero y hay un `missing`, el grupo es `missing`. OR vacío es falso.

`null` es un valor presente. Una ruta ausente no lo es. El texto de la acción se ve como ruta `text` cuando `data.text` no viene y `action.text` sí.

Rutas con `__proto__`, `prototype`, `constructor` o un segmento vacío no se leen.

## Kinds del preset

| Kind | Para qué |
| --- | --- |
| `whatsapp.before_send` | Borrador que el agente enviaría |
| `whatsapp.before_stage_change` | Cambio de etapa |
| `whatsapp.before_document_send` | Documento o contrato |
| `whatsapp.before_discount` | Descuento |
| `whatsapp.inbound_message` | Mensaje que llegó |
| `git.merge` | Ejemplo de otra herramienta. No es parte del preset de WhatsApp |

`mejoravitRequiredPaths` lista lo que el preset lee en cada kind de WhatsApp. Un arreglo vacío (`requestedSecrets: []`, `mentions: []`) es “no hay señal”. Omitir la clave es dato faltante y no permite seguir solo.

## Preset Mejoravit

Umbral de atorados por defecto: 4. Se copia dentro de la regla `handoff-stuck`. Etapas clave: `contrato`, `firma`, `dispersion`. Documentos: `contrato`, `pagare`, `identificacion`.

- block: prometer monto, tasa o aprobación sin `offer.validated === true`. La frase “hasta $36 mil” entra por el texto, pero solo se bloquea si el dato no está validado. Pedir o repetir NSS, CURP o contraseña de Infonavit. `topic` distinto de `mejoravit`.
- require_approval: etapa clave, documento, descuento, salida a un número con `contactInitiated: false`.
- handoff_to_human: queja, abogado o Profeco, piden una persona, `stuckCount` mayor o igual al umbral.
- log: todas las acciones.
