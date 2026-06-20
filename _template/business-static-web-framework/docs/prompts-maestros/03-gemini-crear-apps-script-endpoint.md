# Prompt Maestro 03 — Gemini: Redactar el Apps Script Endpoint

```
Actúa como desarrollador de Google Apps Script especializado en
exponer hojas de cálculo como JSON de solo lectura.

Contexto: ya existe un PANEL WEB en Google Sheets diseñado según
docs/contrato-datos-google-sheets-generico.md (prompt anterior, 02).
Ahora necesito el código de Apps Script que lo expondría como
endpoint JSON — PERO NO LO VOY A PUBLICAR TODAVÍA. Esta tarea es
solo para tener el código listo y revisado, en espera de autorización
explícita para publicarlo como Web App.

Reglas estrictas:

1. El script debe ser de SOLO LECTURA. No debe existir ninguna función
   doPost(), ningún método que escriba en la hoja desde una petición
   externa.

2. doGet(e) debe:
   - Leer cada pestaña relevante (Catalogo, Sedes, Promociones,
     WhatsApp, SEO, Control, y las que se hayan definido en el panel).
   - Convertir cada pestaña en un array de objetos JSON (una fila =
     un objeto, encabezados = claves), salvo las pestañas de fila
     única (WhatsApp, SEO, Control), que deben exportarse como un
     solo objeto, no como array.
   - Para los campos booleanos de confirmación (precioConfirmado,
     cuotaConfirmada, stockConfirmado, promocionConfirmada,
     googleSheetsConectado, fallbackLocal, permitirDatosPendientes,
     mostrar*): si la celda está vacía, el JSON debe devolver
     `false` — NUNCA `true` por defecto.
   - Para estadoAprobacion: si la celda está vacía o tiene un valor
     no reconocido (algo que no sea exactamente "pendiente",
     "aprobado", "rechazado" u "oculto"), el JSON debe devolver
     "pendiente" — replicando normalizarEstadoAprobacion() del sitio.
   - Devolver la respuesta con ContentService, tipo MIME
     "application/json", con cabeceras que permitan CORS de solo
     lectura desde el dominio del sitio (no "*" abierto a cualquier
     origen si se puede evitar).

3. No debe haber ninguna credencial, API key ni token hardcodeado en
   el script — Apps Script ya corre con los permisos de la cuenta de
   Google propietaria de la hoja, no necesita claves adicionales.

4. Incluye comentarios explicando cada función.

5. Al final, dame instrucciones EXPLÍCITAS y separadas de cómo
   publicar el script como Web App (Implementar > Nueva implementación
   > Aplicación web), aclarando que ese paso de publicación requiere
   mi autorización explícita y no debe ejecutarse como parte de esta
   tarea — solo entrega el código y las instrucciones, no lo publiques
   tú ni asumas que ya está publicado.

No conectes este endpoint a ningún sitio todavía. Esa es una tarea
separada y posterior, que requiere autorización explícita adicional
(ver docs/contrato-datos-google-sheets-generico.md, sección "Qué NO
se hace por defecto").
```
