# Puente opt-in a Vuetify 3.13

La app viva es `eduardoretana/canal-semilla` en `f93d77813207c979758cab3270f17ba7bac07694`. `app-aldo-pensiones` no es la app viva. Este piloto no abre un PR allí.

El host es Vue 3 + Vuetify 3.13, sin Tailwind y sin shadcn-vue. Usa `@mdi/font`. El archivo `web/src/plugins/vuetify.ts` de esa app traduce el DTCG de CENIT a colores hex del tema. Este repo no copia esa app: documenta el puente para quien quiera engancharlo.

## Cómo emite Vuetify 3.13 las variables

En el tag `v3.13.5`, `packages/vuetify/src/composables/theme.ts` recorre `theme.colors` y escribe:

```
--v-theme-<clave>: <r>,<g>,<b>
```

Son canales R,G,B separados por coma, sin espacios y sin la función. El prefijo por defecto es `v-`. El propio Vuetify los consume así:

```
rgb(var(--v-theme-primary))
```

Una variable que no es color, como `medium-emphasis-opacity`, sale como `--v-medium-emphasis-opacity`. En canal-semilla vale `0.7`.

## El puente

`tokens/bridge.css` es opt-in. No lo importa el registry ni hay que pegarlo en la app. Si el host lo carga, las piezas con prefijo `rt:` leen `var(--primary)` y ese nombre apunta a `rgb(var(--v-theme-…))`.

El `secondary` de Vuetify no es el `secondary` de RETANA. En el token-map de CENIT, el `secondary` de Vuetify es `muted-foreground`. Por eso el puente dice:

```
--muted-foreground: rgb(var(--v-theme-secondary));
--secondary: rgb(var(--v-theme-retana-secondary));
```

`border` e `input` usan la opacidad que el token-map ya describe (`0.12` y `0.5` sobre `on-surface`). `--radius` no tiene canal `--v-theme-*`: Vuetify 3.13 no emite uno. El puente deja `--radius: var(--retana-radius, 0.5rem)`.

La hoja `vue/dist/pilot.css` lleva el prefijo `rt:` y no incluye el preflight. Así no pisa el reset de `vuetify/styles` ni las clases `v-*` ni un `bg-primary` de Vuetify.

Los iconos entran por prop (`answeredIcon`, `closeIcon`, …) con una clase MDI, o por slot. La pieza no importa una librería de iconos.

## Demo

`vue/demo/` monta las tres piezas dentro de `VApp` con los hex del token-map. Esos hex viven solo en `vue/demo/cenit-theme.ts`.
