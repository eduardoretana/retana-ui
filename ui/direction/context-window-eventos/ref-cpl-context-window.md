# REF-cpl-context-window · referencia visual de `context-window` en CPL

- reference_id: `REF-cpl-context-window`
- screen_id: `context-window`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`next build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/context-window`, arnés `21db9481b331` (`shoot.mjs`), claro y oscuro, reduced motion.
- valid_for_spec_version: `1.0.0` de `ui/specs/context-window-eventos.spec.md`
- status: `current`
- licencia: capturas propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-sweep2` (MANIFEST.sha256 `a6ed2081dd628e9e9af5a8337fa8840c4e61d42030ab84e3e62aa759d26de1fb`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/context-window/desktop-light-reduced.png` | `d26c6019901327b7abeae2f6d91d050adf25be26e68bfcbcdf835e9e8a1488e7` |
| `before/context-window/desktop-dark-reduced.png` | `29abd84e70b6c50272514ba59ed0b9614fb25246f8a74b3fa5a35a3bee7c3ff5` |
| `before/context-window/390-light-reduced.png` | `3e5551b158de89ee467d298c2416be4b9e0ef18415a7362a53f5c20a4a4979c2` |
| `before/context-window/390-dark-reduced.png` | `6e804fe2b9c44dcd8fbcd26bd26da316448f77e440b0056d60dd953ff37a6391` |

Uso: la pieza ya existe en CPL. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad. Las desviaciones están en `ui/direction/context-window-eventos/direction-map.md`, cada una con su cita.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una decisión de Eduardo ni una excepción D2.

Revisión de ficha: 1
