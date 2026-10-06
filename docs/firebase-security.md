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

## Despliegue

Requiere Firebase CLI y permisos sobre el proyecto:

```bash
firebase login
firebase use extintores-seguridad
firebase deploy --only firestore
```

Las reglas se encuentran en `firestore.rules` y están enlazadas desde `firebase.json`.

## Pruebas mínimas antes de publicar

Usa el Rules Playground o el Firebase Emulator para comprobar como mínimo:

1. Sin autenticación → denegado en `backups/main`.
2. `pending` → denegado en `backups/main`.
3. `approved` → lectura/escritura de `backups/main`.
4. `tecnico` → lectura/escritura de `backups/main`.
5. `admin` → lectura/escritura de `backups/main`.
6. Usuario normal → solo puede leer su propio `users/{uid}`.
7. Usuario normal → no puede modificar su propio `role`.
8. Usuario normal → no puede crear su perfil con `role = admin`.
9. Admin → puede cambiar el rol de otro usuario.
10. Admin → no puede borrar ni modificar su propio perfil desde estas reglas.
11. Usuario no admin → no puede listar `users`.
12. Rutas distintas de `users/*` y `backups/main` → denegadas.

## Importante

Estas reglas todavía deben probarse en el simulador/emulador y luego publicarse. El archivo en GitHub por sí solo **no cambia** las reglas activas de Firebase.
