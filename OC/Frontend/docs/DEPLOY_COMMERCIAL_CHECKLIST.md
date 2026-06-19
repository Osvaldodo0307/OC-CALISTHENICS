# Checklist de despliegue comercial — OC Club

Lista para validar el sitio antes y después de publicar en producción (Netlify).

## 1. Build local

```bash
cd OC/Frontend
npm ci
npm run build
```

- [ ] El comando termina sin errores de TypeScript ni Vite.
- [ ] Existe la carpeta `OC/Frontend/dist/`.

## 2. Deploy en Netlify

- [ ] Push a la rama de producción (p. ej. `main`).
- [ ] Netlify ejecuta build desde `netlify.toml` (`base = OC/Frontend`).
- [ ] Variable `VITE_API_URL` apunta al backend en Render (si se usa el portal `/app`).
- [ ] **No** configurar `VITE_ENABLE_ADMIN_DEMO` en Production (ver `docs/PRODUCTION_DEPLOY_CHECKLIST.md`).
- [ ] **Clear cache and deploy site** tras cambiar variables `VITE_*`.

URL de referencia: `https://oc-club.netlify.app`

## 3. Netlify Forms — `oc-lead-capture`

- [ ] En **Netlify → Forms** aparece el formulario `oc-lead-capture` tras el deploy.
- [ ] Si no aparece: verificar que `index.html` incluye el formulario oculto con los mismos campos que el formulario React.
- [ ] Configurar **notificación por correo** en Forms → Form notifications.
- [ ] Enviar una prueba real desde `/#solicitud` en producción.
- [ ] Confirmar recepción del correo con campos: nombre, teléfono, interés, mensaje, UTMs (si aplica), `page_path`.

### Probar atribución UTM

Abrir en producción:

```
https://oc-club.netlify.app/?utm_source=instagram&utm_medium=social&utm_campaign=visita_junio
```

- [ ] Enviar formulario de prueba.
- [ ] Verificar que Netlify registra `utm_source`, `utm_medium`, `utm_campaign` y `page_path`.

## 4. CTAs de WhatsApp

Probar en móvil y desktop que cada enlace abre WhatsApp con el mensaje correcto:

| Ubicación | Mensaje esperado (resumen) |
|-----------|----------------------------|
| Hero landing | Agendar visita a OC Club |
| Plan Básico | Plan OC GYM Básico $600 |
| Plan Premium | Plan OC GYM Premium $950 |
| Acceso Total | Acceso Total |
| Recovery Lab | Información Recovery Lab |
| Clases | Información clases OC Club |
| Tienda | Disponibilidad productos tienda |
| Footer general | Información OC Club |

- [ ] Todos los enlaces públicos usan el número `525567869589`.

## 5. Analytics (opcional)

Solo si vas a medir conversión:

- [ ] `VITE_GA_MEASUREMENT_ID` configurado en Netlify (formato `G-XXXXXXXXXX`).
- [ ] `VITE_META_PIXEL_ID` configurado si usarás Meta Pixel.
- [ ] Redeploy tras agregar variables.
- [ ] Ver documentación: `docs/ANALYTICS_SETUP.md`.

Eventos comerciales registrados por `trackEvent`:

- `whatsapp_visita`, `whatsapp_plan_basico`, `whatsapp_plan_premium`, `whatsapp_plan_acceso_total`, `whatsapp_recovery`, `whatsapp_clases`, `whatsapp_tienda`, `whatsapp_general`
- `lead_form_success`, `lead_form_error`

## 6. Revisión móvil

- [ ] Hero: mensaje Tlalpan + desde $600/mes visible sin scroll excesivo.
- [ ] CTAs principales legibles y clicables.
- [ ] Bloque de 3 planes usable en pantalla estrecha.
- [ ] Formulario de prospectos usable (campos, botón enviar, alternativa WhatsApp).
- [ ] Menú hamburguesa sin enlaces rotos.

## 7. Páginas legales

- [ ] `/aviso-privacidad` carga correctamente.
- [ ] `/terminos` carga correctamente.
- [ ] Enlaces en footer de landing y tienda funcionan.

## 8. Tienda y disclaimers

- [ ] Banner “Catálogo en actualización” visible en `/tienda`.
- [ ] Checkout indica que no hay pago en línea.
- [ ] No hay copy que prometa compra inmediata online.

## 9. Copy comercial (landing)

- [ ] Queda claro: Tlalpan, desde $600/mes, WhatsApp como canal principal.
- [ ] Clases y Recovery Lab como servicios adicionales.
- [ ] Sin promesa de resultados físicos garantizados.
- [ ] Tienda sujeta a disponibilidad.

## 10. Post-deploy rápido

- [ ] Abrir sitio en ventana de incógnito.
- [ ] Probar login `/app/login` si el backend está configurado.
- [ ] Revisar consola del navegador: sin errores CORS críticos en páginas públicas.

---

**Nota:** El formulario **no envía datos reales en `npm run dev` local**; la validación de captura debe hacerse en el deploy de Netlify.
