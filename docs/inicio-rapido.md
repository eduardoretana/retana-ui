# Inicio rápido con un agente

Copia este prompt en tu agente desde la raíz del proyecto anfitrión. Cambia `<SHA>` por el commit de `CPL` que quieras instalar y `<pieza>` por el nombre del item.

```text
Instala la pieza <pieza> de Retana UI en este proyecto.

1. Lee components.json. Si no existe, detente y pregúntame. No corras `shadcn init` ni apliques un preset: pisaría mis tokens.
2. En "registries" de components.json agrega "@retana" con la URL
   https://raw.githubusercontent.com/eduardoretana/retana-ui/<SHA>/public/r/{name}.json
   Si no te di el SHA, pregúntamelo. No uses un nombre de rama.
3. Corre `npx shadcn@latest add @retana/<pieza>`. Si el CLI pregunta si sobrescribe un primitivo que ya tengo (button, sidebar, scroll-area u otro), responde que no.
4. Si una política de versiones, de antigüedad de paquetes o del lockfile bloquea la instalación, detente y avísame. No la cambies.
5. No agregues colores, temas, fuentes ni cssVars. La pieza usa las clases semánticas de mi tema.
6. Lee la entrada "docs" de <pieza> en https://raw.githubusercontent.com/eduardoretana/retana-ui/<SHA>/registry.json y sigue lo que pide al anfitrión.
7. Anota en AGENTS.md, y créalo si falta, qué piezas de Retana UI se instalaron, el SHA y la URL de registry.json.
8. Corre el typecheck y las pruebas del proyecto. Dime qué archivos se escribieron y si algo falló.
```

Después pídele lo que quieres construir, por ejemplo:

```text
Usa @retana/layered-panel en la tabla de clientes: al hacer clic en una fila se abre el detalle a la derecha sin cambiar de ruta, y la tabla conserva su scroll.
```

El comando manual sigue en [README.md](../README.md#install).
