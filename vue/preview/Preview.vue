<script setup lang="ts">
import DecisionInbox from "../src/decision-inbox/DecisionInbox.vue"
import LightboxGallery from "../src/lightbox/LightboxGallery.vue"
import { inboxModel, lightboxModel, timeOffProps, type SceneLocale } from "../src/lib/scene"
import TimeOffStats from "../src/time-off-stats/TimeOffStats.vue"

defineProps<{
  piece: string
  scene: string
  locale: SceneLocale
}>()
</script>

<template>
  <div class="retana" :data-retana-scene="scene" style="padding: 12px">
    <TimeOffStats v-if="piece === 'time-off-stats'" v-bind="timeOffProps(scene, locale)" />
    <DecisionInbox v-else-if="piece === 'decision-inbox'" v-bind="inboxModel(scene, locale)" />
    <LightboxGallery v-else v-bind="lightboxModel(scene, locale)" />
  </div>
</template>
