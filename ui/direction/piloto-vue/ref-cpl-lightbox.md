# REF-cpl-lightbox · referencia visual de `lightbox` en CPL

- reference_id: `REF-cpl-lightbox`
- screen_id: `lightbox`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`next build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/lightbox`, arnés `21db9481b331` (`shoot.mjs`), claro y oscuro, reduced motion.
- valid_for_spec_version: `1.0.0` de `ui/specs/piloto-vue.spec.md`
- status: `current`
- licencia: capturas propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-sweep2` (MANIFEST.sha256 `a6ed2081dd628e9e9af5a8337fa8840c4e61d42030ab84e3e62aa759d26de1fb`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/lightbox/desktop-light-reduced.png` | `1cf8f802a0b80033ff2358de966737d9c0eb0741ae94be8f8ba00e6b95c3b908` |
| `before/lightbox/desktop-dark-reduced.png` | `d303bedf035c67a9825a4b037cd42214a81efd7a2dc2a63d48a55d661e9f8c32` |
| `before/lightbox/390-light-reduced.png` | `be5869aacfa5e5356275110d6b6914964d1c8a81f67368c7818a0f9790bb1113` |
| `before/lightbox/390-dark-reduced.png` | `045051720faaed0ba4ee68567a4f8463eddc91efdef2daa9faeb03e02bf016b6` |

Uso: la pieza ya existe en CPL. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad. Las desviaciones están en `ui/direction/piloto-vue/direction-map.md`, cada una con su cita.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una decisión de Eduardo ni una excepción D2.

Revisión de ficha: 4
