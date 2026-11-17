# bounded-retana-ui-motion-14 · carril acotado de UI (retana-ui PR #62)

Manifiesto de dueño del carril para el puente UI del Hub. Una sola subida de dependencia (motion 13.5.0 a ^14.9.0), una sola rama, un solo PR en borrador contra CPL. Sin merge.

## Contrato

- **Status**: active
- **Branch**: cursor/motion-14-accel-8aec
- **UI intent**: APPLIES
- **UI stage**: IMPLEMENTATION
- **UI System profile**: LITE
- **UI System cycle version**: 4.0.0
- **UI System enrollment**: docs/sprints/bounded-retana-ui-motion-14-ui/enrollment.json
- **Design specialization gate**: APPLIES
- **Experience quality gate**: APPLIES
- **Experience surface**: piezas y bloques del registry retana-ui que importan `motion/react` o `framer-motion` (rutas `/examples/<pieza>`), más el catálogo `/catalog`
- **Experience evidence file**: docs/sprints/bounded-retana-ui-motion-14-experience-quality.md

## Scope

- docs/sprints/bounded-retana-ui-motion-14.md
- docs/sprints/bounded-retana-ui-motion-14-experience-quality.md
- package.json
- pnpm-lock.yaml

## UI Surface Impact Gate

- **UI Surface Impact**: VISIBLE_MINOR
- **Design delivery profile**: HOTFIX_MINIMAL
- **UI impact evidence**: El diff de código solo cambia `package.json` (motion ^14.9.0) y `pnpm-lock.yaml` (motion, framer-motion y motion-dom en 14.9.0). No cambia ningún componente, tema, token ni copy. La librería de animación es compartida por las piezas y bloques del registry que importan `motion/react`, así que el riesgo es de regresión visual o de reduced-motion en sus consumidores, no de interacción nueva. El perfil LITE lo fija `ui/status/retana-ui-motion-14.ui-status.yaml`; el impacto derivado (solo dimensiones de sistema compartido, QA visual y consumidores) es VISIBLE_MINOR y pide como mínimo LITE.
- **Visible control impact**: NO
- **Interaction flow impact**: NO
- **Visible copy/state impact**: NO
- **Shared UI system impact**: YES
- **Responsive/accessibility/visual QA impact**: YES
- **UI consumer impact**: YES
- **Surface creation/restructure impact**: NO

## Design Specialization Gate

Pasada de diseño sobre el diff del PR #62 y las superficies que consumen motion. Solo se marca USED lo que se corrió. Se registra lo que salió, sin inventar.

- **Design context source**: design context brief del carril: status `ui/status/retana-ui-motion-14.ui-status.yaml`, entrada `retana-ui-motion-14` de `ui-tests/expected-red.yaml`, diff `bf1682d4..HEAD` (package.json, pnpm-lock.yaml) y la lista de consumidores de `motion/react` en `registry/` y `app/`.
- **Design context checks**: existing surfaces = piezas y bloques del registry que importan motion (sin pieza nueva); state inventory = estados que ya tiene cada demo en CPL, más reduced-motion activado y no; tokens/components = retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets) sin cambio; anti-invention = solo hechos leídos del diff, el lockfile y el código.
- **User objective**: que las animaciones de las piezas existentes se vean y respeten reduced-motion igual que con motion 13.5, ahora sobre motion 14.9.
- **Specialized design source**: design skills ui-ux-pro-max (nextlevelbuilder/ui-ux-pro-max-skill@bc826e22, MIT) y emil-design-eng (Emil Kowalski, MIT).
- **Design skill stack trace**: ui-ux-pro-max corrida con su search.py (salidas fuera del repo en /workspace/pr62-lite/design-pass/uupm/); emil-design-eng aplicada al diff del PR contra CPL bf1682d4: el diff no toca código de componentes, así que el checklist (transition-all, scale(0), ease-in, duraciones, hover sin media query, animación por teclado, reduced motion) no tiene líneas nuevas que revisar; routing core-only.
- **UI/UX Pro Max classification**: USED
- **UI/UX Pro Max evidence**: query="reduced motion", "animation duration easing" (ux) y "framer motion animation" (--stack react, 0 resultados) con nextlevelbuilder/ui-ux-pro-max-skill@bc826e2267a36d98a2dcf5231e16c30ff546770f, scripts/search.py; domain=ux (Reduced Motion, Duration Timing, Easing Functions); applied_decision=la subida no cambia duraciones, easing ni la ruta de reduced-motion de las piezas; la verificación es render en claro y oscuro, 390 y escritorio, con reduced-motion activado y no. Sin cambio de código
- **Emil Design Engineering classification**: USED
- **Emil Design Engineering evidence**: interaction=sin cambio de interacción; craft=checklist de Emil sobre el diff: no hay líneas de componente, transición ni keyframe nuevas; motion=los presets de registry/lib/motion.ts y los springs de cada pieza quedan iguales; reduced motion se verifica en los renders con prefers-reduced-motion reduce
- **Design skill applied use**: emil-design-eng: no change: el diff no tiene código de animación que revisar. ui-ux-pro-max: applied use: fijó el plan de verificación (reduced-motion y duraciones sin cambio) sin cambio de código.
- Polish: not run (impeccable no está instalada en este agente).
- **Visual evidence**: browser screenshots (renders) del arnés 21db9481b331 sobre `next start` del head, fuera del repo, en /workspace/pr62-lite/ (MANIFEST.sha256): superficies con motion a 390 y escritorio, claro y oscuro, reduced-motion activado y no.
- **Apple Design classification**: APPLIES
- **Apple Design interaction evidence**: las piezas mantienen su movimiento de CPL (springs, fades, layout) y su ruta de reduced-motion; la subida no agrega ni quita movimiento.
- **Anti-Slop routing**: core-only
- **Anti-Slop routing reason**: el ciclo es una subida de dependencia sobre piezas existentes de CPL; no hay superficie nueva ni rediseño, así que no aplica el especialista de primera pasada.
- **Anti-Slop Design Read**: surface=piezas y bloques del registry que importan motion; audience=people using host apps built on retana-ui; objective=que las animaciones de las piezas existentes se vean y respeten reduced-motion igual que antes de la subida; language=es-MX por defecto con etiquetas EN existentes; system=retana-ui registry (shadcn/ui primitives, Tailwind v4 tokens, motion/react, registry/lib/motion.ts presets)
- **Anti-Slop design dials**: DESIGN_VARIANCE=1; MOTION_INTENSITY=3; VISUAL_DENSITY=4; rationale=lectura del revisor sobre el diff: variance 1 because no piece changes its look; motion 3 because the existing motion stays as in CPL; density 4 because spacing stays as in CPL
- **Anti-Slop anti-default ledger**: rejected=nuevas variantes visuales, librerías o tokens fuera de CPL; accepted=los tokens, primitivas y presets de motion que ya usa CPL; reason=el ciclo es una subida de dependencia y no cambia diseño
- **Anti-Slop consistency locks**: system=retana-ui registry and shadcn primitives already in CPL; theme=light and dark from the existing tokens, no new theme; color=existing semantic tokens only; type=existing scale; icons=lucide-react as in CPL; shape=existing radii; copy=es-MX default with the existing EN label sets
- **Anti-Slop truth ledger**: assets=sin imágenes nuevas; data=fixtures existentes en app/examples; copy=sin cambio de textos; dependencies=motion ^14.9.0 replaces motion 13.5.0, no new runtime dependency
- **Anti-Slop preservation ledger**: mode=preserve; preserve=apariencia, tokens, API pública y movimiento de las piezas de CPL; approved_changes=solo la versión de motion, framer-motion y motion-dom en package.json y pnpm-lock.yaml
- **Anti-Slop motion purpose**: purpose=feedback; experience_quality=APPLIES (evidencia en docs/sprints/bounded-retana-ui-motion-14-experience-quality.md)
- **Anti-Slop proof plan**: viewports=390 y escritorio; states=default de cada demo, claro y oscuro, reduced-motion activado y no; browser=chromium headless del arnés 21db9481b331 sobre next start; visual_diff=capturas after del head, sin herramienta de diff de píxeles; deviations=la subida no introduce desviación del look de CPL

## Direction

Dirección heredada (LITE) con referencia real: control render de CPL `bf1682d4` (motion 13.5.0), arnés `21db9481b331`, tema claro y reduced-motion desactivado, a 390 y escritorio. Índice: `ui/direction/retana-ui-motion-14/reference-meta.yaml`. Cada referencia tiene su ficha `meta.yaml` en la rama; las PNG viven en el box (`/workspace/pr62-lite/direction-cpl/`) porque el push disponible solo escribe texto. Las cinco pantallas son las rutas con el error de hidratación React #418, que queda como `known_preexisting` (mismo conteo en CPL).

```yaml
spec_version: "1.0.0"
direction:
  mode: inherited
  reference_meta: ui/direction/retana-ui-motion-14/reference-meta.yaml
  references:
    - reference_id: REF-cpl-home-390
      screen_id: home
      regions: [R1, R2]
      path: ui/direction/retana-ui-motion-14/home-390-light.meta.yaml
      sha256: d7fbc600b4ea3750d6409a614d024feef8a166f722f78de38ce76741d261a019
      image_sha256: b77d420364e99a583e2c7d5ebed1e72920c4a3d832103e01c68adb1479fc063d
      variant: null
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      chosen_by: null
      decision_id: null
      status: current
    - reference_id: REF-cpl-home-desktop
      screen_id: home
      regions: [R1, R2]
      path: ui/direction/retana-ui-motion-14/home-desktop-light.meta.yaml
      sha256: c0f584c7858073c7e4a579f9bc62050925495603b7e040fc40b4366ec239acab
      image_sha256: 37f31c1becdfa152920b10c8e49ffb0bd97abb99c140dd877ecdb85bb6fc7b6f
      variant: null
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      chosen_by: null
      decision_id: null
      status: current
    - reference_id: REF-cpl-announcement-bar-390
      screen_id: announcement-bar
      regions: [R1, R2, R3]
      path: ui/direction/retana-ui-motion-14/announcement-bar-390-light.meta.yaml
      sha256: 7f8dc5375df1e920a4af5d3a8dc5883cbb698fc7f4a8fb9531e056292fcfd219
      image_sha256: fdb51e281c55879d172ef6fccd1ced07c3a9af09dfa55b1d3b1508bdb037b51c
      variant: null
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      chosen_by: null
      decision_id: null
      status: current
    - reference_id: REF-cpl-announcement-bar-desktop
      screen_id: announcement-bar
      regions: [R1, R2, R3]
      path: ui/direction/retana-ui-motion-14/announcement-bar-desktop-light.meta.yaml
      sha256: 9973ed8fb893993632e8e857ec003d2719cdfcbe0342a6556c08f9066b537827
      image_sha256: 7f1d8939b0477b0f2d469c81795d749616090c46c132148052a9a6b63408b215
      variant: null
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      chosen_by: null
      decision_id: null
      status: current
    - reference_id: REF-cpl-cta-section-390
      screen_id: cta-section
      regions: [R1, R2, R3]
      path: ui/direction/retana-ui-motion-14/cta-section-390-light.meta.yaml
      sha256: 02e299d07489ebaa91f7478a160b94135e89eb7c9ed4eef21ad824428a743e37
      image_sha256: 5541e6fd343f52639204568c6668a3b68e2a4558e00c37d3c8caab6549f2ba5b
      variant: null
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      chosen_by: null
      decision_id: null
      status: current
    - reference_id: REF-cpl-cta-section-desktop
      screen_id: cta-section
      regions: [R1, R2, R3]
      path: ui/direction/retana-ui-motion-14/cta-section-desktop-light.meta.yaml
      sha256: cca8fd2e8083be94b36eb20dfac9d1200ddfdc6296bbf1f528201962e83ba98a
      image_sha256: ca2bf42f47126950caa97861581bafe8df8b737d7a85af88cc3fe05b16a83117
      variant: null
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      chosen_by: null
      decision_id: null
      status: current
    - reference_id: REF-cpl-motion-preference-390
      screen_id: motion-preference
      regions: [R1, R2, R3]
      path: ui/direction/retana-ui-motion-14/motion-preference-390-light.meta.yaml
      sha256: 124ea9014762b0fd131c9086e82e33c0409b20c6d7e83f5209b002c1080c08d9
      image_sha256: 87297f64ff84a78f9083545fc28e9e8e01667b19e831d8e2f14aedfb3241906c
      variant: null
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      chosen_by: null
      decision_id: null
      status: current
    - reference_id: REF-cpl-motion-preference-desktop
      screen_id: motion-preference
      regions: [R1, R2, R3]
      path: ui/direction/retana-ui-motion-14/motion-preference-desktop-light.meta.yaml
      sha256: f0744fdc3a4104071f5ffd350b2680f2ea42bd3e7b574e7c0b860fe399288f2e
      image_sha256: 4e647baea94d4eedb222188a5113c32c0546dc7b62338c51524142c3c3fdfc03
      variant: null
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      chosen_by: null
      decision_id: null
      status: current
    - reference_id: REF-cpl-scroll-linked-390
      screen_id: scroll-linked
      regions: [R1, R2]
      path: ui/direction/retana-ui-motion-14/scroll-linked-390-light.meta.yaml
      sha256: fb39918086ea7720406036c452d1f8d68ba6b3e74cf5e89603935d19bd37d54c
      image_sha256: b140b44fd6913d393536f77c78a6e960325f2c22089c01c92ab5035dcabef106
      variant: null
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      chosen_by: null
      decision_id: null
      status: current
    - reference_id: REF-cpl-scroll-linked-desktop
      screen_id: scroll-linked
      regions: [R1, R2]
      path: ui/direction/retana-ui-motion-14/scroll-linked-desktop-light.meta.yaml
      sha256: 6dd9f23dd7c435d5b6fc2c6923824d4eec9b93b3d582432182ea439b925a9005
      image_sha256: 601657e48e03176f0193e3e84ab0cf8b0a6953f9a365c79eaa58caedf978fb83
      variant: null
      chosen_at_spec_version: "1.0.0"
      valid_for_spec_version: "1.0.0"
      chosen_by: null
      decision_id: null
      status: current
```

## Referencias del ciclo

- PR: eduardoretana/retana-ui#62 (borrador, base CPL)
- retana_ui sha de partida: `6671cfac72f736739d2d3dd2740cc5f13416acb3`; CPL integrado sin reescribir historia en `8fcd8e9c81800b88701f9d5b53b8990ea0c2ee91` (merge de CPL `bf1682d4dfb8696ddb01bf84aedda111f47b086c`)
- Status `ui/status/retana-ui-motion-14.ui-status.yaml` en `BUILD`, perfil LITE, con el commit del bump `70612d0ba76ba2d24bc85829066cfbe9d30b45ec`
- Builder: Retana UI. El UI Auditor lo despacha el UI Lead; no hay autoauditoría.
