# Flujo de Trabajo: ChatGPT, Gemini, Claude Code y Codex

**Propósito:** Coordinar cuatro asistentes de IA con roles distintos al adaptar esta plantilla para un nuevo cliente, evitando que se pisen entre sí o tomen decisiones fuera de su rol.

Esta plantilla amplía el flujo de tres agentes (Claude Code, Codex, ChatGPT) heredado de la arquitectura base, agregando **Gemini** para la preparación del panel de datos en Google Sheets y su Apps Script — tareas que no requieren escribir código del sitio, sino diseñar la fuente de datos externa.

---

## Roles

### ChatGPT — Dirección estratégica
- Reúne y organiza la información del nuevo cliente.
- Decide prioridades de negocio (qué secciones importan más, qué datos son urgentes).
- Redacta o ajusta los prompts para los demás agentes.
- No escribe código ni administra la hoja de Sheets directamente.

### Gemini — Preparación de datos externos
- Diseña el panel "PANEL WEB [CLIENTE]" en Google Sheets siguiendo el contrato de columnas (`contrato-datos-google-sheets-generico.md`).
- Redacta el Apps Script que expondría esas hojas como JSON (`doGet()`), **sin publicarlo todavía** salvo autorización explícita.
- No tiene acceso al código del sitio ni decide cuándo conectar la fuente remota — eso es responsabilidad del usuario humano.

### Claude Code — Constructor del sitio
- Adapta la plantilla al nuevo cliente: reemplaza variables, ajusta catálogo y slots, aplica correcciones.
- Mantiene la arquitectura (HTML/CSS/JS puro, sin frameworks, sin build step).
- Nunca inventa datos comerciales, legales o de contacto.
- No conecta Google Sheets ni crea el endpoint salvo autorización explícita y por separado.

### Codex — Auditor técnico
- Revisa el código ya escrito por Claude Code: seguridad, accesibilidad, SEO, performance, mantenibilidad.
- Verifica específicamente que no se publiquen datos no confirmados (precios, WhatsApp, sedes, garantías, financiamiento, horarios).
- No rediseña ni decide identidad visual.

---

## Cuándo usar cada uno

| Situación | Agente |
|-----------|--------|
| Definir qué información falta del nuevo cliente | ChatGPT |
| Diseñar las columnas y pestañas del panel de Sheets | Gemini |
| Redactar el Apps Script (`doGet`) que expondría el panel como JSON | Gemini |
| Reemplazar `{{VARIABLES}}` y adaptar `data/*.json` al cliente real | Claude Code |
| Corregir hallazgos de una auditoría | Claude Code |
| Revisar seguridad/SEO/accesibilidad antes de publicar | Codex |
| Decidir si se autoriza conectar Sheets al sitio | El usuario humano — ningún agente decide esto por sí solo |

---

## Flujo recomendado para un cliente nuevo

```
1. ChatGPT recopila el contexto comercial real del cliente
        ↓
2. Claude Code adapta la plantilla (variables, catálogo, slots)
        ↓
3. Codex audita la primera versión (seguridad, datos no confirmados, SEO)
        ↓
4. Claude Code corrige los hallazgos
        ↓
5. (Opcional, fase posterior) Gemini diseña el panel de Sheets + Apps Script
        ↓
6. Codex audita de nuevo, específicamente la preparación de Sheets
        ↓
7. Solo con autorización explícita del usuario: se conecta el endpoint real
```

Los pasos 5–7 son **opcionales y posteriores** al lanzamiento inicial — el sitio debe poder publicarse y funcionar completamente con JSON local antes de considerar Sheets.

---

## Reglas que ningún agente debe romper

- Ningún agente inventa datos comerciales, legales o de contacto.
- Ningún agente conecta Google Sheets sin autorización explícita y separada.
- Ningún agente hace commit ni push sin autorización explícita en esa sesión.
- Ningún agente publica un dato con `estadoAprobacion` distinto de `"aprobado"` como si fuera real.
- Ningún agente agrega frameworks, librerías de terceros ni claves de API al frontend.

Ver `prompts-maestros/` para prompts ya redactados que reflejan estas reglas para cada agente y etapa.
