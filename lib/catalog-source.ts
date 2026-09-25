import fs from "node:fs"
import path from "node:path"

export function readRegistrySource(filePath: string) {
  if (!filePath.startsWith("registry/") || filePath.includes("..")) {
    throw new Error(`Refusing to read outside registry/: ${filePath}`)
  }
  const relative = filePath.slice("registry/".length)
  return fs.readFileSync(path.join(process.cwd(), "registry", relative), "utf8")
}
