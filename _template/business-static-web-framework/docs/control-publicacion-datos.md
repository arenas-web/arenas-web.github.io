# Control de Publicación de Datos (Genérico)

**Propósito:** Definir, para cualquier proyecto construido con esta plantilla, qué significa cada estado de aprobación, qué datos no pueden publicarse sin aprobación explícita, y cómo se relaciona el contrato de gobierno de datos (`99_CONTROL` / `data/slots/control.json`) con el resto del sistema.

**Estado por defecto: Google Sheets NO conectado.** Todo lo descrito aquí opera sobre JSON local hasta que se autorice explícitamente lo contrario.

---

## Los cuatro estados normalizados

El sitio reconoce únicamente estos cuatro valores de `estadoAprobacion`. Cualquier otro valor (incluyendo estados extendidos o mal escritos) se normaliza automáticamente a `pendiente` mediante `normalizarEstadoAprobacion()` en `script.js`.

| Estado | Significado | Efecto en el sitio |
|--------|-------------|---------------------|
| `pendiente` | El dato existe pero no ha sido revisado ni aprobado. Valor por defecto y más seguro. | No se publica como real. Se oculta (sedes, promociones) o se muestra "Consultar"/"Consultar disponibilidad" (precio, cuota, stock) |
| `aprobado` | Gerencia/responsable revisó el dato y autorizó explícitamente su publicación. | Se muestra tal como está en el JSON |
| `rechazado` | Se revisó el dato y se decidió que no debe publicarse, ni siquiera como pendiente. | Se oculta, igual que `pendiente`, pero con intención registrada |
| `oculto` | El dato debe quedar fuera de la vista pública por una razón operativa temporal. | Se oculta, igual que los anteriores |

**Regla central:** de los cuatro estados, **solo `"aprobado"` habilita la publicación.** Los otros tres producen el mismo resultado visible — la diferencia es de intención y trazabilidad, no de comportamiento.

---

## Qué datos no pueden publicarse sin aprobación

| Dato | Condición para publicarse |
|------|---------------------------|
| Precio de un producto | `precioConfirmado === true` |
| Cuota inicial | `cuotaConfirmada === true` |
| Stock | `stockConfirmado === true` |
| Promoción | `promocionConfirmada === true` **y** `estadoAprobacion` normalizado `"aprobado"` (ambas condiciones) |
| Sede (dirección, teléfono, horario) | `estadoAprobacion` normalizado `"aprobado"` |
| Número de WhatsApp activo | `whatsappConfirmado === true` en `data/configuracion.json` |
| Garantía como beneficio concreto | Ningún texto de garantía específica se publica sin respaldo real confirmado — usar frases neutrales ("Consulta condiciones de garantía en tienda") hasta tener condiciones reales |
| Financiamiento con condiciones | Ningún monto, tasa, plazo o promesa ("sin burocracia", "crédito accesible") se publica sin confirmación real — usar frases neutrales ("Opciones de financiamiento por confirmar") |
| Horario de atención general | No debe haber horario fijo visible fuera de una sede con `estadoAprobacion: "aprobado"` |

---

## El contrato local: `data/slots/control.json`

Es el equivalente local a una futura pestaña de gobierno (`99_CONTROL`) en un panel de Google Sheets. Mientras Sheets no exista, este archivo es la única fuente de estas banderas:

```json
{
  "modoDatos": "local",
  "googleSheetsConectado": false,
  "appsScriptEndpoint": "",
  "fallbackLocal": true,
  "permitirDatosPendientes": false,
  "mostrarPreciosPendientes": false,
  "mostrarWhatsappPendiente": false,
  "mostrarPromocionesPendientes": false,
  "mostrarGarantiaNoConfirmada": false,
  "mostrarFinanciamientoNoConfirmado": false,
  "ultimaRevisionGerencial": "pendiente"
}
```

| Campo | Función |
|-------|---------|
| `modoDatos` | Declara la fuente activa (`"local"` por defecto) |
| `googleSheetsConectado` | Bandera informativa — no conecta nada por sí sola. Si está en `true` sin código de conexión real, el sitio lo detecta y sigue operando en modo local |
| `appsScriptEndpoint` | Reservado para la futura URL del Web App. Vacío por defecto |
| `fallbackLocal` | Debe permanecer `true` siempre |
| `permitirDatosPendientes` y los `mostrar*` | Interruptores reservados para un futuro modo de previsualización/staging. **No están conectados a ninguna lógica de render por defecto** — activarlos requiere decisión explícita y, si se implementa esa función, debe documentarse aparte |
| `ultimaRevisionGerencial` | Fecha o estado de la última revisión formal. `"pendiente"` mientras no haya ocurrido ninguna |

---

## Buenas prácticas al adaptar esta plantilla

1. No cambies ningún `estadoAprobacion` a `"aprobado"` sin que la aprobación haya ocurrido realmente fuera del código (una conversación, un correo, una reunión con el responsable del negocio).
2. No agregues estados nuevos no contemplados (`"confirmado"`, `"revisado"`, etc.) esperando que el sitio los reconozca — se normalizarán a `"pendiente"` automáticamente.
3. Si necesitas un quinto estado, decídelo explícitamente, agrégalo a `ESTADOS_APROBACION_VALIDOS` en `script.js` y documenta su efecto aquí — no lo dejes implícito.
4. Mantén `data/slots/control.json` en su configuración conservadora de fábrica salvo decisión explícita y documentada del equipo del proyecto.

---

## Relación con Google Sheets

Ver `contrato-datos-google-sheets-generico.md` para el contrato completo de columnas y el rol de Apps Script como endpoint recomendado. Ninguna conexión remota cambia las reglas de esta página: nada se publica sin `estadoAprobacion === "aprobado"` y los flags de confirmación correspondientes.
