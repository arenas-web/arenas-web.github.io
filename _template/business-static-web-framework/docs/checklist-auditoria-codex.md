# Checklist de Auditoría Codex (Genérico)

Checklist técnico para que Codex (u otro auditor) revise cualquier sitio construido a partir de esta plantilla, antes de publicarlo. Complementa `checklist-nuevo-cliente.md`, que cubre la parte de contenido/negocio.

---

## 1. Seguridad frontend

- [ ] Ningún `innerHTML` recibe datos provenientes de JSON editable (`data/*.json`, `data/slots/*.json`) — todo se inserta con `textContent`/`createElement`
- [ ] Toda URL externa generada desde datos editables pasa por un validador de dominio + protocolo (equivalente a `esURLExternaSegura()`)
- [ ] Toda ruta de imagen/asset generada desde datos editables pasa por un validador de ruta local (equivalente a `esRutaLocalSegura()`)
- [ ] Todo teléfono usado en `href="tel:"` pasa por un validador de formato (equivalente a `esTelefonoSeguro()`)
- [ ] No hay claves de API, tokens ni credenciales en el código frontend
- [ ] Los enlaces externos usan `rel="noopener noreferrer"`

## 2. Datos no confirmados

- [ ] Ningún precio se muestra como real si `precioConfirmado !== true`
- [ ] Ninguna cuota se muestra como real si `cuotaConfirmada !== true`
- [ ] Ningún stock se muestra como real si `stockConfirmado !== true`
- [ ] Ninguna promoción se muestra si `promocionConfirmada !== true` **o** `estadoAprobacion` normalizado no es `"aprobado"`
- [ ] Ninguna sede se muestra si su `estadoAprobacion` normalizado no es exactamente `"aprobado"`
- [ ] Ningún botón/enlace de WhatsApp queda activo si `whatsappConfirmado !== true`
- [ ] No hay afirmaciones de garantía específica sin respaldo confirmado
- [ ] No hay condiciones de financiamiento (tasas, plazos, "sin burocracia", "crédito accesible") sin confirmación real
- [ ] No hay horarios fijos visibles que no provengan de una sede con `estadoAprobacion: "aprobado"`

## 3. Normalización de estados

- [ ] Existe una función equivalente a `normalizarEstadoAprobacion()` que reduce cualquier estado extendido/desconocido a uno de: `pendiente`, `aprobado`, `rechazado`, `oculto`
- [ ] Ningún componente de render confía en comparaciones de string sin pasar por el normalizador

## 4. Mantenibilidad

- [ ] No hay duplicación de la misma fuente de verdad en múltiples archivos sin documentar cuál manda (ver equivalente a `fuente-unica-datos.md`)
- [ ] No hay código muerto evidente ni funciones sin uso
- [ ] Los módulos de `script.js` están organizados y comentados de forma consistente

## 5. SEO

- [ ] `<title>`, meta description, Open Graph y Twitter Card están completos y no vacíos
- [ ] `robots.txt` y `sitemap.xml` son coherentes entre sí (páginas con `noindex` no aparecen en el sitemap)
- [ ] Jerarquía de headings sin saltos (un solo `<h1>`, luego `<h2>` → `<h3>`)
- [ ] No hay referencias a imágenes (favicon, Open Graph) que generen 404 — si no existen, están comentadas con nota explicativa

## 6. Performance

- [ ] Imágenes fuera del viewport inicial usan `loading="lazy"`
- [ ] Las animaciones usan `transform`/`opacity`, no propiedades que fuercen layout
- [ ] `prefers-reduced-motion` está respetado
- [ ] No hay dependencias de CDN externo ni frameworks añadidos

## 7. Accesibilidad

- [ ] Elementos interactivos tienen `aria-label` o texto visible descriptivo
- [ ] El formulario usa `aria-required`, `aria-invalid`, `aria-describedby` correctamente
- [ ] Foco visible al navegar por teclado
- [ ] Botones/enlaces deshabilitados (ej. WhatsApp no confirmado) usan `aria-disabled="true"`, no solo estilo visual

## 8. Compatibilidad GitHub Pages

- [ ] No hay `package.json` ni build step
- [ ] No hay rutas absolutas que rompan al servir desde una subcarpeta
- [ ] Todo `<script>`/`<link rel="stylesheet">` es local, sin CDN externo

## 9. Preparación para Google Sheets (sin conectar)

- [ ] `data/slots/control.json` existe y tiene `googleSheetsConectado: false`, `fallbackLocal: true`
- [ ] No existe ningún código de `fetch()` apuntando a una URL remota
- [ ] El contrato de columnas (`contrato-datos-google-sheets-generico.md`) está documentado y es coherente con los esquemas reales de `script.js`

---

## Formato de entrega de hallazgos

Cada hallazgo debe categorizarse como:

- **Crítico** — expone datos sensibles, publica información no confirmada como real, o rompe el sitio
- **Importante** — afecta SEO, accesibilidad, performance o mantenibilidad a mediano plazo
- **Menor** — mejora de estilo de código sin urgencia

El auditor no aprueba ni publica el sitio — solo entrega el listado de hallazgos para que el equipo decida.
