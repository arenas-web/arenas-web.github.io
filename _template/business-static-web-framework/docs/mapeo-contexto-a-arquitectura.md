# Mapeo: Contexto del Cliente → Arquitectura de Datos

**Propósito:** Explicar cómo la información comercial recogida en `docs/contexto-cliente-ejemplo.md` se conecta — conceptualmente, todavía no en código — con el futuro panel de Google Sheets ("PANEL WEB {{NOMBRE_CLIENTE}}"), con los archivos `data/slots/` ya existentes, y con el frontend estático actual.

**Estado: solo documentación.** Este mapeo no modifica `index.html`, `style.css`, `script.js` ni ningún `data/*.json` o `data/slots/*.json`. No se conecta Google Sheets. No se crea ningún endpoint. Es el plano de qué-va-dónde para cuando se autorice el siguiente paso.

Última actualización: junio 2026

---

## Vista general de la cadena de datos

```
Cliente (contexto comercial real)
        ↓
docs/contexto-cliente-ejemplo.md   (registro humano, este momento)
        ↓
PANEL WEB {{NOMBRE_CLIENTE}} — Google Sheets   (futuro: captura editable por el negocio)
        ↓
Apps Script (doGet → JSON)         (futuro endpoint — ver docs/contrato-datos-google-sheets.md)
        ↓
fetch() desde script.js            (futuro — NO implementado)
        ↓
Validadores de script.js           (ya existen: validarYFiltrarCatalogo, validarYFiltrarSedes, etc.)
        ↓
Frontend estático (index.html)     (renderiza solo si los validadores aprueban Y el dato está confirmado)

      ⬑ FALLBACK PERMANENTE en cada paso: data/*.json y data/slots/*.json locales
```

El frontend estático **nunca cambia su forma de funcionar** por este mapeo: hoy lee JSON local, y cuando (si) se conecte Sheets, seguirá leyendo JSON — simplemente ese JSON podría, en el futuro, venir de un Apps Script en lugar de un archivo local. El contrato de datos (`docs/contrato-datos-google-sheets.md`) ya exige que el JSON local siga siendo el fallback permanente.

---

## Mapeo por pestaña del PANEL WEB {{NOMBRE_CLIENTE}}

### 07_HERO

| | |
|---|---|
| **Contenido esperado** | Headline, subtítulo, CTA principal del hero |
| **Origen en el contexto del cliente** | Mensaje de marca ("confianza, calidad y garantía"), CTAs sugeridos (Cotiza por WhatsApp, Ver modelos, Solicita tu crédito) |
| **Archivo local equivalente hoy** | `data/slots/hero.json` |
| **Estado de los datos** | El mensaje de marca es información real del cliente; los textos exactos del hero (headline definitivo) siguen sin decidirse — eso es trabajo de la fase de diseño, no de este mapeo |

### 08_BENEFICIOS

| | |
|---|---|
| **Contenido esperado** | Razones para elegir {{NOMBRE_CLIENTE}}, propuesta de valor |
| **Origen en el contexto del cliente** | Propuesta de valor (variedad, calidad, atención, precios, promociones), sello "tienda autorizada {{MARCA_PRINCIPAL}}", trayectoria de 10+ años |
| **Archivo local equivalente hoy** | `data/slots/beneficios.json` |
| **Estado de los datos** | La propuesta de valor y el sello de marca autorizada son datos confirmados por el cliente; sin embargo, `beneficios.json` actual está orientado a "qué incluye la compra de una moto" (placa, casco, garantía, etc.), que es un concepto distinto — ver nota de reconciliación abajo |

### 05_SEDES

| | |
|---|---|
| **Contenido esperado** | Dirección, coordenadas, horario, teléfono de cada sede |
| **Origen en el contexto del cliente** | Dirección ({{DIRECCION_PRINCIPAL}}), Plus code, coordenadas, horarios (con sábado pendiente) |
| **Archivo local equivalente hoy** | `data/slots/sedes.json` |
| **Estado de los datos** | Dirección y coordenadas son datos reales aportados por el cliente — **pero el horario del sábado sigue marcado como pendiente por el propio cliente**, y el campo `estadoAprobacion` de la sede principal en `sedes.json` sigue sin pasar a `"aprobado"`. Este mapeo no cambia ese estado |

### 04_WHATSAPP

| | |
|---|---|
| **Contenido esperado** | Número(s) de WhatsApp activos, mensajes predefinidos por área |
| **Origen en el contexto del cliente** | WhatsApp/Tel 1 ({{WHATSAPP_PRINCIPAL}}), Tel 2 ({{WHATSAPP_SECUNDARIO}}) |
| **Archivo local equivalente hoy** | `data/slots/whatsapp.json` (números segmentados por área, hoy todos en `"pendiente"`) y `data/configuracion.json → whatsapp` + `whatsappConfirmado` (fuente activa que realmente lee `script.js`) |
| **Estado de los datos** | El cliente entregó dos números reales. Esto **no implica que `whatsappConfirmado` deba cambiar a `true`** — ese cambio requiere una decisión explícita de aprobación, no solo la existencia del dato. Ver `docs/fuente-unica-datos.md` para qué archivo manda |

### 10_SEO

| | |
|---|---|
| **Contenido esperado** | Title, description, keywords, Open Graph, canonical |
| **Origen en el contexto del cliente** | Nombre comercial, nombres usados en redes ({{NOMBRE_CLIENTE}} {{CIUDAD}}), rubro, ubicación ({{CIUDAD}}/{{DISTRITO}}) — insumos para keywords locales |
| **Archivo local equivalente hoy** | `data/slots/seo.json` |
| **Estado de los datos** | `index.html` sigue siendo la fuente autoritativa para crawlers (ver `docs/fuente-unica-datos.md` → sección SEO). Esta pestaña, cuando exista, alimentaría `seo.json` como capa de referencia — nunca el HTML directamente |

### 99_CONTROL

| | |
|---|---|
| **Contenido esperado** | Estado de aprobación de cada pestaña/dato, responsable de cada cambio, fecha de última actualización |
| **Origen en el contexto del cliente** | La sección "Datos pendientes de aprobación gerencial" de `docs/contexto-cliente-ejemplo.md` es, en esencia, el contenido inicial que poblaría esta pestaña |
| **Archivo local equivalente hoy** | `data/slots/control.json` — ya existe y es el equivalente local de `99_CONTROL` |
| **Estado de los datos** | `control.json` actúa como configuración conservadora local: `googleSheetsConectado: false`, `fallbackLocal: true`, y las banderas `permitirDatosPendientes` / `mostrarPreciosPendientes` / `mostrarWhatsappPendiente` / `mostrarPromocionesPendientes` / `mostrarGarantiaNoConfirmada` / `mostrarFinanciamientoNoConfirmado` en `false` por defecto. Mientras permanezcan así, ningún precio, WhatsApp, promoción, garantía o financiamiento no confirmado se publica como real. Ver `control-publicacion-datos.md` para el detalle completo de cada bandera |

### Pestañas no cubiertas en este mapeo

El contexto entregado no menciona explícitamente las pestañas numeradas 01, 02, 03, 06 ni 09 del PANEL WEB {{NOMBRE_CLIENTE}}. No se inventan nombres ni contenidos para ellas — quedan fuera de alcance de este documento hasta que se reciba esa información.

---

## Mapeo con el futuro endpoint JSON

Cuando exista (no existe hoy):

1. El endpoint (Apps Script, según `docs/contrato-datos-google-sheets.md`) leería las pestañas del PANEL WEB {{NOMBRE_CLIENTE}} y devolvería un JSON por dominio, con la misma forma que los archivos locales actuales (`ESQUEMA_MOTO`, `ESQUEMA_SEDE`, `ESQUEMA_WHATSAPP_SLOT`, `ESQUEMA_SEO_SLOT`, etc., definidos en `script.js`).
2. Las pestañas 07_HERO, 08_BENEFICIOS, 05_SEDES, 04_WHATSAPP y 10_SEO mapean directamente a los slots ya nombrados igual (`hero.json`, `beneficios.json`, `sedes.json`, `whatsapp.json`, `seo.json`), lo cual minimiza el trabajo de adaptación del lado del frontend cuando se autorice la conexión.
3. `99_CONTROL` ya tiene equivalente local en `data/slots/control.json`, y `script.js` ya lo carga, valida (`validarSlotControl()`, `ESQUEMA_CONTROL_SLOT`) y lee (`modoDatosEsLocal()`). Cuando se conecte Google Sheets en el futuro, `99_CONTROL` debe mapearse directamente contra `data/slots/control.json`, manteniendo siempre el fallback local — no reemplazarlo.

---

## Mapeo con el frontend estático

El frontend (`index.html` + `script.js`) **no cambia de comportamiento** por este documento. Hoy:

- Lee `data/catalogo.json` y `data/configuracion.json` directamente.
- Lee los 12 archivos de `data/slots/` vía `cargarSlots()`.
- Aplica las reglas ya existentes de "no mostrar dato no confirmado como real" (`precioConfirmado`, `cuotaConfirmada`, `stockConfirmado`, `estadoAprobacion === "aprobado"`, `whatsappConfirmado`).

Nada de lo documentado aquí activa, cambia o adelanta esas reglas. Son las mismas que ya auditó Codex.

---

## Mapeo con el fallback local

Independientemente de si en el futuro se conecta el PANEL WEB {{NOMBRE_CLIENTE}} vía Apps Script, el principio ya establecido en `docs/contrato-datos-google-sheets.md` se mantiene intacto:

> El JSON local en `data/` y `data/slots/` es el fallback permanente. Si la fuente remota falla, el sitio sigue funcionando con los archivos locales.

Este mapeo no requiere ni sugiere ningún cambio a ese principio.

---

## Reconciliaciones pendientes (ejemplo de tipo de hallazgo a esperar)

Al adaptar esta plantilla a un cliente real, es común encontrar discrepancias entre lo que el cliente reporta y lo que ya existe en `data/catalogo.json` o `data/slots/`. Ejemplos típicos a vigilar:

1. **Líneas de producto:** el cliente puede reportar líneas distintas a las 3 genéricas de la plantilla (`{{LINEA_PRODUCTO_1}}`, `{{LINEA_PRODUCTO_2}}`, `{{LINEA_PRODUCTO_3}}`) — confirmar con el cliente antes de tocar el catálogo, en vez de asumir que coinciden.
2. **"Beneficios" como concepto ambiguo:** el cliente puede usar "beneficios" para hablar de propuesta de valor de marca, mientras `data/slots/beneficios.json` lo usa para "qué incluye la compra de un producto". Son conceptos válidos pero distintos — decidir si conviene una sola pestaña o dos en el panel de datos.
3. **Prueba social con cifras variables:** si las reseñas/seguidores reportados varían según la fuente o fecha, verificar el número actual real antes de publicarlo como definitivo.

Ninguna reconciliación de este tipo se resuelve automáticamente — quedan registradas para que el equipo decida en la siguiente sesión de trabajo sobre datos.

---

## Próximos pasos recomendados

1. Gerencia revisa `docs/contexto-cliente-ejemplo.md` y confirma/corrige los datos pendientes listados.
2. Se resuelven las reconciliaciones de catálogo y de concepto "beneficios" antes de definir las columnas finales de 07_HERO/08_BENEFICIOS.
3. Solo entonces se diseña el PANEL WEB {{NOMBRE_CLIENTE}} real en Google Sheets, usando como base las columnas ya definidas en `docs/contrato-datos-google-sheets.md`.
4. La conexión real (Apps Script + `fetch()` + validadores) se implementa en una sesión dedicada y autorizada explícitamente — no antes.

---

## Referencias relacionadas

- `docs/contexto-cliente-ejemplo.md`
- `docs/contrato-datos-google-sheets.md`
- `docs/fuente-unica-datos.md`
- `docs/requisitos-pendientes-gerencia.md`
- `docs/sistema-slots-editables.md`
