import path from "node:path"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

const root = path.resolve(new URL(".", import.meta.url).pathname)

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "public"],
  },
  resolve: {
    alias: [
      { find: "@/registry/retana/ui", replacement: path.join(root, "registry/ui") },
      { find: "@/registry/retana/blocks", replacement: path.join(root, "registry/blocks") },
      { find: "@/registry/retana/hooks", replacement: path.join(root, "registry/hooks") },
      { find: "@/registry/retana/lib", replacement: path.join(root, "registry/lib") },
      { find: "@", replacement: root },
    ],
  },
})
