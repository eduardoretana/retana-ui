# Modelo de amenazas

Amenazas que este motor reconoce. No es una promesa de que un modelo de lenguaje obedezca.

## Evasión por texto, ofuscación y unicode

`text_includes` normaliza NFKC, quita U+200B–U+200D y U+FEFF, y compara en minúsculas es-MX. Eso atrapa “n\u200bss” contra “nss”. No atrapa un homoglifo cirílico. El preset trata el texto como señal secundaria. La decisión fuerte es el dato estructurado (`requestedSecrets`, `offer.validated`, `intent`, `mentions`). Un atacante que controla solo el texto puede esquivar el matcher. Un atacante que además puede omitir el campo estructurado no obtiene `allow`: cae en fail-closed.

## Precedencia

Si dos reglas disparan, gana `block`, luego `handoff_to_human`, luego `require_approval`, luego `allow`. El orden en el arreglo no cambia al ganador. `log` no gana nunca. Un conflicto “fuera de tema” más “número frío” termina en block, y la aprobación queda en `fired` para la traza, pero no se abre paso.

## Datos faltantes

Leer una ruta ausente (salvo `exists` / `missing`) produce `missing`. Eso nunca se resuelve como `allow`. Cae en `require_approval` con `failClosed`, a menos que un block o un handoff ya hayan disparado. Un tipo equivocado (string donde se esperaba número, arreglo que no es de strings) también es `missing`.

Por qué no es `block`: un bloqueo es una prohibición conocida. Un dato ausente es incertidumbre. Tratarlo como bloqueo enseña a ignorar los bloqueos. Por qué no es `handoff_to_human`: eso cierra el bot. Muchas ausencias son un payload incompleto del host, y un approver puede esperar el dato. La traza lista `missingPaths`.

## Conflictos entre reglas

Todas las que disparan quedan en `fired` y en la bitácora. La decisión visible es una. No hay empate silencioso.

## Replay de aprobaciones

El ticket guarda `actionHash` (FNV-1a del JSON estable; no es un secreto ni una firma). `consume` exige el mismo hash, estado `approved`, sin `consumedAt`, y `now` antes de `expiresAt`. El segundo consumo lanza `replay`. Un payload distinto no coincide. `guardAction` además exige el mismo `rulesetId` y `rulesetVersion`. Aprobar después del vencimiento lanza `expired` y el estado pasa a `expired`. Un editor no puede decidir.

Quien pueda llamar `decide` con un `Actor` approver falso se aprueba solo. Eso es del host, no del motor.

## Cruce de cuentas

Cada mapa del adaptador en memoria está partido por `accountId`. `get` de otra cuenta devuelve `null`, no el ticket. `list` de otra cuenta está vacío. `save` con un actor de otra cuenta lanza `isolation`. `evaluateRules` lanza si la cuenta del ruleset y la de la acción difieren. Los tests de `__tests__/guard-rules.test.ts` cubren esas lecturas.

El host igual puede pasar el `accountId` equivocado a `activeForAccount`. El motor no adivina la cuenta: aísla la que le piden.
