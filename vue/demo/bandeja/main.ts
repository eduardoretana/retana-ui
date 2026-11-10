import "@mdi/font/css/materialdesignicons.css"
import "vuetify/styles"
import "../../dist/pilot.css"
import "../../../tokens/bridge.css"
import "../../src/styles/inbox-bridge.css"
import "../../src/styles/inbox.css"

import { createApp } from "vue"
import { createVuetify } from "vuetify"
import { VApp, VMain } from "vuetify/components"

import App from "./App.vue"
import { bandejaDefaults, bandejaRadius, bandejaThemes } from "../../src/vuetify/theme"

const params = new URLSearchParams(location.search)
const theme = params.get("theme") === "dark" ? "dark" : "light"
document.documentElement.lang = params.get("locale") === "en" ? "en" : "es-MX"
document.documentElement.style.setProperty("--retana-radius", bandejaRadius)

const vuetify = createVuetify({
  components: { VApp, VMain },
  theme: { defaultTheme: theme, themes: bandejaThemes },
  defaults: bandejaDefaults,
})

createApp(App).use(vuetify).mount("#app")
