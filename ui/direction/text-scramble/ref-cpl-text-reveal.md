# REF-cpl-text-reveal · referencia visual de `text-reveal` y `slot-text` en CPL

- reference_id: `REF-cpl-text-reveal`
- screen_id: `text-scramble`
- kind: `visual` (piezas de texto animado ya en el catálogo; la nueva pieza reusa su patrón de a11y y su tono)
- origen: render de producción (`pnpm build && next start`) de `eduardoretana/retana-ui@bf1682d4dfb8696ddb01bf84aedda111f47b086c` (CPL), rutas `/examples/text-reveal` y `/examples/slot-text`, arnés `21db9481b331` (`shoot.mjs`), tema capturado, reduced motion.
- valid_for_spec_version: `0.1.0` de `ui/specs/text-scramble.spec.md`
- status: `current`
- licencia: imágenes propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/emil-decode-2026-11-24/capturas/` (ver `MANIFEST.sha256`). `antes/examples-text-scramble/` da 404 en CPL, como se esperaba: la pieza no existe.

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `antes/examples-text-reveal/desktop-light-reduced.png` | `b2589f4b3caca08d588f84929f851c514e9b58ddca4ffa9daf1d8c3911be674e` |
| `antes/examples-text-reveal/desktop-dark-reduced.png` | `1154f7dad3fff2c03febfd4459762303d29c0af2a5d0cd58f5243a127f169b24` |
| `antes/examples-text-reveal/390-light-reduced.png` | `ca81e909c4f682fecb77a4f24bd765a55cb78c3c07479da16fdf2984ffe073b5` |
| `antes/examples-text-reveal/390-dark-reduced.png` | `2b27c510fe8316c2031807eb301bf5d9182c41e37402dd4cb99a8c1114149a3e` |
| `antes/examples-slot-text/desktop-light-reduced.png` | `cb7f465a076c812c36632854c35d1ee311d6b492f0ba2fad49527554109b8d5c` |
| `antes/examples-slot-text/desktop-dark-reduced.png` | `6c3ed6922b8dffbc75be28463046516ebdce71dce7a387fa7ae0ed190895fa00` |
| `antes/examples-slot-text/390-light-reduced.png` | `7543567b5e7ec56763097040e729ce0d1126b13df598b4072c4d2fc2ee1d0487` |
| `antes/examples-slot-text/390-dark-reduced.png` | `88e3333635c1107a764175b313ce8c8fd82ec15a8bdf85913a91215ed4067835` |

Uso: `text-reveal` (CPL `registry/ui/text-reveal.tsx:113` sr-only y `:116` aria-hidden) da el patrón de a11y y la entrada por palabra solo con CSS. `slot-text` (`registry/ui/slot-text.tsx:45-58` y `:191-194`) cubre números y cambios de valor con rodillos. La pieza nueva no duplica ninguna: sustituye glifos en el sitio, una vez, para títulos. El Auditor compara tono, tipografía y densidad del head contra estas pantallas.

Elección: propuesta del builder. En STANDARD la elige el UI Lead; `chosen_by` queda vacío hasta que el Lead la confirme en el sobre.
