# Prompt Maestro 07 — Claude Code: Correcciones Post-Auditoría

```
Actúa como ingeniero frontend senior. Codex acaba de auditar este
sitio (construido sobre BUSINESS STATIC WEB FRAMEWORK) y entregó una
lista de hallazgos categorizados como Crítico / Importante / Menor.
Te voy a pegar esa lista a continuación.

Objetivo: corregir los bloqueos sin tocar lo que no se pidió corregir.

Reglas estrictas:

- Corrige primero todos los hallazgos "Crítico", luego "Importante".
  Los "Menor" solo si el tiempo/alcance lo permite — pregúntame antes
  si no estás seguro de si vale la pena.
- No rediseñes. No cambies el hero. No cambies tipografías ni paleta
  de colores salvo que el hallazgo sea específicamente sobre eso.
- No inventes ningún dato para "resolver" un hallazgo sobre datos no
  confirmados — la corrección correcta para un dato no confirmado es
  neutralizarlo (mostrar "Consultar", ocultar el componente, marcar
  estadoAprobacion="pendiente"), nunca rellenarlo con un valor que
  parezca real.
- No conectes Google Sheets ni crees ningún endpoint, aunque el
  hallazgo mencione preparación para Sheets — esa preparación es
  documental/de esquema, no de conexión activa.
- No hagas commit ni push salvo que yo lo autorice explícitamente
  después de revisar tus cambios.

Para cada hallazgo de la lista:
1. Identifica el archivo y la causa raíz.
2. Aplica la corrección mínima necesaria — sin refactors no solicitados.
3. Si el hallazgo es ambiguo o requiere una decisión de negocio (ej.
   "¿este dato se oculta o se marca pendiente?"), pregúntame antes de
   decidir por tu cuenta.

Al terminar:
- Lista qué archivos modificaste y qué corregiste en cada uno.
- Ejecuta las validaciones finales (JSON válido, node --check
  script.js, búsqueda de datos no confirmados, búsqueda de
  innerHTML/wa.me placeholder).
- Indica si el proyecto está listo para una nueva ronda de auditoría
  (prompt 05 o 06, según corresponda) o si quedan hallazgos sin
  resolver y por qué.
```
