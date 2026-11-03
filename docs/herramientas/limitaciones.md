# Limitaciones

- El adaptador de memoria se pierde al reiniciar el proceso. No es una base.
- No hay adaptador de red, ni de Supabase, ni de un CRM. El puerto está para que el host lo implemente.
- `mapExampleCrmWebhook` no habla el protocolo de ningún producto. Es un ejemplo de forma.
- Los matchers de texto no son un clasificador. Un homoglifo puede pasar. Ver el modelo de amenazas.
- El núcleo no autentica al approver. Cree el `Actor` que el host le pasa. El host tiene que haber verificado a esa persona.
- Una aprobación ata el hash de la acción y la versión del ruleset, no el texto de las reglas. Publicar otra versión no reutiliza el ticket anterior. Eso es a propósito.
- `guardAction` sin ruleset activo no permite: abre un ticket con ruleset `none` versión `0`.
- El constructor edita una regla en memoria. Publicar es responsabilidad del host (`RulesetPort.save`).
- Las pantallas no importan el almacén. Quien las monta pasa props.
- No hay Zod. El parser cubre el esquema de este documento, no cualquier JSON Schema externo.
- La animación propia de estas piezas no mueve layout. El estado vacío reutiliza `empty-state`, que ya respeta reduced motion.
