# MOBILE_RELEASE_CHECKLIST

## Cuentas y acceso

- [ ] Apple Developer Program activo.
- [ ] Google Play Console activa.
- [ ] Accesos de CI/CD y llaves resguardados.

## Identidad de app

- [ ] `appId` final definido (actual placeholder: `com.occalisthenics.app`).
- [ ] Nombre visible final validado.
- [ ] Version (`versionName`) definida.
- [ ] Build number / versionCode definido por plataforma.

## Android

- [ ] Keystore de firma release creado y respaldado.
- [ ] `applicationId` final confirmado.
- [ ] Build release (`.aab`) generado.
- [ ] Permisos revisados (minimos necesarios).

## iOS

- [ ] Bundle Identifier final confirmado.
- [ ] Certificados y provisioning profiles configurados.
- [ ] Build archive generado en Xcode.
- [ ] Reglas de privacidad revisadas para plugins actuales/futuros.

## Configuracion de entorno

- [ ] `VITE_API_URL` de produccion configurada (HTTPS).
- [ ] `VITE_APP_MODE=app` en build movil.
- [ ] `VITE_APP_VERSION` actualizado.
- [ ] Sin dependencias a localhost en build release.

## Calidad y cumplimiento

- [ ] Login y restauracion de sesion validados.
- [ ] Flujos socio prioritarios validados.
- [ ] Manejo offline/online validado.
- [ ] Back button Android validado.
- [ ] Capturas de pantalla para stores listas.
- [ ] Textos de privacidad preparados para plugins que se agreguen en fase posterior.

## Publicacion

- [ ] Metadata store completada (descripcion, categoria, soporte, politica).
- [ ] QA final en dispositivo fisico Android/iOS.
- [ ] Checklist de regresion web ejecutado (no romper web actual).

