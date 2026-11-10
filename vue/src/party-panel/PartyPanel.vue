<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
Los campos sensibles nacen enmascarados. Mostrar emite reveal solo con el id.
-->
<script setup lang="ts">
import { ref } from "vue"

import { deskInitials, type PartyAction, type PartyDeal, type PartyFact, type PartyFile, type PartyMember, type SecretField } from "../lib/thread"

withDefaults(defineProps<{
  name?: string
  meta?: string
  actions?: readonly PartyAction[]
  deal?: PartyDeal
  facts?: readonly PartyFact[]
  members?: readonly PartyMember[]
  files?: readonly PartyFile[]
  secrets?: readonly SecretField[]
  revealLabel?: string
  downloadLabel?: string
  membersLabel?: string
  filesLabel?: string
  state?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
}>(), {
  actions: () => [],
  facts: () => [],
  members: () => [],
  files: () => [],
  secrets: () => [],
  revealLabel: "Mostrar",
  downloadLabel: "Descargar",
  membersLabel: "Miembros",
  filesLabel: "Archivos",
  state: "ready",
  emptyLabel: "Sin ficha",
  loadingLabel: "Cargando la ficha",
})

const emit = defineEmits<{
  reveal: [id: string]
  download: [id: string]
  action: [id: string]
}>()

const open = ref<Record<string, boolean>>({})

function reveal(id: string) {
  if (open.value[id]) return
  open.value = { ...open.value, [id]: true }
  emit("reveal", id)
}
</script>

<template>
  <div v-if="state === 'loading'" class="retana skel" role="status" :aria-label="loadingLabel" style="height: 12rem" />
  <p v-else-if="state === 'error'" class="retana danger" role="alert">{{ error }}</p>
  <p v-else-if="state === 'empty' || !name" class="retana muted" role="status">{{ emptyLabel }}</p>
  <aside v-else class="retana party" data-slot="party-panel">
    <div style="display: grid; justify-items: center; gap: 0.5rem; text-align: center">
      <span class="avatar-lg" aria-hidden="true">{{ deskInitials(name) }}</span>
      <h2 style="margin: 0; font-size: 1rem; line-height: 24px">{{ name }}</h2>
      <p v-if="meta" class="muted" style="margin: 0; font-size: 12px; line-height: 16px">{{ meta }}</p>
    </div>
    <div v-if="actions.length" class="party-actions" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem">
      <button
        v-for="action in actions"
        :key="action.id"
        type="button"
        class="party-action"
        style="height: 4rem; min-width: 0; border: 0; border-radius: calc(var(--radius, 0.625rem) * 1.8); background: var(--muted); color: var(--foreground); padding: 0.5rem; font-size: 12px"
        @click="emit('action', action.id)"
      >
        {{ action.label }}
      </button>
    </div>
    <section v-if="deal" style="display: grid; gap: 0.5rem; border-radius: 1rem; background: var(--muted); padding: 0.75rem">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem">
        <h3 style="margin: 0; font-size: 14px; line-height: 20px">{{ deal.title }}</h3>
        <span class="muted" style="font-size: 12px; line-height: 16px">{{ deal.status }}</span>
      </div>
      <p style="margin: 0; font-size: 14px; line-height: 20px">{{ deal.amount }}</p>
      <div role="progressbar" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="deal.value" :aria-label="deal.label" style="height: 0.5rem; overflow: hidden; border-radius: 999px; background: var(--background)">
        <div style="height: 100%; border-radius: 999px; background: var(--primary)" :style="{ width: `${Math.max(0, Math.min(100, deal.value))}%` }" />
      </div>
      <p class="muted" style="margin: 0; text-align: end; font-size: 12px; line-height: 16px">{{ deal.label }}</p>
    </section>
    <dl v-if="facts.length" style="display: grid; gap: 0.75rem; margin: 0">
      <div v-for="fact in facts" :key="fact.id" style="display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem">
        <dt class="muted" style="font-size: 12px; line-height: 16px">{{ fact.label }}</dt>
        <dd style="margin: 0; font-size: 14px; line-height: 20px; font-weight: 500">{{ fact.value }}</dd>
      </div>
    </dl>
    <div v-if="secrets.length" style="border-block: 1px solid var(--border)">
      <div v-for="field in secrets" :key="field.id" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.5rem 0">
        <span class="grow">
          <span class="muted" style="display: block; font-size: 0.75rem">{{ field.label }}</span>
          <span style="display: block" :data-revealed="open[field.id] ? 'true' : 'false'">{{ open[field.id] ? field.revealed : field.masked }}</span>
        </span>
        <button type="button" class="ghost" style="border: 0; color: var(--primary)" @click="reveal(field.id)">{{ revealLabel }}</button>
      </div>
    </div>
    <section v-if="members.length" style="display: grid; gap: 0.5rem">
      <h3 class="muted" style="margin: 0; font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase">{{ membersLabel }}</h3>
      <ul style="display: grid; gap: 0.5rem; margin: 0; padding: 0; list-style: none">
        <li v-for="member in members" :key="member.id" style="display: flex; min-height: 44px; align-items: center; gap: 0.5rem">
          <span class="avatar-sm" style="background: var(--muted); color: var(--foreground)" aria-hidden="true">{{ deskInitials(member.name) }}</span>
          <span class="grow">
            <span class="ellipsis" style="display: block; font-size: 14px; line-height: 20px; font-weight: 500">{{ member.name }}</span>
            <span class="ellipsis muted" style="display: block; font-size: 12px; line-height: 16px">{{ member.role }}</span>
          </span>
        </li>
      </ul>
    </section>
    <section v-if="files.length" style="display: grid; gap: 0.5rem">
      <h3 class="muted" style="margin: 0; font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase">{{ filesLabel }}</h3>
      <ul style="display: grid; gap: 0.5rem; margin: 0; padding: 0; list-style: none">
        <li v-for="file in files" :key="file.id" style="display: flex; min-height: 44px; align-items: center; gap: 0.5rem">
          <span class="grow">
            <span class="ellipsis" style="display: block; font-size: 14px; line-height: 20px; font-weight: 500">{{ file.name }}</span>
            <span class="ellipsis muted" style="display: block; font-size: 12px; line-height: 16px">{{ file.detail }}</span>
          </span>
          <button type="button" class="hit" :aria-label="`${downloadLabel} ${file.name}`" @click="emit('download', file.id)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 4 V16" />
              <path d="M7 12 L12 17 L17 12" />
              <path d="M5 20 H19" />
            </svg>
          </button>
        </li>
      </ul>
    </section>
  </aside>
</template>

<style src="../styles/inbox.css"></style>
