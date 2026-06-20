# Prompt Maestro 04 — Claude Code: Adaptar la Plantilla a un Cliente Real

```
Actúa como ingeniero frontend senior trabajando sobre la plantilla
BUSINESS STATIC WEB FRAMEWORK (HTML/CSS/JS puro, sin frameworks,
compatible con GitHub Pages).

Contexto: tengo el resumen de información comercial real de un cliente
nuevo (te lo voy a pegar — viene del prompt 01, dirección estratégica
de ChatGPT). Voy a adaptar esta copia de la plantilla para ese cliente.

Reglas estrictas:

- No inventes ningún dato que no esté en el resumen que te paso.
- Todo dato marcado como "PENDIENTE" en el resumen debe quedar como
  "pendiente" en el código — nunca lo completes con un valor de
  ejemplo que parezca real.
- No conectes Google Sheets. No crees ningún endpoint. No agregues
  fetch() a ninguna URL remota.
- No agregues frameworks, librerías de terceros ni claves de API.
- No tomes decisiones de diseño visual definitivo (colores,
  tipografías, hero) — solo adapta contenido y estructura de datos.
- No hagas commit ni push salvo que yo lo autorice explícitamente.

Tareas:

1. Reemplaza todas las {{VARIABLES}} listadas en
   docs/variables-de-personalizacion.md por los datos reales del
   resumen, o déjalas como "pendiente" si el dato no vino en el
   resumen. Verifica al final que no quede ninguna {{VARIABLE}} sin
   resolver (grep -rn "{{" .).

2. Adapta data/catalogo.json: reemplaza los 4 productos de ejemplo
   por los productos reales del cliente (o, si todavía no hay
   catálogo real, deja la estructura de ejemplo pero con
   precioConfirmado/cuotaConfirmada/stockConfirmado/
   promocionConfirmada en false).

3. Adapta cada archivo en data/slots/ con los datos reales
   disponibles, manteniendo todos los flags de confirmación en
   false/"pendiente" salvo que el resumen indique explícitamente que
   un dato ya fue aprobado por el cliente para publicación.

4. NO toques data/slots/control.json — debe permanecer con su
   configuración conservadora de fábrica.

5. Ejecuta las validaciones finales:
   - JSON válido en todos los archivos data/*.json y data/slots/*.json
   - node --check script.js
   - grep -rn "{{" . (debe devolver vacío)
   - grep -rn "innerHTML" script.js (solo debe aparecer en comentarios)
   - búsqueda de cualquier número de WhatsApp, correo o dirección que
     no provenga del resumen que te pasé

6. Entrega un resumen: qué archivos modificaste, qué variables
   reemplazaste, qué quedó pendiente, y si el proyecto está listo
   para pasar a auditoría (prompt 05).
```
