---
artifact_id: retana-ui-layout-motion.build-log
owner: builder
spec_version: 1.1.0
head: fe591983055c98509435159dbfd6b63962bd340b
profile: STANDARD
spec_id: retana-ui-layout-motion
ui_system: "4.0.0"
---

# Build log — retana-ui-layout-motion en #55

## needs

- `ChartKpi` acepta `figure` con el contrato de NumberRoll (`value`, `decimals`, `locale`, `prefix`, `suffix`, `hierarchy`, `announce`) más `percent` y `currency`. No se importa el rodillo.
- Barras, columnas, iso, plan, gauge, área y carriles animan `scaleX` o `scaleY`. El alto del SVG no se anima.
- No hay `transition-all` ni `clipPath` en la familia.
- La fracción usa `text-[0.65em]`. No hay un token de tipo para «la misma cifra, más chica».
- El aviso de error usa `text-foreground` y `role=alert`.
- #56 no se edita. #59 no se mezcla.

## spec_defect

Ninguno. La spec 1.1.0 describe este pase. No se aflojó una medida para hacer pasar el código.

## candidates_detected

- `number-roll`: no es candidato de este PR. Sigue en #59.
- `chart-card`: ya publicado en #55. Este pase cambia el shell y las composiciones.

## commands

La suite, Playwright y `renders.yaml` no se commitean. El gate los lee fuera del repo y deben declarar el sha del HEAD de este PR.
