# Familia de la bandeja de mensajes

Fuente: concepto visual de Divan Raj (@desdivj), <https://x.com/desdivj/status/2119738295039250507>.

Licencia: sin licencia, clean-room. No se copiaron assets, logos, ilustraciones ni textos. Los nombres, montos y documentos de la demo son ficticios.

La familia no trae tema. El único acento es el token `primary` del anfitrión (el mismo que ya usa la lista de encargos para lo no leído). La tinta de la burbuja propia y del botón de enviar es `foreground`. `--accent` en este catálogo es una superficie quieta, no la señal.

No hay cliente de Supabase. Los datos entran por props. El canal, la etapa del embudo y la ventana cerrada son etiquetas y un bloqueo genérico: la escena Cenit los llena, el núcleo no conoce WhatsApp.

## Reusar / extender / nueva

| Pieza del brief | Decisión | En el catálogo | Por qué |
| --- | --- | --- | --- |
| app-rail | Nueva | `app-rail` | No había un riel de iconos de 56 px. |
| page-header | Nueva, sin tocar la existente | `inbox-page-header` | `page-header` es el encabezado de proyecto (issues, archivos, hitos). |
| conversation-list | Nueva | `conversation-list` | `inbox-list` es la fila de un encargo. Esta añade secciones, filtro y la fila redondeada. Reutiliza `foldInboxText`. |
| conversation-item | Nueva | `conversation-item` | La fila, con ranura de canal, etapa y ventana. |
| segmented-filter | Extiende | `segmented-filter` | Envuelve `segmented-control` y sube el objetivo a 44 px. |
| chat-thread | Nueva | `chat-thread` | `message-list` es el scroll de un chat de modelo. |
| message-bubble | Nueva | `message-bubble` | `chat-message` es la burbuja de asistente (copiar, regenerar). Aquí la tinta es `foreground` y el acuse es enviado / entregado / leído. |
| message-card-file | Nueva | `message-card-file` | Archivo con estado de validación opcional. El chip de adjunto del compositor reutiliza `attachment-chip`. |
| message-card-invoice | Nueva | `message-card-invoice` | Monto y vencimiento. Una cotización es el mismo componente con otro título. |
| message-card-metric | Nueva | `message-card-metric` | Barra en píldoras. No reutiliza `Progress` porque el indicador del primitivo anima todas las propiedades. |
| typing-indicator | Extiende | `typing-indicator` | Con `names` dibuja avatar y puntos sin `PresenceProvider`. Sin `names`, el contrato anterior sigue igual. |
| suggested-replies | Nueva | `suggested-replies` | `prompt-suggestions` no promete que nada se envíe solo ni escalona la entrada. |
| composer | Nueva | `thread-composer` | `chat-composer` para el modelo y `reply-composer` para la mesa. Este añade «Preguntar a IA» y la ventana cerrada. |
| contact-panel | Nueva, sin tocar la existente | `party-panel` | `contact-panel` es la ficha de mesa con pestaña de copiloto. |
| inbox-crm | Nueva | `inbox-crm` | `agent-inbox` es trabajo de fondo del taller. `support-inbox` y `ticket-desk` son la mesa de encargos. |

Avatar, badge, botón, esqueleto y el foco usan los primitivos del anfitrión. Si `shadcn add` pregunta si debe sobrescribirlos, la respuesta es no.

## Contrato

- Lista: `role="listbox"` y `role="option"`. ⌘K o Ctrl+K enfoca la búsqueda. ↑ y ↓ mueven la selección. Enter abre.
- Hilo: `role="log"` y `aria-live="polite"`.
- Sugerencia: `onSuggestion` llena el borrador. `onSend` no se llama.
- Ventana cerrada: `locked` desactiva el campo y el envío. La acción llama `onUseTemplate`.
- Campo sensible: nace enmascarado. «Mostrar» revela y llama `onReveal(id)`. El valor no viaja en el callback.
- Responsive: por debajo de 1280 px la ficha es un drawer y Esc lo cierra. Por debajo de 1024 px el riel se oculta. Por debajo de 640 px se ve una columna, con Volver.
- Movimiento: el mensaje entrante sube 8 px con opacidad en 200 ms, ease-out. Los chips esperan 50 ms entre sí. Solo opacidad y transform. `prefers-reduced-motion` lo apaga. El zoom del video no está.

## Escena Cenit

`/examples/inbox-crm?scene=cenit` usa las mismas piezas con copy de un crédito ficticio: canal, etapa, nota de voz con transcripción, cotización, cita, documento en revisión y CURP/NSS de demostración enmascarados. No es lógica de WhatsApp dentro del núcleo.
