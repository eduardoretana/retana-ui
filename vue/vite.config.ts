import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import react from "@vitejs/plugin-react"
import tailwind from "@tailwindcss/vite"

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const vueModules = path.join(repo, "vue/node_modules")
const rootModules = path.join(repo, "node_modules")

export default defineConfig({
  root: repo,
  plugins: [
    {
      name: "raw-razor",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split("?")[0] ?? ""
          if (!url.startsWith("/hosts/razor/") || !url.endsWith(".html")) return next()
          res.setHeader("content-type", "text/html; charset=utf-8")
          res.end(readFileSync(path.join(repo, url)))
        })
      },
    },
    vue(),
    react(),
    tailwind(),
  ],
  resolve: {
    alias: [
      { find: "@", replacement: repo },
      { find: "vue", replacement: path.join(vueModules, "vue") },
      { find: "reka-ui", replacement: path.join(vueModules, "reka-ui") },
      { find: "vuetify/components", replacement: path.join(vueModules, "vuetify/lib/components/index.js") },
      { find: "vuetify/styles", replacement: path.join(vueModules, "vuetify/lib/styles/main.css") },
      { find: /^vuetify$/, replacement: path.join(vueModules, "vuetify/lib/framework.js") },
      { find: "@mdi/font", replacement: path.join(vueModules, "@mdi/font") },
      { find: "react/jsx-dev-runtime", replacement: path.join(rootModules, "react/jsx-dev-runtime") },
      { find: "react/jsx-runtime", replacement: path.join(rootModules, "react/jsx-runtime") },
      { find: "react-dom/client", replacement: path.join(rootModules, "react-dom/client") },
      { find: "react-dom", replacement: path.join(rootModules, "react-dom") },
      { find: "react", replacement: path.join(rootModules, "react") },
      { find: "lucide-react", replacement: path.join(rootModules, "lucide-react") },
      { find: "radix-ui", replacement: path.join(rootModules, "radix-ui") },
      { find: "cn", replacement: path.join(rootModules, "cn") },
      { find: "class-variance-authority", replacement: path.join(rootModules, "class-variance-authority") },
    ],
  },
  server: { fs: { allow: [repo] } },
})
