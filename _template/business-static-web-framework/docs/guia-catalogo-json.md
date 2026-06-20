# Guía del Catálogo JSON — {{NOMBRE_CLIENTE}}

**Archivo:** `data/catalogo.json`

---

## ¿Para qué sirve este archivo?

`catalogo.json` es la fuente principal de datos del catálogo de productos. El sitio lo carga dinámicamente con `fetch()` en `script.js` → `cargarCatalogo()`. No hay servidor backend — todo se sirve como archivo estático desde GitHub Pages.

---

## Esquema completo de cada producto

```json
{
  "id":               "producto-demo-1",
  "visible":          true,
  "destacado":        true,
  "orden":            1,
  "linea":            "{{LINEA_PRODUCTO_1}}",
  "modelo":           "Modelo Demo 1",
  "version":          "",
  "cilindrada":       "",
  "precio":           "PENDIENTE",
  "precioConfirmado": false,
  "cuotaInicial":     "PENDIENTE",
  "cuotaConfirmada":  false,
  "financiamiento":   "PENDIENTE",
  "stock":            "PENDIENTE",
  "stockConfirmado":  false,
  "colores":          [],
  "descripcion":      "Texto breve del producto (máx 120 caracteres recomendado).",
  "beneficio":        "PENDIENTE",
  "promocion":        "",
  "promocionConfirmada": false,
  "estadoAprobacion": "pendiente",
  "fotoPrincipal":    "assets/productos/demo/producto-demo-1.webp",
  "fotoSecundaria":   "assets/productos/demo/producto-demo-1.webp",
  "fichaTecnica":     "",
  "whatsapp":         "{{WHATSAPP_PRINCIPAL}}",
  "estado":           "activo"
}
```

---

## Descripción de campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | Identificador único. Kebab-case. No cambiar después de publicar. |
| `visible` | boolean | ✅ | `false` oculta el producto del catálogo sin borrarlo. |
| `destacado` | boolean | ✅ | `true` aparece en sección de destacados. |
| `orden` | number | ✅ | Número de orden en la grilla. El menor aparece primero. |
| `linea` | string | ✅ | Línea/familia de producto. Debe coincidir con los filtros configurados: `{{LINEA_PRODUCTO_1}}`, `{{LINEA_PRODUCTO_2}}`, `{{LINEA_PRODUCTO_3}}` (o las que el negocio agregue). |
| `modelo` | string | ✅ | Nombre del producto/modelo. |
| `version` | string | No | Variante o edición, si aplica al rubro. |
| `cilindrada` | string | No | Campo heredado del rubro de origen de esta plantilla (motocicletas). Renómbralo o elimínalo si tu rubro no lo necesita — ej. podría convertirse en `capacidad`, `tamaño`, `potencia`, etc. |
| `precio` | string | ✅ | Precio. Usar `"PENDIENTE"` hasta tener el valor real confirmado. |
| `precioConfirmado` | boolean | ✅ | **Obligatorio.** Mientras sea `false`, el sitio muestra "Consultar" en vez del precio. |
| `cuotaInicial` | string | No | Cuota de entrada, si el negocio ofrece financiamiento. |
| `cuotaConfirmada` | boolean | ✅ | **Obligatorio.** Mismo criterio que `precioConfirmado`. |
| `financiamiento` | string | No | Condiciones de financiamiento, si aplica. No publicar plazos/tasas sin confirmar. |
| `stock` | string | No | Estado de disponibilidad (texto libre: "Disponible", "Agotado", etc.) |
| `stockConfirmado` | boolean | ✅ | **Obligatorio.** Mientras sea `false`, el sitio muestra "Consultar disponibilidad". |
| `colores` | array | No | Lista de variantes/colores disponibles, si aplica. |
| `descripcion` | string | ✅ | Descripción breve para la tarjeta. Máx 150 caracteres. Texto plano, sin HTML. |
| `beneficio` | string | No | Beneficio o característica principal. |
| `promocion` | string | No | Texto de promo vigente. Cadena vacía `""` = sin promo. |
| `promocionConfirmada` | boolean | ✅ | **Obligatorio.** La promoción solo se publica si esto es `true` **y** `estadoAprobacion` es `"aprobado"`. |
| `estadoAprobacion` | string | ✅ | Uno de: `"pendiente"`, `"aprobado"`, `"rechazado"`, `"oculto"`. Ver `control-publicacion-datos.md`. |
| `fotoPrincipal` | string | No | Ruta local (`assets/...`). Si no existe el archivo, se muestra un placeholder automático. |
| `fotoSecundaria` | string | No | Ruta local a imagen secundaria (galería, comparador). |
| `fichaTecnica` | string | No | Ruta local al PDF de ficha técnica, si aplica al rubro. |
| `whatsapp` | string | — | **Campo deprecado**, no leído por `script.js`. La fuente única de WhatsApp es `data/configuracion.json → whatsapp`. |
| `estado` | string | ✅ | "activo", "descontinuado", "proximamente". |

---

## Valores permitidos por campo

### `estadoAprobacion`
```
"pendiente" | "aprobado" | "rechazado" | "oculto"
```
Cualquier otro valor se normaliza automáticamente a `"pendiente"` (`normalizarEstadoAprobacion()` en `script.js`).

### `estado`
```
"activo" | "descontinuado" | "proximamente"
```

---

## Cómo agregar un producto nuevo

1. Copia un bloque existente al final del array (antes del `]`).
2. Cambia el `id` por uno único en kebab-case (ej: `"producto-demo-4"` o un id propio).
3. Asigna el siguiente número de `orden`.
4. Completa los campos requeridos (✅). Usa `"PENDIENTE"` o `false` en los campos de confirmación si el dato real todavía no está validado — nunca inventes un valor que parezca real.
5. Deja `visible: false` si no está listo para publicarse.
6. Guarda el archivo.

## Cómo ocultar un producto sin borrarlo

Cambia `"visible": true` a `"visible": false`. El producto permanece en el archivo pero no aparece en el catálogo web.

## Cómo marcar un producto como agotado

Cambia `"stockConfirmado": true` y `"stock"` al valor real (ej. `"Agotado"`). Mientras `stockConfirmado` sea `false`, el sitio siempre mostrará "Consultar disponibilidad" sin importar el texto en `stock`.

---

## Ruta de imágenes

Las imágenes se guardan en `assets/productos/<categoria>/`. Ejemplo con la estructura demo de la plantilla:

```
assets/productos/demo/producto-demo-1.webp   ← fotoPrincipal / fotoSecundaria
```

**Recomendaciones para fotos:**
- Proporción: 16:9 u otra consistente para toda la grilla
- Formato: WebP o JPG optimizado
- Peso máximo recomendado: 150 KB por imagen
- Rutas siempre locales bajo `assets/` — nunca URLs externas (el sitio las rechaza automáticamente si no empiezan con `assets/`)

---

## Migración futura a Google Sheets

Ver `contrato-datos-google-sheets-generico.md` para el contrato completo de columnas. En resumen:

1. Hoja de Google Sheets con columnas equivalentes a este esquema.
2. Apps Script expone esa hoja como JSON de solo lectura.
3. `data/catalogo.json` local sigue funcionando como fallback permanente.
4. El esquema no cambia — mismos nombres de campo, para no romper el frontend.

**No conectado todavía.** Ver `contrato-datos-google-sheets-generico.md` para el estado real.
