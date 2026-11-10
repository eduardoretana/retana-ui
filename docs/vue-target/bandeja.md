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
