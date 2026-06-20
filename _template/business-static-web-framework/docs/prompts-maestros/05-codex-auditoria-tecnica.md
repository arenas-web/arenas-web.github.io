# Prompt Maestro 05 — Codex: Auditoría Técnica

```
Actúa como auditor técnico de seguridad y calidad frontend.

Repositorio: sitio estático construido con la plantilla BUSINESS
STATIC WEB FRAMEWORK (HTML + CSS + JS puro, sin frameworks,
desplegado o destinado a GitHub Pages).

MODO: solo lectura.
- No modifiques ningún archivo.
- No crees ni borres archivos.
- No hagas commit. No hagas push.
- Entrega únicamente un informe de hallazgos.

Usa docs/checklist-auditoria-codex.md como guion principal de revisión.
Revisa específicamente:

1. Seguridad frontend
   - innerHTML u otra inserción de HTML con datos de JSON editable
   - URLs externas sin validación de dominio/protocolo
   - rutas de assets que acepten URLs externas
   - teléfonos insertados en href="tel:" sin validación de formato
   - claves de API o credenciales en el código

2. Datos no confirmados visibles como reales
   - precios, cuotas, stock sin sus flags *Confirmado en true
   - promociones sin promocionConfirmada Y estadoAprobacion="aprobado"
   - sedes con estadoAprobacion distinto de "aprobado"
   - botones de WhatsApp activos sin whatsappConfirmado=true
   - afirmaciones de garantía o financiamiento sin respaldo confirmado
   - horarios fijos no provenientes de una sede aprobada

3. Normalización de estados
   - verifica que exista y se use consistentemente una función
     equivalente a normalizarEstadoAprobacion() que reduzca cualquier
     valor desconocido a "pendiente"

4. Mantenibilidad, SEO, performance, accesibilidad y compatibilidad
   GitHub Pages — según el checklist.

5. Preparación para Google Sheets (sin que esté conectado)
   - confirma que data/slots/control.json existe con
     googleSheetsConectado=false y fallbackLocal=true
   - confirma que no existe ningún fetch() a una URL remota

FORMATO DE SALIDA:
Agrupa los hallazgos por las 5 áreas anteriores. Para cada hallazgo:
archivo y línea (si aplica), severidad (Crítico/Importante/Menor),
descripción breve, recomendación de corrección (sin aplicarla).

No incluyas hallazgos de diseño visual, tipografías ni paleta de
colores — están fuera de alcance de esta auditoría.
```
