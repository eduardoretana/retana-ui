const params = new URLSearchParams(location.search)
const framework = params.get("framework") === "react" ? "react" : "vue"
const piece = params.get("piece") ?? "time-off-stats"
const scene = params.get("scene") ?? "filled"
const locale = params.get("locale") === "en" ? "en" : "es"
document.documentElement.lang = locale === "en" ? "en" : "es-MX"
document.documentElement.classList.toggle("dark", params.get("theme") === "dark")

const host = document.getElementById("app")
if (!host) throw new Error("falta #app")

if (framework === "react") {
  await import("../../app/globals.css")
  const { createElement } = await import("react")
  const { createRoot } = await import("react-dom/client")
  const { ReactPreview } = await import("./react-preview")
  createRoot(host).render(createElement(ReactPreview, { piece, scene, locale }))
} else {
  const { createApp } = await import("vue")
  const { default: Preview } = await import("./Preview.vue")
  createApp(Preview, { piece, scene, locale }).mount(host)
}
