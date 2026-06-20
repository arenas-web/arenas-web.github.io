# Cómo Usar la Plantilla

Guía paso a paso para convertir `business-static-web-framework` en el sitio real de un nuevo cliente.

---

## Paso 0 — Copiar la plantilla

No trabajes directamente sobre `_template/`. Copia la carpeta completa `business-static-web-framework/` a la ubicación del nuevo proyecto (un nuevo repositorio o una nueva carpeta de trabajo).

```bash
cp -r business-static-web-framework/ ../nuevo-cliente-web/
cd ../nuevo-cliente-web/
```

## Paso 1 — Reunir la información del cliente

Antes de tocar una sola línea, reúne (no inventes) los datos reales del negocio:

- Nombre comercial y nombres usados en redes
- Marca(s) que vende y líneas de producto
- Ciudad y país
- WhatsApp(s) reales — y si ya están autorizados para publicarse o no
- Correo de contacto
- Dirección(es) de tienda, coordenadas, horarios
- Redes sociales (Instagram, Facebook, enlace corto si tiene)
- Prueba social real (reseñas, seguidores) — si la tienes, anótala; si no, déjala pendiente

Si algún dato no está confirmado, **no lo completes con un valor de ejemplo que parezca real**. Déjalo como `"pendiente"` o `"PENDIENTE"`.

## Paso 2 — Reemplazar las variables

Abre `variables-de-personalizacion.md` y reemplaza cada `{{VARIABLE}}` en todos los archivos (`index.html`, `data/*.json`, `data/slots/*.json`, `robots.txt`, `sitemap.xml`) por el dato real correspondiente — o, si el dato real es definitivo y confirmado, por el valor real entre comillas normales (no entre `{{ }}`).

Recomendado: usar búsqueda y reemplazo global de tu editor, variable por variable, revisando cada coincidencia antes de aceptar el cambio (algunas variables aparecen en contextos sensibles como meta tags SEO).

## Paso 3 — Adaptar el catálogo

`data/catalogo.json` trae 4 productos de ejemplo con la estructura completa. Para cada producto real:

1. Cambia `id`, `linea`, `modelo`, `descripcion`, etc. por los datos reales.
2. Deja `precioConfirmado`, `cuotaConfirmada`, `stockConfirmado` y `promocionConfirmada` en `false` hasta que el negocio confirme esos valores específicos.
3. Deja `estadoAprobacion` en `"pendiente"` hasta aprobación explícita.
4. No subas fotos de archivo (`fotoPrincipal`, `fotoSecundaria`) hasta tener las imágenes reales — el sitio ya maneja con un placeholder visual cualquier ruta que no cargue.

Ver `guia-catalogo-json.md` (heredado de la arquitectura base) para el esquema completo.

## Paso 4 — Configurar `data/slots/`

Revisa cada archivo en `data/slots/` y complétalo con los datos reales del cliente, manteniendo siempre los flags de confirmación en `false`/`"pendiente"` hasta que haya aprobación.

`data/slots/control.json` debe permanecer con su configuración conservadora de fábrica (todas las banderas en `false`, `googleSheetsConectado: false`) salvo que el proyecto explícitamente decida lo contrario con autorización del responsable del proyecto.

## Paso 5 — Adaptar el diseño visual

Esta plantilla **no define identidad visual final**. `style.css` trae un sistema de variables (colores, tipografías, espaciados) listo para ajustar, pero la decisión de paleta, tipografía y estilo del hero es responsabilidad del equipo de diseño de cada proyecto — no viene resuelta en la plantilla.

## Paso 6 — Validar antes de publicar

Antes de considerar el sitio listo:

1. Verifica que no quede ninguna `{{VARIABLE}}` sin reemplazar: `grep -rn "{{" .`
2. Verifica que los JSON sean válidos.
3. Ejecuta `node --check script.js`.
4. Pasa `checklist-nuevo-cliente.md` completo.
5. Pasa `checklist-auditoria-codex.md` antes de publicar en producción.

## Paso 7 — Publicar

El sitio es 100% estático — para GitHub Pages: activar Pages en la configuración del repositorio, rama `main`, carpeta raíz. No requiere build step ni configuración de servidor.

---

## Si vas a usar varias IAs en el proceso

Ver `flujo-chatgpt-gemini-claude-codex.md` y la carpeta `prompts-maestros/` — contiene prompts ya redactados para cada etapa (estrategia, panel de Sheets, Apps Script, adaptación de código, auditoría).
