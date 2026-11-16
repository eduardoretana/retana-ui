# Movimiento en Retana UI

Reglas para escribir o revisar animación en una pieza. Complementan `registry/lib/motion.ts` y las reglas `RUI-ANIM-PERF-001…007` del ui-system. Si una regla de aquí choca con la Spec de un ciclo, manda la Spec.

Adaptado de las skills de Emil Kowalski, `emilkowalski/skills@0f2e23b` (`emil-design-eng`, `review-animations`, `animation-performance`, `choreograph`, `ask-sonner`, `gestures`); el contrato de stagger viene de `better-ui`, licencia MIT, Copyright (c) 2026 Emil Kowalski. El texto está reescrito y mapeado a este repo; el aviso completo está en [NOTICE](../NOTICE).

## Duración

El tope y sus excepciones vienen de `review-animations/STANDARDS.md` del ui-system (copia de Emil fijada en el Hub). Esa tabla manda.

- La UI anima en menos de 300 ms. Referencias: respuesta de botón 100–160 ms, tooltips y popovers pequeños 125–200 ms, dropdowns y selects 150–250 ms.
- Excepciones: modales y drawers de 200 a 500 ms; toast de Sonner con su `transform 400ms ease` (`sonner/dist/styles.css`); piezas de marketing o explicativas pueden durar más.
- `motionPresets.duration.considered` (0.48 s) solo cabe en esas superficies. En cualquier otra pieza, más de 300 ms necesita una razón escrita en la Spec o en el `docs` del item.
- La salida es más corta que la entrada: 250 ms de entrada y 200 ms de salida, no al revés.
- `anim_perf_lint.mjs` no comprueba duraciones. El texto de `review-animations` que llama hallazgo a todo lo que pasa de 300 ms es guía para quien construye, no un hallazgo del veredicto del UI Auditor.

## Curvas

- El token `--ease-out` de Emil es `cubic-bezier(0.23, 1, 0.32, 1)`. Retana UI no define ese token: los items no pueden llevar `cssVars` y heredan el tema del anfitrión.
- En Tailwind v4, la clase `ease-out` y `var(--ease-out)` valen `cubic-bezier(0, 0, 0.2, 1)` (`tailwindcss/theme.css`). Es la curva débil del navegador, no la de Emil. No escribas `var(--ease-out)` esperando la curva fuerte.
- En Motion usa `motionPresets.ease.enter` (`[0.16, 1, 0.3, 1]`) para entradas y `motionPresets.ease.exit` para salidas. En CSS escribe la curva literal: `ease-[cubic-bezier(0.16,1,0.3,1)]`.
- `ease-in` no va en UI. La excepción es el toast de Sonner, que usa `ease`.
- Los resortes van con `bounce: 0` salvo al soltar un arrastre. En Motion, `damping` es un coeficiente físico, no la razón de amortiguamiento de Apple.

## Escalonado (stagger)

El contrato vigente es el de `better-ui` (Jakub Krehel) en el ui-system: retraso uniforme entre grupos.

- Solo en entradas poco frecuentes donde el orden comunica jerarquía: el hero al cargar, un estado de éxito, un estado vacío.
- Divide en grupos semánticos (título, descripción, botones) con unos 100 ms entre grupos. Para un título partido en palabras, unos 80 ms.
- Una sola entrada por contenedor. Si el panel ya entra, sus filas no necesitan otra.
- Nunca bloquea la interacción ni va en superficies de alta frecuencia.
- `motionPresets.stagger` (`char`, `word`, `line`, `item`) multiplicado por el índice es uniforme y cumple el contrato.

Nota opcional, sin regla: `emilkowalski/skills@0f2e23b` propone intervalos que se acortan conforme avanza el grupo y un tope a partir del quinto elemento. No es obligatorio ni tiene rango exigido; queda en el learnings log del ui-system hasta validarlo en lab.

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
- Para revisar el movimiento completo mientras construyes, la guía es `review-animations`. Para elegir qué skill usar, `ask-emil` sirve como mapa solo del lado del Builder (con `disable-model-invocation`). El veredicto lo da el UI Auditor con sus checks, no esas guías ni ese router.
