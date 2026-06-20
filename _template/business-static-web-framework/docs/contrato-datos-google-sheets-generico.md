# Contrato de Datos — Integración Genérica con Google Sheets

**Estado: NO CONECTADO.** Esta plantilla incluye el contrato (esquema, columnas, reglas) que deberá cumplir cualquier fuente de datos remota antes de conectarse a un sitio construido con ella — **no incluye ninguna conexión activa**. El sitio funciona exclusivamente con JSON local en `data/` y `data/slots/`. No existe endpoint configurado ni código que intente alcanzar uno.

**Endpoint recomendado cuando se autorice: Google Apps Script** (`doGet()` publicado como Web App, devolviendo JSON) — no la API de Sheets directamente ni un SDK de Google.

---

## Por qué existe este documento

El sitio ya incorpora un módulo de validación en `script.js` ("MÓDULO 3b: ESQUEMA Y VALIDACIÓN DE DATOS") que filtra y valida los datos del catálogo, sedes, WhatsApp, promociones y SEO usando esquemas de tipos, campos obligatorios y reglas de consistencia. Este documento fija el contrato que una hoja de Google Sheets (u otro JSON remoto) deberá respetar para pasar esas mismas validaciones sin cambios de código.

---

## Principio rector

> **El JSON local siempre debe seguir funcionando como fallback.** Si en el futuro se conecta una fuente remota y esa fuente falla o no responde, el sitio debe seguir funcionando con los archivos locales en `data/catalogo.json` y `data/slots/`. Nunca debe quedar el sitio sin datos por una caída de la fuente remota.

---

## Estados de aprobación normalizados

Cualquier columna `estadoAprobacion` —venga de JSON local o de una futura hoja de Sheets— se normaliza a uno de estos cuatro valores antes de evaluarse (`normalizarEstadoAprobacion()` en `script.js`):

| Estado | Efecto |
|--------|--------|
| `aprobado` | Único estado que habilita la publicación del dato |
| `pendiente` | El dato no se publica (es también el valor por defecto para cualquier estado vacío, mal escrito o desconocido) |
| `rechazado` | El dato no se publica (rechazo explícito, con intención registrada) |
| `oculto` | El dato no se publica (ocultamiento operativo, no necesariamente permanente) |

Ver `control-publicacion-datos.md` para el detalle completo de este sistema.

---

## Contrato por dominio de datos

### 1. Catálogo de productos

Cada fila/registro exportado desde Sheets debe mapear a los campos de `ESQUEMA_MOTO` en `script.js`:

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | string | único, kebab-case, no debe cambiar entre sincronizaciones |
| `linea` | string | una de las líneas de producto del negocio |
| `modelo` | string | |
| `visible` | boolean | controla si aparece en el catálogo |
| `destacado` | boolean | |
| `orden` | number | entero, define el orden de la grilla |
| `precio` | string | formato libre, incluyendo el símbolo de {{MONEDA}} (ej. "{{MONEDA}} MONTO_PENDIENTE") |
| `precioConfirmado` | boolean | **obligatorio**. Si la hoja no lo trae, asumir `false` |
| `cuotaInicial` | string | |
| `cuotaConfirmada` | boolean | **obligatorio**, mismo criterio que `precioConfirmado` |
| `stock` | string | |
| `stockConfirmado` | boolean | **obligatorio**, mismo criterio |
| `promocion` | string | texto de la promoción, si aplica |
| `promocionConfirmada` | boolean | **obligatorio** — la promoción solo se publica si esto es `true` *y* `estadoAprobacion` es `"aprobado"` |
| `estadoAprobacion` | string | normalizado a uno de los 4 estados |
| `descripcion` | string | texto plano, sin HTML (se inserta vía `textContent`, nunca `innerHTML`) |
| `fotoPrincipal` | string | **debe ser ruta local** (`assets/...`). Una URL externa es rechazada por `esRutaLocalSegura()` y se muestra un placeholder |

**Regla crítica:** si una celda de confirmación (`precioConfirmado`, `cuotaConfirmada`, `stockConfirmado`, `promocionConfirmada`) está vacía, el exportador debe convertirla a `false` — nunca a `true` por defecto.

### 2. Sedes

Mapea a `ESQUEMA_SEDE`. Solo se renderiza una sede si `estadoAprobacion` normalizado es exactamente `"aprobado"`. Cualquier otro valor la oculta — es una decisión de diseño defensivo (allowlist, no denylist).

`googleMapsUrl`, si se provee, debe ser HTTPS de un dominio en `DOMINIOS_PERMITIDOS` (`maps.google.com`, `www.google.com`, `goo.gl`). Si no cumple, el sitio la ignora y genera su propia URL de Maps a partir de la dirección.

`telefono`, si se provee, debe contener solo dígitos, espacios, `+`, `-` y paréntesis (`esTelefonoSeguro()`). Si no cumple el formato, se trata como pendiente.

### 3. WhatsApp

Mapea a `ESQUEMA_WHATSAPP_SLOT`. El sitio solo activa los botones de WhatsApp cuando `data/configuracion.json → whatsappConfirmado === true` — esto seguirá siendo así aunque se conecte Sheets: la fuente remota puede alimentar el número, pero la bandera de confirmación es una decisión explícita y separada, idealmente fuera de una hoja editable por cualquiera.

### 4. Promociones

Mapea a `ESQUEMA_PROMOCION`. Solo se muestran promociones con `visible: true` **y** `estadoAprobacion` normalizado `"aprobado"`.

### 5. SEO

**No se sincroniza automáticamente.** `index.html` es la fuente autoritativa para crawlers. `verificarConsistenciaSEO()` en `script.js` compara `data/slots/seo.json` contra las etiquetas reales y solo emite advertencias en consola si detecta diferencias. Una futura fuente Sheets para SEO debería alimentar `seo.json`, nunca el HTML directamente vía JavaScript.

---

## Columnas recomendadas por hoja (Apps Script)

### Hoja "Catalogo"

| Columna | Tipo | Obligatoria | Nota |
|---------|------|-------------|------|
| `id` | texto | sí | único, kebab-case |
| `linea` | texto | sí | |
| `modelo` | texto | sí | |
| `version` | texto | no | |
| `visible` | TRUE/FALSE | sí | |
| `destacado` | TRUE/FALSE | no | |
| `orden` | número | no | entero |
| `precio` | texto | no | |
| `precioConfirmado` | TRUE/FALSE | sí | vacío → FALSE |
| `cuotaInicial` | texto | no | |
| `cuotaConfirmada` | TRUE/FALSE | sí | vacío → FALSE |
| `stock` | texto | no | |
| `stockConfirmado` | TRUE/FALSE | sí | vacío → FALSE |
| `promocion` | texto | no | |
| `promocionConfirmada` | TRUE/FALSE | sí | vacío → FALSE |
| `estadoAprobacion` | texto | sí | solo `"aprobado"` publica |
| `descripcion` | texto | no | texto plano, sin HTML/fórmulas |
| `fotoPrincipal` | texto | no | debe empezar con `assets/` |

### Hoja "Sedes"

| Columna | Tipo | Obligatoria | Nota |
|---------|------|-------------|------|
| `id` | texto | sí | único |
| `nombre` | texto | sí | |
| `direccion` | texto | no | "pendiente" si no está confirmada |
| `telefono` | texto | no | solo dígitos/espacios/+/-/paréntesis |
| `googleMapsUrl` | texto | no | debe ser HTTPS de maps.google.com |
| `horario` | texto | no | |
| `estadoAprobacion` | texto | sí | solo `"aprobado"` muestra la sede |

### Hoja "Promociones"

| Columna | Tipo | Obligatoria | Nota |
|---------|------|-------------|------|
| `modelo` | texto | sí | debe existir en la hoja Catálogo |
| `titulo` | texto | sí | |
| `descripcion` | texto | no | |
| `vigencia` | texto | no | fecha inicio–fin en texto |
| `visible` | TRUE/FALSE | sí | |
| `estadoAprobacion` | texto | sí | debe ser `"aprobado"` si `visible=TRUE` |

### Hoja "WhatsApp" (fila única, no lista)

| Columna | Tipo | Obligatoria | Nota |
|---------|------|-------------|------|
| `whatsappGeneral` | texto | no | "pendiente" hasta confirmar |
| `whatsappVentas` | texto | no | |
| `whatsappFinanciamiento` | texto | no | |
| `whatsappServicioTecnico` | texto | no | |
| `estadoAprobacion` | texto | sí | |

### Hoja "SEO" (fila única, no lista)

| Columna | Tipo | Obligatoria | Nota |
|---------|------|-------------|------|
| `title` | texto | sí | debe coincidir con `<title>` real |
| `description` | texto | sí | debe coincidir con meta description real |
| `keywords` | texto | no | |
| `ogImage` | texto | no | debe empezar con `assets/` |
| `canonicalUrl` | texto | sí | debe coincidir con `<link rel="canonical">` real |

### Hoja "Control" (fila única — equivalente a `data/slots/control.json`)

| Columna | Tipo | Obligatoria | Nota |
|---------|------|-------------|------|
| `modoDatos` | texto | sí | `"local"` por defecto |
| `googleSheetsConectado` | TRUE/FALSE | sí | declarativo, no activa nada por sí solo |
| `appsScriptEndpoint` | texto | no | vacío hasta autorización |
| `fallbackLocal` | TRUE/FALSE | sí | debe ser siempre `TRUE` |
| `permitirDatosPendientes` | TRUE/FALSE | sí | por defecto `FALSE` |
| `ultimaRevisionGerencial` | texto | sí | fecha o `"pendiente"` |

---

## Apps Script como endpoint recomendado

1. Una hoja de Google Sheets con las pestañas/columnas descritas arriba.
2. Un Apps Script vinculado, publicado como **Web App** con un `doGet(e)` que lea cada pestaña y devuelva JSON con `ContentService` (tipo MIME `application/json`) — de solo lectura, sin parámetros que permitan escribir.
3. La URL publicada (`https://script.google.com/macros/s/.../exec`) sería la única que el sitio necesitaría llamar con `fetch()`.
4. Esa URL debe validarse contra una lista explícita de dominios permitidos (`script.google.com`, `script.googleusercontent.com`), igual de estricta que `esURLExternaSegura()`.
5. El JSON devuelto debe pasar por los mismos validadores (`validarYFiltrarCatalogo()`, etc.) que ya corren sobre el JSON local — sin "modo confianza" para la fuente remota.

**Nada de esto está implementado.** Es la receta a seguir cuando se autorice explícitamente la conexión.

---

## Qué NO se hace por defecto en ningún proyecto basado en esta plantilla

- No se crea ningún archivo de configuración con URLs de Sheets reales.
- No se modifica `cargarCatalogo()` ni `cargarSlots()` para intentar un `fetch()` remoto.
- No se agrega ninguna credencial, API key ni token de Google al frontend.
- No se publica ningún Apps Script real ni se comparte ninguna URL de Web App, salvo autorización explícita.

## Reglas que no cambian aunque se conecte Sheets

1. El JSON local sigue siendo el fallback permanente.
2. Ningún campo no confirmado se publica como real — la regla vive en el render (`script.js`), no en la fuente de datos.

Este documento es de planificación. La implementación real requiere autorización explícita y una sesión de trabajo dedicada a "conectar Google Sheets".
