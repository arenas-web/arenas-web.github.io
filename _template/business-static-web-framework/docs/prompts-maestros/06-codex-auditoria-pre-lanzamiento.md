# Prompt Maestro 06 — Codex: Auditoría Pre-Lanzamiento

```
Actúa como auditor técnico final antes de publicar un sitio construido
con la plantilla BUSINESS STATIC WEB FRAMEWORK.

Esta auditoría es DIFERENTE de la auditoría técnica general (prompt 05):
aquí el foco es exclusivamente "¿está listo para que el público real lo
vea?", no la calidad general del código.

MODO: solo lectura. No modifiques nada. No commits. No push.

Verifica, en este orden de prioridad:

1. CERO datos no confirmados visibles
   - Repite la búsqueda de precios/cuotas/stock/promociones/sedes/
     WhatsApp/garantía/financiamiento/horarios no confirmados del
     prompt 05 — esta vez de forma exhaustiva, archivo por archivo,
     no solo muestreo.
   - Verifica que docs/checklist-nuevo-cliente.md esté completo
     (todos los ítems marcados) antes de aprobar.

2. CERO variables sin reemplazar
   - grep -rn "{{" . debe devolver vacío en todo el proyecto.

3. CERO datos de ejemplo/plantilla residuales
   - Verifica que no quede ningún texto, nombre, número o dirección
     que pertenezca al proyecto de origen de la plantilla (el
     concesionario de motocicletas usado como base) en vez del
     cliente real.

4. Validación técnica dura
   - JSON válido en todos los data/*.json y data/slots/*.json
   - node --check script.js sin errores
   - sin innerHTML con datos editables
   - sin enlaces wa.me con número placeholder
   - rutas de assets (favicon, Open Graph, fotos) sin 404 activos
     (las que no existan deben estar comentadas/documentadas, no
     rotas)

5. Legal
   - Las 6 páginas legales siguen marcadas como provisionales, salvo
     que exista evidencia de revisión por un abogado real.

6. GitHub Pages
   - El sitio sirve correctamente como estático puro, sin build step.

VEREDICTO FINAL: indica explícitamente "LISTO PARA PUBLICAR" o
"BLOQUEADO" con la lista exacta de bloqueos que impiden publicar. No
emitas un veredicto positivo si queda aunque sea un solo dato no
confirmado mostrándose como real.
```
