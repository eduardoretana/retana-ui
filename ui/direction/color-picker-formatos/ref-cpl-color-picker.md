# REF-cpl-color-picker · referencia visual de `color-picker` en CPL

- reference_id: `REF-cpl-color-picker`
- screen_id: `color-picker`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve` en área, tono y alfa)
- origen: render de producción (`pnpm build && next start`) de `eduardoretana/retana-ui@bf1682d4dfb8696ddb01bf84aedda111f47b086c` (CPL), ruta `/examples/color-picker`, arnés `21db9481b331` (`shoot.mjs`), tema capturado, reduced motion.
- valid_for_spec_version: `0.1.0` de `ui/specs/color-picker-formatos.spec.md`
- status: `current`
- licencia: imágenes propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/color-picker-2026-11-23/capturas/` (ver `MANIFEST.sha256`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `antes/examples-color-picker/desktop-light-reduced.png` | `78d8b836f18c9bf7d68f6777d3e3eeede9fb5484e3d26d98979094d42f418d78` |
| `antes/examples-color-picker/desktop-dark-reduced.png` | `8069ec8adc624a19abcb3cf6a31a84d9fe4cd8e77cd33c3892169c92a8edcee7` |
| `antes/examples-color-picker/390-light-reduced.png` | `cfaea267a05e8c25b6ec2e23ff41d7b42907db368a00eeab48e6c7a7a9e3b6fa` |
| `antes/examples-color-picker/390-dark-reduced.png` | `7737c2f620b5f824a45699ecc5fb3c328283a0b6adcec1acfe8cf9b071b1a115` |

Uso: la pieza ya existe. El ciclo conserva área, tono, alfa y muestra; agrega la fila de herramientas (formato, copiar, cuentagotas), el campo multiformato, los guardados editables y el modo popover. El Auditor compara la pantalla del head contra esta referencia en presencia, orden, jerarquía y densidad.

Elección: propuesta del builder. En STANDARD la elige el UI Lead; `chosen_by` queda vacío hasta que el Lead la confirme en el sobre.
