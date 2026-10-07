# Seguridad de Firebase

La aplicación usa Cloud Firestore mediante la REST API con Firebase ID tokens. Las solicitudes autenticadas con ID tokens quedan sujetas a las Security Rules de Firestore.

## Modelo de acceso

- `pending`: puede crear/leer su propio perfil, pero no acceder al CRM.
- `approved`: puede leer y guardar el documento principal del CRM.
- `tecnico`: puede leer y guardar el documento principal del CRM.
- `admin`: acceso completo al documento principal y administración de perfiles/roles.
- `rejected`: sin acceso al CRM.

El rol confiable es `users/{uid}.role` en Firestore. El cliente no puede convertir su propio perfil en un rol privilegiado.

## Bootstrap inicial del administrador

Antes de publicar estas reglas en producción, asegúrate de que el perfil Firestore del administrador inicial ya exista en:

`users/{UID}`

y tenga:

`role = "admin"`

Esto es necesario porque las nuevas cuentas solo pueden registrarse como `pending`.

## Pruebas automatizadas

La Fase 1.6.1 incluye **29 pruebas** en `tests/firestore.rules.test.js`.

El proyecto ya declara el emulador Firestore en `firebase.json` con el puerto `8080`, para que la ejecución local y CI sea reproducible.

Desde la raíz del proyecto:

```bash
npm install
npm run test:rules
```

El comando `test:rules` inicia temporalmente el emulador, carga `firestore.rules`, ejecuta las 29 pruebas y apaga el emulador al finalizar.

**Estado actual:** la suite está implementada, pero todavía debe ejecutarse en un entorno con acceso a Internet para instalar dependencias y descargar/iniciar el Firebase Emulator. No se debe interpretar la existencia del workflow como evidencia de que las 29 pruebas ya pasaron.

## CI

GitHub Actions está configurado en:

`.github/workflows/firebase-rules.yml`

El workflow instala las dependencias, verifica Java y ejecuta `npm run test:rules`.

## Despliegue

Requiere Firebase CLI y permisos sobre el proyecto:

```bash
firebase login
firebase use extintores-seguridad
firebase deploy --only firestore
```

Las reglas se encuentran en `firestore.rules` y están enlazadas desde `firebase.json`.

## Checklist antes de producción

1. Ejecutar las 29 pruebas y obtener resultado exitoso.
2. Verificar que el proyecto de `.firebaserc` sea el proyecto Firebase correcto.
3. Confirmar que exista el perfil del administrador inicial con `role = "admin"`.
4. Publicar las reglas con Firebase CLI.
5. Probar desde la aplicación un usuario `pending`, uno `approved`, uno `tecnico` y un `admin`.
6. Verificar específicamente que un usuario autenticado sin perfil no pueda acceder a `backups/main`.

## Importante

Estas reglas todavía deben probarse en el simulador/emulador y luego publicarse. El archivo en GitHub por sí solo **no cambia** las reglas activas de Firebase.
