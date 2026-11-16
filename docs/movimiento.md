# Movimiento en Retana UI

Reglas para escribir o revisar animación en una pieza. Complementan `registry/lib/motion.ts` y las reglas `RUI-ANIM-PERF-001…007` del ui-system. Si una regla de aquí choca con la Spec de un ciclo, manda la Spec.

Adaptado de las skills de Emil Kowalski, `emilkowalski/skills@0f2e23b` (`emil-design-eng`, `review-animations`, `animation-performance`, `choreograph`, `ask-sonner`, `gestures`), licencia MIT, Copyright (c) 2026 Emil Kowalski. El texto está reescrito y mapeado a este repo; el aviso completo está en [NOTICE](../NOTICE).

## Duración

- La UI anima en menos de 300 ms.
- Las excepciones documentadas son modales, drawers, sheets y toasts. Modales y drawers pueden llegar a 500 ms. Los toasts de Sonner usan su propio `transform 400ms ease` (`sonner/dist/styles.css`).
- `motionPresets.duration.considered` (0.48 s) solo cabe en esas superficies. En cualquier otra pieza, más de 300 ms necesita una razón escrita en la Spec o en el `docs` del item.
- La salida es más corta que la entrada: 250 ms de entrada y 200 ms de salida, no al revés.

## Curvas

- El token `--ease-out` de Emil es `cubic-bezier(0.23, 1, 0.32, 1)`. Retana UI no define ese token: los items no pueden llevar `cssVars` y heredan el tema del anfitrión.
- En Tailwind v4, la clase `ease-out` y `var(--ease-out)` valen `cubic-bezier(0, 0, 0.2, 1)` (`tailwindcss/theme.css`). Es la curva débil del navegador, no la de Emil. No escribas `var(--ease-out)` esperando la curva fuerte.
- En Motion usa `motionPresets.ease.enter` (`[0.16, 1, 0.3, 1]`) para entradas y `motionPresets.ease.exit` para salidas. En CSS escribe la curva literal: `ease-[cubic-bezier(0.16,1,0.3,1)]`.
- `ease-in` no va en UI. La excepción es el toast de Sonner, que usa `ease`.
- Los resortes van con `bounce: 0` salvo al soltar un arrastre. En Motion, `damping` es un coeficiente físico, no la razón de amortiguamiento de Apple.

## Escalonado (stagger)

- Entre 30 y 80 ms por elemento, y el grupo termina en unos 300 ms.
- Una sola entrada por contenedor. Si el panel ya entra, sus filas no necesitan otra.
- Los intervalos no son uniformes: se acortan conforme avanza el grupo (por ejemplo 0, 120, 200 ms), para que se lea como una ola y no como un metrónomo.
- A partir del quinto elemento, todos usan el retraso del quinto.
- Nunca bloquea la interacción ni va en superficies de alta frecuencia.
- `motionPresets.stagger.item` (35 ms) multiplicado por el índice es uniforme y no tiene tope. Las piezas que lo usan así quedan como deuda conocida: se corrigen dentro de un ciclo con Auditor, no en este documento.

## Propiedades y compositor

- Solo `transform` y `opacity` van al compositor en todos los navegadores.
- `clip-path` y la altura medida de un acordeón son las excepciones documentadas. Márcalas con `/* rule-exception: RUI-ANIM-PERF-002 <razón> */` cuando el lint las señale.
- `filter: drop-shadow()` en lugar de `box-shadow` funciona en Chrome, que compone `filter`. En otros motores puede repintar: mide antes de darlo por resuelto.
- En Motion 14.7, `backgroundColor` volvió al hilo principal.
- Para ocultar, anima `opacity` y al terminar pon `visibility: hidden`, así deja de recibir clics.

## Motion 14.2 o superior

- Desde Motion 14.2, los atajos `x`, `y`, `scale` y el resto de transforms independientes de un elemento HTML se combinan en una sola animación de `transform` acelerada. Úsalos; no hace falta escribir la cadena `transform`.
- `CPL` está en `motion` 13.5.0 cuando se escribe esto. La subida a 14.14 va en su propio PR, con una prueba que exige 14.2 o superior. Mientras siga en 13.x, si la animación tiene que aguantar un hilo principal ocupado, escribe la cadena `transform` en lugar de `x`/`y`.
- Siguen en el hilo principal en cualquier versión: las animaciones de layout (`layout`, `layoutId`), `onUpdate`, `transformTemplate`, la inercia y los valores que mueve un motion value cada frame (drag, `useTransform`).
- Importa desde `motion/react`, nunca desde `framer-motion`.
- Para derivar un valor, `useSpring(useTransform(valor, fn))`. `useSpring(valor * 0.1)` no es un motion value.
- `staggerChildren` está obsoleto desde Motion 12.22. En código nuevo usa `delayChildren: stagger(...)`.

## Sonner

La versión instalada es `sonner@2.0.8`.

- Un solo `<Toaster />`, montado en la raíz. Este catálogo lo monta en `app/layout.tsx`. Un segundo `<Toaster />` sin `id` duplica cada toast.
- `admin-shell` y `admin-kit` montan su propio `<Toaster />` si `showToaster` es `true`, y ese es su valor por defecto. En un anfitrión que ya tiene uno en la raíz, pasa `showToaster={false}`, como hacen los demos.
- Varios toasters: cada uno con su `id` y el toast con `toasterId`. Un toaster con `id` solo muestra los toasts dirigidos a él.
- `toast.getToasts()` devuelve los activos y `toast.getHistory()` incluye los cerrados. `toast.getActiveToasts()` no existe.
- `hotkey` es un arreglo (`['altKey', 'KeyT']`), `dir` es `'ltr' | 'rtl' | 'auto'`, `offset` vale 24 px y `mobileOffset` 16 px.
- `onDismiss` se dispara con el botón de cerrar, con el swipe y con `toast.dismiss()`. `onAutoClose` se dispara al vencer el tiempo.

## Vaul

Retana UI no depende de Vaul hoy; `sheet` usa Radix. Si una pieza lo adopta, los selectores son `[data-vaul-drawer]` y `[data-vaul-overlay]`, no `[vaul-drawer]`.

## Cómo se revisa

- Corre `anim_perf_lint.mjs` del ui-system sobre los archivos tocados.
- Para revisar el movimiento completo, la herramienta es `review-animations`. Para elegir qué skill usar, `ask-emil` sirve como mapa del lado del Builder; el veredicto lo da el UI Auditor con sus checks, no ese router.
