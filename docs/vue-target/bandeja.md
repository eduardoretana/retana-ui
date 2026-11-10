# Target Vue de la bandeja

No hay SFC en este corte. El piloto de tokens (`docs/plans/plan-piloto-vue.md` en el PR #86, rama `cursor/piloto-vue-tokens-5483`) aún no está en CPL. Cuando se porte, cada pieza vive en `vue/src/<nombre>/` como un SFC escrito a mano, con clases `rt:` y la raíz `.retana`. Los nombres de token son los de `tokens/retana.tokens.json` de ese piloto: el host sustituye el valor y conserva la clave.

Este documento no copia código de `eduardoretana/canal-semilla`. El puente a Vuetify 3.13 sigue siendo opt-in, como en `docs/vue/vuetify.md` de ese piloto: `--primary` apunta a `rgb(var(--v-theme-primary))` y `--foreground` a `rgb(var(--v-theme-on-background))`. La burbuja propia usa `foreground`. El acento único usa `primary`.

| React | SFC previsto | Props | Emits |
| --- | --- | --- | --- |
| `AppRail` | `vue/src/app-rail/AppRail.vue` | `label`, `mark`, `items`, `workspaces`, `user`, `status` | `select`, `workspace`, `settings` |
| `InboxPageHeader` | `vue/src/inbox-page-header/InboxPageHeader.vue` | `crumbs`, `title`, `subtitle`, `actions`, `bellLabel`, `bellCount`, `status` | `action`, `bell` |
| `SegmentedFilter` | `vue/src/segmented-filter/SegmentedFilter.vue` | `label`, `options`, `value`, `status` | `update:value` |
| `ConversationItem` | `vue/src/conversation-item/ConversationItem.vue` | `item`, `selected`, `status` | `select` |
| `ConversationList` | `vue/src/conversation-list/ConversationList.vue` | `label`, `items`, `sections`, `filters`, `filter`, `selectedId`, `status` | `select`, `update:filter`, `update:query` |
| `MessageBubble` | `vue/src/message-bubble/MessageBubble.vue` | `side`, `author`, `time`, `delivery`, `deliveryLabel`, `grouped`, `enter` | `retry` |
| `MessageCardFile` | `vue/src/message-card-file/MessageCardFile.vue` | `name`, `detail`, `status`, `state` | `download` |
| `MessageCardInvoice` | `vue/src/message-card-invoice/MessageCardInvoice.vue` | `title`, `amount`, `due`, `state` | — |
| `MessageCardMetric` | `vue/src/message-card-metric/MessageCardMetric.vue` | `title`, `chip`, `value`, `caption`, `filled`, `total`, `start`, `end`, `state` | — |
| `TypingIndicator` | `vue/src/typing-indicator/TypingIndicator.vue` | `names`, `label`, `dots`, `avatar` | — |
| `SuggestedReplies` | `vue/src/suggested-replies/SuggestedReplies.vue` | `label`, `items`, `status` | `approve` |
| `ThreadComposer` | `vue/src/thread-composer/ThreadComposer.vue` | `modelValue`, `placeholder`, `locked`, `offline`, `status` | `update:modelValue`, `send`, `ask`, `attach`, `use-template` |
| `PartyPanel` | `vue/src/party-panel/PartyPanel.vue` | `name`, `meta`, `deal`, `facts`, `members`, `files`, `secrets`, `state` | `reveal`, `download`, `action` |
| `ChatThread` | `vue/src/chat-thread/ChatThread.vue` | `label`, `title`, `status`, `messages`, `typing`, `state` | `retry-message` |
| `InboxCrm` | `vue/src/inbox-crm/InboxCrm.vue` | las props del bloque, incluido `layout` | `select`, `send`, `suggestion`, `ask`, `use-template`, `reveal`, `retry`, `retry-message` |

Los emits conservan el significado de los callbacks de React: `suggestion` no envía, `reveal` recibe solo el id, y `use-template` es la única salida cuando `locked` está puesto.

Tokens DTCG compartidos con el piloto: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--muted`, `--muted-foreground`, `--border`, `--card`, `--popover`, `--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--destructive`, `--ring`, `--radius`.

El host de Cenit, si carga el puente, no necesita Tailwind. Los iconos entran por slot o por una clase, igual que en el piloto: la pieza Vue no importa `lucide`.

## Hecho en el port

Las 15 piezas están en `vue/src/<nombre>/`. La raíz lleva `.retana` y clases `rt:`. El color sale de `var(--*)`. Ningún SFC importa Vuetify: el puente es opt-in.

`vue/src/vuetify/theme.ts` arma `createVuetify` en claro y oscuro desde `tokens/retana.tokens.json`, y sustituye `primary` por el oklch de `.ae-ember` en `app/globals.css` (el mismo host de la captura React). El puente sigue apuntando `--primary` a `rgb(var(--v-theme-primary))`. `primary` es el acento único. Los defaults piden densidad `comfortable` y radio `lg`. Esos defaults aplican a componentes de Vuetify del host; las piezas no los usan.

La presencia en línea usa `var(--success, var(--chart-2))`, igual que React. El generador escribe `--success: rgb(var(--v-theme-success))` en `tokens/bridge.css`. La demo convierte el oklch de `app/globals.css` al rol `success` de Vuetify.

`segmented-filter` no parte la etiqueta. La pista hace scroll horizontal, el botón no se encoge y el texto queda en una sola línea. Si sobra contenido, los extremos se desvanecen con una máscara.

Voz, cotización, cita y documento no son piezas nuevas. La nota de voz y la cita usan `note`. La cotización usa `message-card-invoice`. El documento con estado de validación usa `message-card-file`. React ya hace lo mismo con props genéricas. No hay dominio de WhatsApp en el núcleo: el canal y la etapa llegan como texto.

Los chips emiten `approve` o, en el bloque, `suggestion`. No existe un emit `send` en esa pieza. Con la ventana cerrada las dos implementaciones ocultan los chips: el campo y el envío quedan inactivos y la única salida es `use-template`. Mostrarlos deshabilitados no aporta un nombre accesible nuevo, porque el aviso y «Usar plantilla» ya están en el compositor.

`channel` en Vue es un string. En React es un nodo. El slot `channel` cubre el caso de un nodo.

## Qué se deduplica cuando entre el #86

Estos archivos se copiaron idénticos de `cursor/piloto-vue-tokens-5483` y el merge no debería tocarlos:

- `vue/package.json` salvo el script `typecheck` y `vue-tsc`
- `vue/vite.config.ts`, `vue/vitest.config.ts`, `vue/NOTICE`, `vue/pnpm-lock.yaml`
- `vue/scripts/build-css.mjs`, `build-tokens.mjs`, `build-manifest.mjs`, `capturar.mjs`
- `vue/src/styles/pilot.input.css`, `vue/src/icons/RetanaIcon.vue`
- `tokens/*`, `docs/vue/vuetify.md`
- la exclusión de `vue` en `tsconfig.json`, `vitest.config.mts` y `.gitignore`

Al entrar el #86 se queda una sola copia. Lo que este PR añade y no está en el piloto es `vue/src/<pieza de la bandeja>`, `vue/src/styles/inbox.css`, `vue/src/vuetify/theme.ts`, `vue/src/lib/thread.ts`, `vue/src/lib/bandeja-scene.ts`, `vue/demo/bandeja/` y `vue/tsconfig.json`. `vue/dist/pilot.css` se regenera: al unir, hay que volver a correr `vue/scripts/build-css.mjs` para que la hoja cubra las clases de los dos PR.
