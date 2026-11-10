<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
Preguntar a IA no envía. La ventana cerrada solo ofrece una plantilla.
-->
<script setup lang="ts">
import { computed, ref } from "vue"

import type { ComposerLock } from "../lib/thread"

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  locked?: ComposerLock | null
  offline?: boolean
  disabled?: boolean
  sendLabel?: string
  askLabel?: string
  attachLabel?: string
  status?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
}>(), {
  placeholder: "Escribe un mensaje…",
  locked: null,
  offline: false,
  disabled: false,
  sendLabel: "Enviar",
  askLabel: "Preguntar a IA",
  attachLabel: "Adjuntar",
  status: "ready",
  emptyLabel: "El compositor no está disponible",
  loadingLabel: "Cargando el compositor",
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  send: [value: string]
  ask: []
  attach: [files: File[]]
  "use-template": []
}>()

const internal = ref("")
const files = ref<File[]>([])
const fileRef = ref<HTMLInputElement | null>(null)
const text = computed(() => (props.modelValue !== undefined ? props.modelValue : internal.value))
const blocked = computed(() => Boolean(props.locked) || props.offline || props.disabled)

function setText(next: string) {
  if (props.modelValue === undefined) internal.value = next
  emit("update:modelValue", next)
}

function send() {
  const trimmed = text.value.trim()
  if (blocked.value || !trimmed) return
  emit("send", trimmed)
  if (props.modelValue === undefined) internal.value = ""
  files.value = []
}

function onFile(event: Event) {
  const next = Array.from((event.target as HTMLInputElement).files ?? [])
  files.value = next
  emit("attach", next)
}
</script>

<template>
  <div v-if="status === 'loading'" class="retana skel" role="status" :aria-label="loadingLabel" style="height: 7rem" />
  <p v-else-if="status === 'error'" class="retana danger" role="alert">{{ error }}</p>
  <p v-else-if="status === 'empty'" class="retana muted" role="status">{{ emptyLabel }}</p>
  <div v-else class="retana" data-slot="thread-composer" :data-locked="locked ? 'true' : 'false'" style="display: grid; gap: 0.5rem">
    <div v-if="locked" class="lock" role="status">
      <p style="margin: 0">{{ locked.title }}</p>
      <button type="button" class="solid" @click="emit('use-template')">{{ locked.action }}</button>
    </div>
    <div v-if="files.length" style="display: flex; flex-wrap: wrap; gap: 0.5rem">
      <span v-for="file in files" :key="file.name" class="tag">{{ file.name }}</span>
    </div>
    <div class="composer">
      <div class="composer-box">
        <textarea
          :value="text"
          :placeholder="placeholder"
          :disabled="blocked"
          rows="2"
          @input="setText(($event.target as HTMLTextAreaElement).value)"
          @keydown.enter.exact.prevent="send"
        />
        <div style="display: flex; align-items: center; gap: 0.25rem; padding: 0 8px 8px">
          <button type="button" class="hit" :aria-label="attachLabel" :disabled="blocked" @click="fileRef?.click()">
            <slot name="attach-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M8 12 L16 12" />
                <path d="M14 7 L19 12 L14 17" />
                <path d="M6 6 V16 a4 4 0 0 0 8 0 V8" />
              </svg>
            </slot>
          </button>
          <input ref="fileRef" type="file" class="sr" aria-hidden="true" tabindex="-1" @change="onFile" />
          <button type="button" class="ghost" style="border: 0; color: var(--primary)" :disabled="blocked" @click="emit('ask')">
            <slot name="ask-icon">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 3 L14 9 L20 12 L14 15 L12 21 L10 15 L4 12 L10 9 Z" />
              </svg>
            </slot>
            {{ askLabel }}
          </button>
        </div>
      </div>
      <button type="button" class="send" :aria-label="sendLabel" :disabled="blocked || !text.trim()" @click="send">
        <slot name="send-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M4 12 L20 5 L13 20 L11 13 Z" />
          </svg>
        </slot>
      </button>
    </div>
  </div>
</template>

<style src="../styles/inbox.css"></style>
