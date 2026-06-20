# BUSINESS STATIC WEB FRAMEWORK

**Plantilla madre reutilizable** para sitios web comerciales estáticos (concesionarios, tiendas, negocios locales) construida en HTML, CSS y JavaScript puro — sin frameworks, sin backend obligatorio, 100% compatible con GitHub Pages.

Esta plantilla nace de la arquitectura real de un proyecto comercial (concesionario de motocicletas), **sanitizada**: todo dato específico de ese negocio fue reemplazado por variables genéricas `{{VARIABLE}}`. No contiene nombres, teléfonos, correos, direcciones ni redes reales de ningún cliente.

---

## Qué es esta plantilla

Un esqueleto técnico completo y ya probado para lanzar la web de un nuevo cliente en horas, no semanas:

- Catálogo de productos dinámico (JSON local, listo para Google Sheets en el futuro)
- Sistema de "slots" editables (`data/slots/`) para contenido que el negocio puede actualizar sin tocar código
- Sistema de aprobación de datos: **nada se publica como real sin confirmación explícita**
- Formulario de cotización con validación y envío por WhatsApp
- Páginas legales base (privacidad, términos, cookies, datos personales, libro de reclamaciones, financiamiento)
- SEO técnico base (meta tags, Open Graph, Twitter Card, sitemap, robots.txt)
- Sistema de animaciones preparado (reveal on scroll, respeta `prefers-reduced-motion`)
- Validadores de datos defensivos (esquemas de tipos, campos obligatorios, consistencia)

## Qué NO es esta plantilla

- No es un generador automático — requiere personalización manual o asistida por IA (ver `flujo-chatgpt-gemini-claude-codex.md`)
- No incluye conexión a Google Sheets activa (solo el contrato y la preparación — ver `contrato-datos-google-sheets-generico.md`)
- No incluye diseño visual definitivo — la identidad visual (colores, tipografías, hero) es responsabilidad de cada proyecto que use esta plantilla
- No incluye ningún dato real de ningún cliente

---

## Estructura de carpetas

```
business-static-web-framework/
├── index.html               ← página principal con todas las secciones
├── style.css                ← sistema CSS base por bloques
├── script.js                ← núcleo JS modular (catálogo, formulario, validadores)
├── robots.txt
├── sitemap.xml
├── README.md
│
├── data/
│   ├── catalogo.json         ← catálogo de productos (ejemplo genérico)
│   ├── configuracion.json    ← configuración global del sitio
│   └── slots/                ← contenido editable por dominio (13 archivos)
│       └── control.json      ← contrato de gobierno de datos (99_CONTROL)
│
├── legales/                  ← 6 páginas legales base (provisionales)
│
└── docs/
    ├── README-PLANTILLA.md            ← este archivo
    ├── como-usar-la-plantilla.md
    ├── variables-de-personalizacion.md
    ├── flujo-chatgpt-gemini-claude-codex.md
    ├── contrato-datos-google-sheets-generico.md
    ├── checklist-nuevo-cliente.md
    ├── checklist-auditoria-codex.md
    ├── control-publicacion-datos.md
    ├── prompts-maestros/               ← 7 prompts listos para cada IA del flujo
    └── ... (documentación técnica heredada de la arquitectura base)
```

---

## Principios no negociables de esta plantilla

1. **Ningún dato no confirmado se publica como real.** Precios, cuotas, stock, promociones, WhatsApp, sedes, garantías y financiamiento solo se muestran si su `estadoAprobacion` es exactamente `"aprobado"` (o el flag `*Confirmado` correspondiente es `true`).
2. **El JSON local es el fallback permanente.** Aunque en el futuro se conecte una fuente remota (Google Sheets vía Apps Script), el sitio nunca debe depender exclusivamente de ella.
3. **Sin frameworks, sin build step.** HTML, CSS y JS puro — compatible con GitHub Pages tal cual, sin proceso de compilación.
4. **Sin claves de API en el frontend.** Ninguna credencial, token ni secreto debe vivir en código que se sirve al navegador.
5. **No se inventan datos.** Todo dato dudoso o sin confirmar queda explícitamente marcado como pendiente, nunca se rellena con un valor de relleno presentado como real.

---

## Por dónde empezar

1. Lee `como-usar-la-plantilla.md`.
2. Revisa `variables-de-personalizacion.md` para saber qué reemplazar.
3. Sigue `checklist-nuevo-cliente.md` paso a paso.
4. Si vas a coordinar varias IAs en el proceso, usa `flujo-chatgpt-gemini-claude-codex.md` y los prompts en `prompts-maestros/`.
5. Antes de publicar, pasa `checklist-auditoria-codex.md`.
