import path from "node:path"
import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
import react from "@vitejs/plugin-react"

const repo = path.resolve(import.meta.dirname, "..")
const nm = path.join(repo, "node_modules")

export default defineConfig({
  plugins: [vue(), react()],
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
    testTimeout: 400_000,
    hookTimeout: 120_000,
  },
  resolve: {
    alias: [
      { find: "@", replacement: repo },
      { find: "react/jsx-dev-runtime", replacement: path.join(nm, "react/jsx-dev-runtime") },
      { find: "react/jsx-runtime", replacement: path.join(nm, "react/jsx-runtime") },
      { find: "react-dom/client", replacement: path.join(nm, "react-dom/client") },
      { find: "react-dom", replacement: path.join(nm, "react-dom") },
      { find: "react", replacement: path.join(nm, "react") },
      { find: "lucide-react", replacement: path.join(nm, "lucide-react") },
      { find: "radix-ui", replacement: path.join(nm, "radix-ui") },
      { find: "cn", replacement: path.join(nm, "cn") },
      { find: "class-variance-authority", replacement: path.join(nm, "class-variance-authority") },
      { find: "@testing-library/react", replacement: path.join(nm, "@testing-library/react") },
      { find: "@testing-library/user-event", replacement: path.join(nm, "@testing-library/user-event") },
      { find: "@testing-library/dom", replacement: path.join(nm, "@testing-library/dom") },
    ],
  },
})
