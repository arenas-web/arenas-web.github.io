# BUSINESS STATIC WEB FRAMEWORK

Plantilla madre reutilizable para sitios web comerciales estáticos (concesionarios, tiendas, negocios locales de cualquier rubro). HTML, CSS y JavaScript puro — sin frameworks, sin backend obligatorio, sin claves de API en el frontend, 100% compatible con GitHub Pages.

**Estado de esta copia: plantilla genérica, no personalizada.** No contiene datos reales de ningún cliente. Todo texto entre `{{DOBLE_LLAVE}}` debe reemplazarse antes de publicar.

---

## Qué es esta plantilla

Un esqueleto técnico completo para lanzar la web de un negocio nuevo en horas, no semanas:

- Catálogo de productos dinámico (JSON local, con contrato ya definido para una futura integración opcional con Google Sheets)
- Sistema de "slots" editables (`data/slots/`) para contenido que el negocio puede actualizar sin tocar código
- Sistema de aprobación de datos: nada se publica como real sin confirmación explícita (`estadoAprobacion`: `pendiente` / `aprobado` / `rechazado` / `oculto`)
- Formulario de cotización con validación y envío por WhatsApp (desactivado hasta que el número esté confirmado)
- Páginas legales base (privacidad, términos, cookies, datos personales, libro de reclamaciones, financiamiento)
- SEO técnico base y sistema de animaciones preparado (reveal on scroll, respeta `prefers-reduced-motion`)
- Validadores de datos defensivos: esquemas de tipos, campos obligatorios, consistencia, anti-XSS, anti-URL-externa

## Qué NO incluye

- Datos reales de ningún cliente
- Conexión activa a Google Sheets ni ningún endpoint — solo el contrato y la preparación
- Diseño visual definitivo (colores, tipografías, hero) — eso lo decide cada proyecto

---

## Cómo se usa (resumen)

1. Copia esta carpeta completa a la ubicación del nuevo proyecto — no trabajes sobre `_template/` directamente.
2. Recopila la información real del negocio (sin inventar nada).
3. Reemplaza todas las `{{VARIABLES}}` — ver lista completa abajo y en `docs/variables-de-personalizacion.md`.
4. Adapta `data/catalogo.json` con los productos reales (o deja los demo con todo en `"PENDIENTE"`).
5. Adapta `data/slots/` con los datos reales del negocio, manteniendo los flags de confirmación en `false` hasta aprobación.
6. Valida con `docs/checklist-nuevo-cliente.md` y luego con `docs/checklist-auditoria-codex.md`.
7. Publica en GitHub Pages.

Guía paso a paso completa: **`docs/como-usar-la-plantilla.md`**.

---

## Variables obligatorias

| Variable | Qué representa |
|----------|-----------------|
| `{{NOMBRE_CLIENTE}}` | Nombre comercial del negocio |
| `{{RUBRO_CLIENTE}}` | Rubro o tipo de negocio |
| `{{CIUDAD}}` | Ciudad donde opera |
| `{{PAIS}}` | País donde opera |
| `{{MARCA_PRINCIPAL}}` | Marca principal que vende (si aplica) |
| `{{SLOGAN_CLIENTE}}` | Slogan o frase de marca |
| `{{WHATSAPP_PRINCIPAL}}` | Número de WhatsApp principal |
| `{{EMAIL_CONTACTO}}` | Correo de contacto |
| `{{DIRECCION_PRINCIPAL}}` | Dirección de la sede principal |
| `{{SEO_TITLE}}` | Título SEO (`<title>`, og:title, twitter:title) |
| `{{SEO_DESCRIPTION}}` | Meta description / og:description |

Lista completa, incluidas variables secundarias (`{{LINEA_PRODUCTO_1/2/3}}`, `{{INSTAGRAM}}`, `{{FACEBOOK}}`, `{{DOMINIO_SITIO}}`, `{{NOMBRE_SEDE_1/2}}`, etc.): **`docs/variables-de-personalizacion.md`**.

Verificar que no quede ninguna sin reemplazar:
```bash
grep -rn "{{" . --include="*.html" --include="*.css" --include="*.js" --include="*.json" --include="*.md" --include="*.txt" --include="*.xml"
```

---

## Política de aprobación comercial (no negociable)

Esta plantilla nunca debe publicar como real:

- Precios, cuotas o stock sin sus flags `precioConfirmado` / `cuotaConfirmada` / `stockConfirmado` en `true`
- Promociones sin `promocionConfirmada: true` **y** `estadoAprobacion: "aprobado"`
- Números de WhatsApp sin `whatsappConfirmado: true` en `data/configuracion.json`
- Sedes sin `estadoAprobacion: "aprobado"`
- Afirmaciones de garantía o condiciones de financiamiento sin respaldo real confirmado
- Horarios fijos no aprobados

Todo dato dudoso debe quedar con `estadoAprobacion: "pendiente"` (nunca inventado, nunca "aprobado" por defecto). Detalle completo: **`docs/control-publicacion-datos.md`**.

---

## Flujo recomendado: ChatGPT → Gemini → Claude Code → Codex

| Etapa | Agente | Qué hace |
|-------|--------|----------|
| 1. Estrategia | **ChatGPT** | Recopila y organiza el contexto comercial real del cliente |
| 2. Datos externos (opcional, fase posterior) | **Gemini** | Diseña el panel de Google Sheets y redacta el Apps Script — sin conectarlo |
| 3. Construcción | **Claude Code** | Adapta esta plantilla al cliente: variables, catálogo, slots |
| 4. Auditoría | **Codex** | Revisa seguridad, datos no confirmados, SEO, accesibilidad — sin rediseñar |

Ningún agente conecta Google Sheets, crea endpoints, inventa datos, ni hace commit/push sin autorización explícita del usuario en cada caso.

Detalle completo y prompts ya redactados para cada etapa: **`docs/flujo-chatgpt-gemini-claude-codex.md`** y **`docs/prompts-maestros/`**.

---

## Tecnología

| Capa | Tecnología |
|------|-----------|
| Markup | HTML5 semántico |
| Estilos | CSS3 con variables nativas |
| Lógica | JavaScript vanilla (ES2020+) |
| Datos | JSON estático + `fetch()` |
| Hosting | GitHub Pages |

Sin frameworks, sin preprocesadores CSS, sin build step, sin dependencias externas, sin claves de API en el frontend.

---

## Estructura del proyecto

```
business-static-web-framework/
├── index.html               ← Página principal con todas las secciones
├── style.css                ← Sistema CSS base
├── script.js                ← Núcleo JS modular (catálogo, validadores, formulario)
├── robots.txt
├── sitemap.xml
│
├── data/
│   ├── catalogo.json         ← 3 productos demo (producto-demo-1/2/3), todo en "PENDIENTE"
│   ├── configuracion.json    ← Configuración global del sitio
│   └── slots/                ← 13 archivos de contenido editable, incluido control.json
│
├── legales/                  ← 6 páginas legales base (provisionales)
│
└── docs/
    ├── README-PLANTILLA.md            ← Documentación extendida de la plantilla
    ├── como-usar-la-plantilla.md
    ├── variables-de-personalizacion.md
    ├── flujo-chatgpt-gemini-claude-codex.md
    ├── contrato-datos-google-sheets-generico.md
    ├── checklist-nuevo-cliente.md
    ├── checklist-auditoria-codex.md
    ├── control-publicacion-datos.md
    ├── contexto-cliente-ejemplo.md
    ├── prompts-maestros/               ← 7 prompts listos para cada IA del flujo
    └── ... (documentación técnica heredada de la arquitectura base)
```

---

## Abrir localmente

```bash
# Opción 1: VS Code con Live Server
# Opción 2: python -m http.server 3000
# Opción 3: npx serve .
```

El catálogo se carga con `fetch()` — necesitas un servidor local, no abrir `index.html` con `file://`.

---

## Crear un nuevo proyecto desde esta plantilla

1. Copia `business-static-web-framework/` a una carpeta o repositorio nuevo.
2. Sigue `docs/como-usar-la-plantilla.md` paso a paso.
3. No reutilices este `_template/` como si fuera el proyecto final — es la fuente, no el destino.
4. Antes de publicar, pasa `docs/checklist-nuevo-cliente.md` y `docs/checklist-auditoria-codex.md` completos.

---

## Git

Esta plantilla no asume ningún repositorio Git propio. Al copiarla a un proyecto nuevo, inicializa o usa el control de versiones de ese proyecto — no el del repositorio donde vive `_template/`.

**No conectar Google Sheets. No crear endpoints. No publicar datos sin aprobación explícita.**
