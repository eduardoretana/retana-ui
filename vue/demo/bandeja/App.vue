<!--
Bandeja de conversaciones. Demo del host Vuetify.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. Datos ficticios.
-->
<script setup lang="ts">
import { computed } from "vue"

import InboxCrm from "../../src/inbox-crm/InboxCrm.vue"
import { bandejaProps } from "../../src/lib/bandeja-scene"

const params = new URLSearchParams(location.search)
const scene = params.get("scene") || "filled"
const locale = params.get("locale") === "en" ? "en" : "es"
const props = computed(() => bandejaProps(scene, locale))
</script>

<template>
  <v-app>
    <v-main style="padding: 0; height: 100%">
      <InboxCrm v-bind="props" />
    </v-main>
  </v-app>
</template>
