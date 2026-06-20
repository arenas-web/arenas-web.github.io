# Variables de Personalización

Lista completa de variables `{{VARIABLE}}` insertadas durante la sanitización de esta plantilla. Reemplázalas todas antes de publicar — ninguna debe llegar a producción.

---

## Cómo verificar que no falte ninguna

```bash
grep -rn "{{" . --include="*.html" --include="*.css" --include="*.js" --include="*.json" --include="*.md" --include="*.txt" --include="*.xml"
```

Si el comando no devuelve nada, todas las variables fueron reemplazadas.

---

## Variables principales (solicitadas explícitamente)

| Variable | Descripción | Dónde aparece | Ejemplo de valor real |
|----------|-------------|----------------|------------------------|
| `{{NOMBRE_CLIENTE}}` | Nombre comercial del negocio | `index.html` (title, meta, header, footer), `script.js` (mensajes de consola/WhatsApp), `data/*.json`, `docs/*.md` | "Mi Negocio" |
| `{{RUBRO_CLIENTE}}` | Rubro o tipo de negocio | `data/configuracion.json`, `data/slots/empresa.json`, `index.html` (meta keywords) | "tienda de electrodomésticos" |
| `{{MARCA_PRINCIPAL}}` | Marca principal que vende el negocio | `data/catalogo.json`, `index.html`, `docs/*.md` | "Samsung" |
| `{{LINEA_PRODUCTO_1}}` | Primera línea/familia de producto | `data/catalogo.json`, `data/configuracion.json`, `index.html` | "Línea Hogar" |
| `{{LINEA_PRODUCTO_2}}` | Segunda línea/familia de producto | igual que arriba | "Línea Cocina" |
| `{{LINEA_PRODUCTO_3}}` | Tercera línea/familia de producto | igual que arriba | "Línea Climatización" |
| `{{CIUDAD}}` | Ciudad donde opera el negocio | `index.html`, `data/*.json`, `robots.txt` (indirectamente vía contenido) | "Arequipa" |
| `{{PAIS}}` | País donde opera el negocio | `index.html`, `data/*.json` | "Perú" |
| `{{MONEDA}}` | Símbolo o código de moneda usado para mostrar precios | `data/configuracion.json`, `data/slots/financiamiento.json`, `docs/*.md` | "S/" o "PEN" |
| `{{SLOGAN_CLIENTE}}` | Slogan o frase de marca | `index.html` (header/footer), `data/configuracion.json`, `data/slots/empresa.json`, `legales/*.html` | "Calidad que dura" |
| `{{WHATSAPP_PRINCIPAL}}` | Número de WhatsApp principal | `data/configuracion.json → whatsapp`, `script.js → CONFIG.whatsapp` | "+51999111222" |
| `{{EMAIL_CONTACTO}}` | Correo de contacto del negocio | `data/configuracion.json`, `data/slots/empresa.json`, `legales/*.html` | "contacto@negocio.pe" |
| `{{DIRECCION_PRINCIPAL}}` | Dirección de la sede principal | `data/slots/sedes.json`, `docs/*.md` | "Av. Principal 123, Distrito" |
| `{{SEO_TITLE}}` | Título SEO completo (`<title>`, og:title, twitter:title) | `index.html`, `data/configuracion.json → etiquetasSEO`, `data/slots/seo.json` | "Mi Negocio \| Tienda en Arequipa" |
| `{{SEO_DESCRIPTION}}` | Meta description / og:description / twitter:description | `index.html`, `data/configuracion.json → etiquetasSEO`, `data/slots/seo.json` | "Catálogo, atención y servicio en Arequipa, Perú." |
| `{{INSTAGRAM}}` | Handle de Instagram | `data/configuracion.json`, `docs/*.md` | "@negocio.oficial" |
| `{{FACEBOOK}}` | Página/handle de Facebook | igual que arriba | "/NegocioOficial" |
| `{{PRUEBA_SOCIAL}}` | Reseñas, calificación, seguidores | `docs/*.md` | "4.5 estrellas — 120 reseñas" |

---

## Variables adicionales (agregadas durante la sanitización, no solicitadas explícitamente pero necesarias)

Estos datos también eran específicos del proyecto de origen y se generalizaron por la misma razón que los anteriores — dejarlos como texto literal habría sido un dato real filtrado en la plantilla.

| Variable | Descripción | Dónde aparece |
|----------|-------------|----------------|
| `{{WHATSAPP_SECUNDARIO}}` | Segundo número de WhatsApp/teléfono, si el negocio tiene más de un canal | `docs/*.md` |
| `{{DOMINIO_SITIO}}` | Dominio real donde se publicará el sitio (ej. `negocio.github.io` o dominio propio) | `robots.txt`, `sitemap.xml`, `index.html` (canonical, Open Graph) |
| `{{COORDENADAS}}` | Coordenadas GPS de la sede principal | `docs/*.md` |
| `{{PLUS_CODE}}` | Plus Code de Google Maps de la sede principal | `docs/*.md` |
| `{{ENLACE_CORTO}}` | Enlace corto (bit.ly u otro) que el negocio use en redes | `docs/*.md` |
| `{{NOMBRE_CLIENTE_SLUG}}` | Versión en minúsculas/slug del nombre comercial (usada en handles/correos compuestos) | `docs/*.md` |
| `{{NOMBRE_SEDE_1}}` | Nombre de la primera sede de ejemplo (ej. "Sede Centro") | `data/configuracion.json`, `data/slots/sedes.json`, `docs/*.md` |
| `{{NOMBRE_SEDE_2}}` | Nombre de la segunda sede de ejemplo (ej. "Sede Norte") | `data/slots/sedes.json`, `docs/*.md` |

---

## Reglas al reemplazar

1. **No reemplaces una variable con otro placeholder.** Si todavía no tienes el dato real, deja el campo en `"pendiente"` o `"PENDIENTE"` (texto literal, no `{{ }}`) — eso ya tiene significado especial en el sistema de validación (`normalizarEstadoAprobacion()`, badges "Consultar").
2. **No reutilices `{{WHATSAPP_PRINCIPAL}}` para un número no confirmado.** Completar la variable con un número real no lo aprueba automáticamente — `data/configuracion.json → whatsappConfirmado` debe seguir en `false` hasta aprobación explícita (ver `control-publicacion-datos.md`).
3. **Revisa cada coincidencia en contexto**, especialmente en `index.html` (meta tags) y `script.js` (mensajes de consola/WhatsApp) — un reemplazo mecánico sin revisar puede dejar una frase gramaticalmente extraña.
4. **Los identificadores internos** (`id` de productos: `producto-demo-1`, `producto-demo-2`, `producto-demo-3`; rutas en `assets/productos/demo/`) ya son genéricos de fábrica — renómbralos a algo propio del nuevo catálogo si lo prefieres, pero no es obligatorio para evitar una filtración de datos (no contienen información real de ningún negocio).

---

## Datos de ejemplo que NO son variables (y por qué)

`data/catalogo.json` trae 3 productos demo (`producto-demo-1/2/3`) con todos los campos comerciales en `"PENDIENTE"` (precio, cuota, stock) y sus flags `*Confirmado` en `false` — a propósito, **no** con precios ficticios que parezcan reales. Esto es intencional: la plantilla debe verse funcional sin necesitar texto inventado. Reemplaza `"PENDIENTE"` por los datos reales del nuevo catálogo cuando los tengas, y cambia los flags de confirmación a `true` solo tras aprobación explícita (ver `control-publicacion-datos.md`).
