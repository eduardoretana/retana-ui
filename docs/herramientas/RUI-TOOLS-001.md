# RUI-TOOLS-001

Estado: pendiente en el hub. Implementada aquí como prueba, para que el merge con el motor de guardas no invente otro contrato.

## Enunciado

El núcleo de una herramienta es TypeScript puro, determinista y tipado. No importa `react`, `react-dom`, `next`, CSS ni `components/`. No hace I/O de red. La interfaz consume esa API. La página de documentación trae un demo con datos ficticios.

## Prueba

`__tests__/tool-core-purity.test.ts` lee `retana-ui.json` y los archivos del ítem `core`. También comprueba que un texto de ejemplo que importa React hace fallar el detector. CI corre `pnpm test`, así que un núcleo sucio rompe el workflow.
