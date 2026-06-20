# Checklist — Adaptar la Plantilla a un Nuevo Cliente

Marca cada ítem antes de considerar el sitio listo para auditoría (`checklist-auditoria-codex.md`).

---

## 1. Información recopilada (no inventada)

- [ ] Nombre comercial real confirmado
- [ ] Nombres usados en redes sociales confirmados
- [ ] Marca(s) principal(es) que vende el negocio
- [ ] Líneas/familias de producto reales
- [ ] Ciudad y país de operación
- [ ] Rubro y propuesta de valor del negocio

## 2. Contacto y ubicación

- [ ] Número(s) de WhatsApp reales obtenidos — **y se sabe si están autorizados para publicarse o no**
- [ ] Correo de contacto real
- [ ] Dirección(es) de cada sede física
- [ ] Coordenadas / Plus Code de cada sede (si aplica)
- [ ] Horarios reales de atención por sede
- [ ] Instagram, Facebook y enlace corto reales (si el negocio los usa)

## 3. Variables reemplazadas

- [ ] Se ejecutó `grep -rn "{{" .` y no queda ninguna variable sin reemplazar
- [ ] Se revisó `variables-de-personalizacion.md` completo
- [ ] Las variables se reemplazaron por datos reales **o** se dejaron como `"pendiente"`/`"PENDIENTE"` — nunca con un valor inventado que parezca real

## 4. Catálogo

- [ ] `data/catalogo.json` tiene los productos reales del cliente (no los de ejemplo)
- [ ] Cada producto con precio real tiene `precioConfirmado` reflejando si gerencia lo aprobó
- [ ] Cada producto con cuota real tiene `cuotaConfirmada` reflejando aprobación
- [ ] Cada producto con disponibilidad confirmada tiene `stockConfirmado` reflejando aprobación
- [ ] Cada promoción real tiene `promocionConfirmada` y `estadoAprobacion` reflejando aprobación
- [ ] Las rutas de imágenes (`fotoPrincipal`, `fotoSecundaria`) son locales (`assets/...`) — no hay URLs externas
- [ ] Si no hay fotos reales todavía, se deja el campo vacío o sin asset subido (el sitio ya maneja el placeholder)

## 5. Sedes

- [ ] `data/slots/sedes.json` tiene las sedes reales
- [ ] Ninguna sede tiene `estadoAprobacion: "aprobado"` sin que gerencia la haya confirmado explícitamente
- [ ] Las URLs de Google Maps (si existen) son HTTPS de un dominio de Google Maps real

## 6. WhatsApp

- [ ] `data/configuracion.json → whatsapp` tiene el número real (o sigue como placeholder si no se tiene)
- [ ] `data/configuracion.json → whatsappConfirmado` está en `false` salvo aprobación explícita de gerencia
- [ ] `data/slots/whatsapp.json` refleja los canales reales por área, si el negocio los tiene segmentados

## 7. Garantía y financiamiento

- [ ] No se publicó ninguna afirmación de garantía específica sin respaldo real (ver textos neutrales sugeridos en `control-publicacion-datos.md`)
- [ ] No se publicó ninguna condición de financiamiento (tasas, plazos, "sin burocracia") sin confirmación real

## 8. Control de publicación

- [ ] `data/slots/control.json` permanece con su configuración conservadora de fábrica, salvo decisión explícita documentada
- [ ] `googleSheetsConectado` sigue en `false`
- [ ] `ultimaRevisionGerencial` refleja el estado real (sigue en `"pendiente"` si no hubo revisión formal)

## 9. SEO y assets

- [ ] `<title>`, meta description, Open Graph y canonical en `index.html` usan el nombre/ciudad reales
- [ ] Favicon y imagen Open Graph: si no existen archivos reales, las referencias están comentadas/documentadas, no rotas
- [ ] `robots.txt` y `sitemap.xml` apuntan al dominio real (o siguen con `{{DOMINIO_SITIO}}` si aún no se decide)

## 10. Legales

- [ ] Las 6 páginas en `legales/` siguen marcadas como contenido provisional pendiente de revisión legal, salvo que un abogado ya las haya validado
- [ ] Razón social y RUC (o equivalente del país) están confirmados o explícitamente marcados como pendientes

## 11. Validación técnica

- [ ] Todos los JSON son válidos
- [ ] `node --check script.js` pasa sin errores
- [ ] No queda ningún `innerHTML` con datos editables
- [ ] No queda ningún enlace `wa.me` con número placeholder
- [ ] El sitio funciona abriendo `index.html` con un servidor local (no `file://`)

---

Cuando todos los ítems estén marcados, continuar con `checklist-auditoria-codex.md` antes de publicar.
