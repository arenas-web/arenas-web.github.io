# Prompt Maestro 02 — Gemini: Crear Panel de Google Sheets

```
Actúa como arquitecto de datos especializado en Google Sheets como
fuente de contenido para sitios web estáticos.

Contexto: voy a diseñar (NO conectar todavía) un panel de Google Sheets
llamado "PANEL WEB [NOMBRE_DEL_CLIENTE]" que en el futuro podría
alimentar, vía Apps Script, un sitio web estático construido con la
plantilla BUSINESS STATIC WEB FRAMEWORK.

Objetivo de esta tarea: diseñar la estructura de pestañas y columnas
del panel, siguiendo exactamente el contrato ya definido en
docs/contrato-datos-google-sheets-generico.md (te lo voy a pegar o
adjuntar). NO crear el Apps Script todavía — eso es el prompt 03.
NO conectar nada. Esto es solo diseño de la hoja.

Tareas:

1. Proponer la estructura de pestañas siguiendo esta convención de
   nombres: 01-99 con prefijo numérico y nombre en mayúsculas
   (ej. 04_WHATSAPP, 05_SEDES, 07_HERO, 08_BENEFICIOS, 10_SEO,
   99_CONTROL). Usa los números ya sugeridos si coinciden con el
   dominio de datos; para dominios nuevos, propone un número libre
   y justifica el orden.

2. Para cada pestaña, define la fila de encabezados exactamente con
   los nombres de columna del contrato (no inventes nombres de
   columna distintos a los ya definidos en el contrato).

3. Agrega validaciones de datos de Google Sheets (listas desplegables)
   para las columnas de tipo enumerado, especialmente:
   - estadoAprobacion → lista desplegable con: pendiente, aprobado,
     rechazado, oculto (exactamente estos 4 valores, nada más)
   - visible / precioConfirmado / cuotaConfirmada / stockConfirmado /
     promocionConfirmada / googleSheetsConectado / fallbackLocal →
     casillas de verificación (TRUE/FALSE), nunca texto libre

4. En la pestaña 99_CONTROL, refleja exactamente los campos de
   data/slots/control.json: modoDatos, googleSheetsConectado,
   appsScriptEndpoint, fallbackLocal, permitirDatosPendientes,
   mostrarPreciosPendientes, mostrarWhatsappPendiente,
   mostrarPromocionesPendientes, mostrarGarantiaNoConfirmada,
   mostrarFinanciamientoNoConfirmado, ultimaRevisionGerencial.
   Todos los valores booleanos deben quedar en FALSE por defecto y
   ultimaRevisionGerencial en "pendiente".

5. No completes ninguna fila con datos de ejemplo que parezcan reales
   (ej. no escribas un número de WhatsApp ficticio con formato real).
   Si necesitas una fila de ejemplo para mostrar la estructura, usa
   literalmente la palabra "pendiente" o "EJEMPLO" en los campos de
   dato, nunca un valor que pueda confundirse con información real.

6. Entrega el diseño como una lista de pestañas con sus columnas en
   formato tabla, lista para crear manualmente en Google Sheets (o
   para que yo te pida generar el script de creación vía Apps Script
   en un prompt separado).

No conectes nada. No publiques nada. No crees el Apps Script todavía.
```
