# Contexto Comercial del Cliente — Ejemplo Genérico

**Propósito:** Plantilla de referencia para recopilar y organizar la información comercial real de un nuevo cliente antes de adaptar `BUSINESS STATIC WEB FRAMEWORK` a su negocio. Copia este archivo y complétalo con datos reales — nunca con ejemplos inventados que parezcan reales.

**Estado de este documento:** Es un formulario/plantilla, no contiene datos de ningún cliente real. Todos los valores de ejemplo usan `{{VARIABLE}}` o la palabra `PENDIENTE`.

---

## Identidad comercial

| Campo | Valor |
|-------|-------|
| Nombre comercial | {{NOMBRE_CLIENTE}} |
| Nombres usados en redes | PENDIENTE |
| Rubro | {{RUBRO_CLIENTE}} |
| Sello clave | PENDIENTE (ej. "distribuidor autorizado de [marca]") |
| Trayectoria | PENDIENTE |
| Mensaje de marca actual | PENDIENTE |

---

## Catálogo y productos

| Categoría | Detalle |
|-----------|---------|
| Marca principal | {{MARCA_PRINCIPAL}} |
| Líneas de producto | {{LINEA_PRODUCTO_1}}, {{LINEA_PRODUCTO_2}}, {{LINEA_PRODUCTO_3}} |
| Otros productos/servicios complementarios | PENDIENTE |

**Nota:** antes de cargar el catálogo real en `data/catalogo.json`, confirma que las líneas y modelos coinciden exactamente con lo que el negocio vende — no asumas ni completes con productos de ejemplo.

---

## Servicios ofrecidos

- PENDIENTE (listar servicios reales: venta, taller, delivery, instalación, etc.)

---

## Propuesta de valor

- PENDIENTE (qué distingue a este negocio de su competencia)

---

## Contacto y redes sociales

| Canal | Valor |
|-------|-------|
| WhatsApp principal | {{WHATSAPP_PRINCIPAL}} |
| WhatsApp secundario (si aplica) | {{WHATSAPP_SECUNDARIO}} |
| Email | {{EMAIL_CONTACTO}} |
| Instagram | {{INSTAGRAM}} |
| Facebook | {{FACEBOOK}} |
| Enlace corto (si lo usan) | {{ENLACE_CORTO}} |

**Importante:** que el cliente entregue estos datos no significa que deban publicarse de inmediato. `data/configuracion.json → whatsappConfirmado` y los `estadoAprobacion` correspondientes deben seguir en `false`/`"pendiente"` hasta aprobación explícita — ver `control-publicacion-datos.md`.

---

## Ubicación

| Campo | Valor |
|-------|-------|
| Dirección sede principal | {{DIRECCION_PRINCIPAL}} |
| Ciudad | {{CIUDAD}} |
| País | {{PAIS}} |
| Coordenadas (si las tienen) | {{COORDENADAS}} |
| Plus Code (si lo tienen) | {{PLUS_CODE}} |

---

## Horarios (tentativos hasta confirmación)

| Día | Horario |
|-----|---------|
| Lunes a Viernes | PENDIENTE |
| Sábado | PENDIENTE |
| Domingo | PENDIENTE |

---

## Prueba social

| Plataforma | Dato |
|------------|------|
| Google | {{PRUEBA_SOCIAL}} |
| Facebook / Instagram | {{PRUEBA_SOCIAL}} |

**Nota:** si las cifras provienen de fuentes o fechas distintas, documenta cuándo se midió cada una y verifica el número actual antes de publicarlo como definitivo.

---

## SEO

| Campo | Valor |
|-------|-------|
| Título SEO | {{SEO_TITLE}} |
| Descripción SEO | {{SEO_DESCRIPTION}} |

---

## CTAs sugeridos

- PENDIENTE (ej. "Cotiza por WhatsApp", "Ver catálogo", "Solicita información")

---

## Datos pendientes de aprobación gerencial

Usa esta sección como checklist antes de marcar cualquier dato como `"aprobado"`:

| Dato | Estado |
|------|--------|
| WhatsApp | Pendiente |
| Horarios | Pendiente |
| Financiamiento (si aplica al rubro) | Pendiente |
| Garantía (si aplica al rubro) | Pendiente |
| Catálogo y precios | Pendiente |
| Logo, fotos y assets | Pendiente |
| Prueba social | Pendiente de validación final |

---

## Referencias relacionadas

- `mapeo-contexto-a-arquitectura.md` — cómo este contexto se conecta con el panel de datos y la arquitectura de la plantilla
- `requisitos-pendientes-gerencia.md` — checklist general de aprobaciones pendientes
- `fuente-unica-datos.md` — qué archivo manda por dominio de datos
- `contrato-datos-google-sheets-generico.md` — contrato de columnas para una futura integración (no conectada)
