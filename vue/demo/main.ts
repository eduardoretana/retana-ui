import "@mdi/font/css/materialdesignicons.css"
import "vuetify/styles"
import "../dist/pilot.css"
import "../../tokens/bridge.css"

import { createApp } from "vue"
import { createVuetify } from "vuetify"
import { VApp, VMain } from "vuetify/components"

import App from "./App.vue"
import { cenitDefaults, cenitThemes } from "./cenit-theme"

const vuetify = createVuetify({
  components: { VApp, VMain },
  theme: { defaultTheme: "light", themes: cenitThemes },
  defaults: cenitDefaults,
})

createApp(App).use(vuetify).mount("#app")
