# Constructor de flujos — fases

P0 está en este PR. P1 y P2 no.

## Integración futura con cost-waterfall

Otra rama construye `cost-waterfall`: precio por modelo (tokens de entrada, salida y caché), agregados por paso y por modelo, y un reducer de eventos. Este PR no copia ese código ni calcula tarifas.

El executor entrega costo y tokens ya medidos. El lienzo los muestra en tablas. Cada paso emite `WorkflowStepEvent` (`step.started`, `step.completed`, `step.failed`) con `runId`, `nodeId`, `attempt`, `at` y, si el executor los mandó, `tokens` y `cost`.

Cuando `cost-waterfall` esté en CPL, el anfitrión puede pasar `onRunEvent` a ese reducer. El total por modelo sale allá. Este lienzo sigue mostrando solo lo reportado.

## P1

1. Exigir un puerto Model conectado para publicar un agente. Aceptación: sin Model, el nodo queda en error.
2. Subflujos con detección de ciclos entre documentos.
3. IF, Switch, bucle con tope y Merge.
4. Webhook, cron en America/Mexico_City con cinco fechas, y evento manual.
5. Evaluaciones sintéticas con `onRunEval`.
6. Paleta ⌘K y auto-layout deshacible.
7. Plantillas que emiten `replace` y no escriben solas.

## P2

1. Generar un parche desde texto que la persona acepta.
2. Comentarios por nodo. Presencia multiusuario solo si el anfitrión inyecta el transporte.
3. Breakpoints sobre el mismo executor.
4. Exportar TypeScript sin valores de credenciales.
5. Partículas y minimapa ya están. Siguen apagados con menos movimiento.
