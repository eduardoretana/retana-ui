<script setup lang="ts">
import DecisionInbox from "../src/decision-inbox/DecisionInbox.vue"
import LightboxGallery from "../src/lightbox/LightboxGallery.vue"
import { inboxModel, lightboxModel, timeOffProps } from "../src/lib/scene"
import TimeOffStats from "../src/time-off-stats/TimeOffStats.vue"

const inbox = inboxModel("filled", "es")
</script>

<template>
  <v-app>
    <v-main style="padding: 16px">
      <div class="retana" style="display: flex; flex-direction: column; gap: 16px">
        <TimeOffStats v-bind="timeOffProps('filled', 'es')" />
        <DecisionInbox v-bind="inbox" answered-icon="mdi-check" />
        <LightboxGallery
          v-bind="lightboxModel('filled', 'es')"
          close-icon="mdi-close"
          previous-icon="mdi-chevron-left"
          next-icon="mdi-chevron-right"
          zoom-in-icon="mdi-plus"
          zoom-out-icon="mdi-minus"
        />
      </div>
    </v-main>
  </v-app>
</template>
