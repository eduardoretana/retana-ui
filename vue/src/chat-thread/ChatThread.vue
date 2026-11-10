<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
La nota de voz, la cita, la cotización y el documento usan props genéricas.
-->
<script setup lang="ts">
import { computed } from "vue"

import { deskInitials, groupMessages, presenceStyle, type Presence, type ThreadMessageData } from "../lib/thread"
import MessageBubble from "../message-bubble/MessageBubble.vue"
import MessageCardFile from "../message-card-file/MessageCardFile.vue"
import MessageCardInvoice from "../message-card-invoice/MessageCardInvoice.vue"
import MessageCardMetric from "../message-card-metric/MessageCardMetric.vue"
import TypingIndicator from "../typing-indicator/TypingIndicator.vue"

const props = withDefaults(defineProps<{
  label: string
  title?: string
  status?: string
  presence?: Presence
  messages?: readonly ThreadMessageData[]
  typing?: { names: readonly string[]; label?: string }
  retryLabel?: string
  state?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
}>(), {
  messages: () => [],
  retryLabel: "Reintentar",
  state: "ready",
  emptyLabel: "Aún no hay mensajes",
  loadingLabel: "Cargando el hilo",
})

const emit = defineEmits<{
  "retry-message": [id: string]
  retry: []
}>()

const grouped = computed(() => groupMessages(props.messages))
</script>

<template>
  <section class="retana" data-slot="chat-thread" style="display: flex; min-width: 0; min-height: 0; flex: 1; flex-direction: column">
    <header style="display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid var(--border); padding: 12px 4px">
      <span class="avatar" aria-hidden="true">
        {{ title ? deskInitials(title) : "?" }}
        <span v-if="presence" class="presence" :data-presence="presence" :data-token="presence === 'online' ? 'success' : undefined" :style="presenceStyle(presence)" />
      </span>
      <span class="grow">
        <span v-if="title" class="ellipsis" style="display: block; font-size: 14px; line-height: 20px; font-weight: 600">{{ title }}</span>
        <span v-if="status" class="ellipsis muted" style="display: block; font-size: 12px; line-height: 16px">{{ status }}</span>
      </span>
      <slot name="actions" />
    </header>
    <div v-if="state === 'loading'" role="status" :aria-label="loadingLabel" style="display: grid; flex: 1; gap: 0.75rem; padding: 1rem">
      <span class="skel" style="height: 3rem; width: 66%" />
      <span class="skel" style="height: 3rem; width: 50%; margin-inline-start: auto" />
    </div>
    <div v-else-if="state === 'error'" role="alert" class="card" style="display: grid; gap: 0.5rem; margin: 1rem">
      <p class="danger" style="margin: 0">{{ error }}</p>
      <button type="button" class="ghost" style="border: 0; justify-self: start; color: var(--primary)" @click="emit('retry')">{{ retryLabel }}</button>
    </div>
    <div v-else class="log" role="log" aria-live="polite" aria-relevant="additions" :aria-label="label">
      <p v-if="grouped.length === 0" class="muted">{{ emptyLabel }}</p>
      <div v-for="message in grouped" :key="message.id" style="display: grid; gap: 0.5rem">
      <MessageBubble
        v-if="message.body || message.note || message.file || message.invoice || message.metric"
        :side="message.side"
        :author="message.author"
        :time="message.time"
        :delivery="message.delivery"
        :delivery-label="message.deliveryLabel"
        :grouped="message.grouped"
        :enter="message.enter"
        :retry-label="retryLabel"
        @retry="emit('retry-message', message.id)"
      >
        <template v-if="message.body">{{ message.body }}</template>
        <template #attachment>
          <div v-if="message.note" class="card" style="max-width: 28rem; padding: 12px">
            <p style="margin: 0; font-size: 14px; line-height: 20px; font-weight: 500">{{ message.note.title }}</p>
            <p class="muted" style="margin: 0; font-size: 12px; line-height: 16px">{{ message.note.detail }}</p>
            <p v-if="message.note.body" style="margin: 8px 0 0; font-size: 14px; line-height: 20px">{{ message.note.body }}</p>
          </div>
          <MessageCardFile v-if="message.file" :name="message.file.name" :detail="message.file.detail" :status="message.file.status" />
          <MessageCardInvoice v-if="message.invoice" :title="message.invoice.title" :amount="message.invoice.amount" :due="message.invoice.due" />
          <MessageCardMetric
            v-if="message.metric"
            :title="message.metric.title"
            :chip="message.metric.chip"
            :value="message.metric.value"
            :caption="message.metric.caption"
            :filled="message.metric.filled"
            :total="message.metric.total"
            :start="message.metric.start"
            :end="message.metric.end"
          />
        </template>
      </MessageBubble>
      </div>
      <TypingIndicator v-if="typing?.names?.length" :names="typing.names" :label="() => typing?.label ?? ''" dots />
    </div>
  </section>
</template>

<style src="../styles/inbox.css"></style>
