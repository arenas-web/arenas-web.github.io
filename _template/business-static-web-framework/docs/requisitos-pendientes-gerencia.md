# Requisitos Pendientes de Gerencia — {{NOMBRE_CLIENTE}}

**Propósito:** Checklist de todo lo que solo el dueño/gerencia de {{NOMBRE_CLIENTE}} puede confirmar. Ningún agente de IA ni desarrollador debe inventar estos datos.

---

## 1. Revisión de dueños

- [ ] Aprobar el concepto de marca y tono comercial actual ("{{SLOGAN_CLIENTE}}")
- [ ] Confirmar el rubro y posicionamiento (`{{RUBRO_CLIENTE}}`)
- [ ] Validar la lista de líneas de producto que se comercializan realmente hoy ({{LINEA_PRODUCTO_1}}, {{LINEA_PRODUCTO_2}}, {{LINEA_PRODUCTO_3}} — ¿alguna se descontinuó o se agregó?)
- [ ] Aprobar el producto que aparece como "destacado" en el sitio

---

## 2. Catálogo y disponibilidad

- [ ] Confirmar lista completa de productos activos en `data/catalogo.json`
- [ ] Validar precios reales de cada producto (actualmente en `"PENDIENTE"`)
- [ ] Confirmar disponibilidad confirmada por producto
- [ ] Validar variantes/colores disponibles por producto
- [ ] Confirmar si hay productos por descontinuar o por llegar
- [ ] Aportar fichas técnicas reales, si el rubro las requiere (campo `fichaTecnica`)

---

## 3. WhatsApp reales

Archivo: `data/slots/whatsapp.json` — **todos los campos están en "pendiente"**

- [ ] WhatsApp general
- [ ] WhatsApp de ventas
- [ ] WhatsApp de financiamiento (si aplica)
- [ ] WhatsApp de servicio técnico (si aplica)
- [ ] WhatsApp de repuestos (si aplica)
- [ ] WhatsApp sede {{NOMBRE_SEDE_1}} (si existe)
- [ ] WhatsApp sede {{NOMBRE_SEDE_2}} (si existe)
- [ ] Confirmar si se usa un único número para todo o números separados por canal

---

## 4. Sedes exactas

Archivo: `data/slots/sedes.json`

- [ ] Confirmar cuántas sedes existen realmente (la plantilla incluye 2 sedes de ejemplo: {{NOMBRE_SEDE_1}} y {{NOMBRE_SEDE_2}} — ambas con `visible: false` y `estadoAprobacion: "pendiente"` hasta confirmación)
- [ ] Dirección exacta de cada sede confirmada
- [ ] Horario real de cada sede (pueden diferir entre sedes)
- [ ] Teléfono fijo de cada sede (si aplica)
- [ ] Coordenadas o enlace de Google Maps de cada sede
- [ ] Foto real de cada local

---

## 5. Requisitos de financiamiento (si el negocio lo ofrece)

Archivo: `data/slots/financiamiento.json`

- [ ] Lista real de requisitos para acceder a crédito
- [ ] Documentos exactos que debe presentar el cliente
- [ ] Entidades financieras aliadas reales (bancos, financieras)
- [ ] Cuota inicial mínima real por categoría de producto
- [ ] Tasa de interés referencial (si se decide publicarla)
- [ ] Confirmar dónde se realiza la evaluación final (presencial, en línea, etc.)

---

## 6. Especificaciones técnicas

- [ ] Validar las especificaciones técnicas reales de cada producto en el catálogo (los campos exactos dependen del rubro — tamaño, capacidad, potencia, dimensiones, etc.)
- [ ] Confirmar beneficios reales incluidos en la compra (`data/slots/beneficios.json` — todos los campos están en "pendiente")
- [ ] Validar tiempo y alcance real de cualquier garantía ofrecida
- [ ] Confirmar qué accesorios o elementos se entregan incluidos con la compra, si aplica

---

## 7. Fotos oficiales

- [ ] Fotos de cada producto (`assets/productos/<categoria>/`)
- [ ] Foto o video para el hero (`data/slots/hero.json → imagenHero / videoHero`)
- [ ] Logo oficial en SVG (`assets/logo/`)
- [ ] Favicon oficial (`assets/favicon/`)
- [ ] Imagen Open Graph para redes sociales (1200×630 px aprox.)
- [ ] Fotos de las sedes/tiendas (`assets/tiendas/`)
- [ ] Foto del local o equipo de atención (`assets/taller/` o equivalente según rubro)
- [ ] Fotos de clientes para testimonios, **con consentimiento firmado o verbal documentado** (`assets/clientes/`)

---

## 8. Legales

- [ ] Razón social oficial completa
- [ ] Identificación tributaria (RUC o equivalente del país)
- [ ] Representante legal
- [ ] Domicilio legal (puede diferir de la dirección comercial de venta)
- [ ] Revisión de los 6 documentos legales por un abogado:
  - Política de privacidad
  - Términos y condiciones
  - Tratamiento de datos personales
  - Cookies
  - Libro de reclamaciones (si aplica en el país)
  - Condiciones de financiamiento (si aplica)
- [ ] Decisión sobre inscripción en el registro de protección de datos personales correspondiente al país
- [ ] Decisión sobre implementar formulario digital de reclamaciones o mantener solo WhatsApp/correo

---

## 9. Precios

- [ ] Confirmar precio final de cada producto (sujeto a cambios de mercado)
- [ ] Confirmar cuota inicial por producto, si aplica financiamiento
- [ ] Validar si los precios incluyen impuestos o se muestran aparte
- [ ] Definir política de actualización de precios (¿cada cuánto se revisan?)

---

## 10. Promociones

Archivo: `data/slots/promociones.json`

- [ ] Aprobar cada promoción antes de marcarla `visible: true`
- [ ] Confirmar vigencia exacta (fecha de inicio y fin)
- [ ] Validar que el producto de la promoción existe en stock
- [ ] Aprobar el texto comercial de cada promoción

---

## 11. Responsables de actualización

**PENDIENTE de definir con gerencia:**

- [ ] ¿Quién es responsable de mantener actualizado `data/catalogo.json` (precios y stock)?
- [ ] ¿Quién aprueba testimonios antes de publicarlos?
- [ ] ¿Quién valida promociones antes de activarlas?
- [ ] ¿Con qué frecuencia se revisa la información de sedes y horarios?
- [ ] ¿Quién tiene acceso de edición a estos archivos JSON (gerencia, marketing, desarrollador)?
- [ ] ¿Se requiere capacitación básica para que alguien no técnico edite los JSON de `data/slots/`?

---

## Cómo usar este checklist

Cada vez que gerencia confirme un dato:

1. Editar el archivo JSON correspondiente en `data/slots/` o `data/catalogo.json`
2. Cambiar el campo `estado` / `estadoAprobacion` de `"pendiente"` a `"aprobado"` (los únicos 4 valores válidos son: `pendiente`, `aprobado`, `rechazado`, `oculto`)
3. Marcar el ítem correspondiente en este checklist
4. Si el dato es legal o financiero, notificar también al asesor legal antes de publicar

Ver también: `sistema-slots-editables.md` para entender la estructura completa de los archivos editables.
