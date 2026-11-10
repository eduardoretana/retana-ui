<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
-->
<script setup lang="ts">
import { computed, getCurrentInstance } from "vue"

import { deskInitials } from "../lib/thread"

type Item = { id: string; label: string; icon?: string; active?: boolean }
type Space = { id: string; label: string }

const props = withDefaults(defineProps<{
  label: string
  mark?: string
  items?: readonly Item[]
  workspaces?: readonly Space[]
  user?: { name: string }
  settingsLabel?: string
  status?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
}>(), {
  mark: "R",
  items: () => [],
  workspaces: () => [],
  settingsLabel: "Ajustes",
  status: "ready",
  emptyLabel: "Sin destinos",
  loadingLabel: "Cargando el riel",
})

const emit = defineEmits<{
  select: [id: string]
  workspace: [id: string]
  settings: []
}>()

const instance = getCurrentInstance()
const showSettings = computed(() => Boolean(instance?.vnode.props?.onSettings))
</script>

<template>
  <nav class="retana inbox-rail rt:flex rt:w-14 rt:flex-col rt:bg-sidebar rt:text-sidebar-foreground" :aria-label="label" data-slot="app-rail">
    <span class="inbox-mark" aria-hidden="true">{{ mark.slice(0, 1) }}</span>
    <div v-if="status === 'loading'" class="skel hit" role="status" :aria-label="loadingLabel" />
    <p v-else-if="status === 'error'" class="danger" role="alert">{{ error }}</p>
    <p v-else-if="status === 'empty' || items.length === 0" class="muted" role="status">{{ emptyLabel }}</p>
    <template v-else>
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="hit"
        :aria-current="item.active ? 'page' : undefined"
        @click="emit('select', item.id)"
      >
        <slot name="icon" :item="item">
          <span v-if="item.icon" :class="[item.icon, 'rail-icon']" aria-hidden="true" />
          <span v-else aria-hidden="true" style="width: 1rem; height: 1rem; border: 1px solid currentColor; border-radius: 0.25rem" />
        </slot>
        <span class="sr">{{ item.label }}</span>
      </button>
    </template>
    <span style="margin-top: auto" />
    <button v-for="space in workspaces" :key="space.id" type="button" class="hit" @click="emit('workspace', space.id)">
      <span aria-hidden="true">{{ deskInitials(space.label) }}</span>
      <span class="sr">{{ space.label }}</span>
    </button>
    <button v-if="showSettings" type="button" class="hit" @click="emit('settings')">
      <span class="sr">{{ settingsLabel }}</span>
      <span aria-hidden="true" style="width: 1rem; height: 1rem; border: 1px solid currentColor; border-radius: 999px" />
    </button>
    <span v-if="user" class="avatar" style="width: 44px; height: 44px">
      <span class="sr">{{ user.name }}</span>
      <span aria-hidden="true">{{ deskInitials(user.name) }}</span>
    </span>
  </nav>
</template>

<style src="../styles/inbox.css"></style>
