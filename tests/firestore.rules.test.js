import fs from 'node:fs';
import assert from 'node:assert/strict';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';

const PROJECT_ID = 'extintores-dashboard-rules-test';
const RULES = fs.readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');

let testEnv;

async function seed() {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await db.doc('users/admin-1').set({
      email: 'admin@example.com',
      role: 'admin',
      createdAt: '2026-10-06T00:00:00.000Z'
    });
    await db.doc('users/approved-1').set({
      email: 'approved@example.com',
      role: 'approved',
      createdAt: '2026-10-06T00:00:00.000Z'
    });
    await db.doc('users/tech-1').set({
      email: 'tech@example.com',
      role: 'tecnico',
      createdAt: '2026-10-06T00:00:00.000Z'
    });
    await db.doc('users/pending-1').set({
      email: 'pending@example.com',
      role: 'pending',
      createdAt: '2026-10-06T00:00:00.000Z'
    });
    await db.doc('users/rejected-1').set({
      email: 'rejected@example.com',
      role: 'rejected',
      createdAt: '2026-10-06T00:00:00.000Z'
    });
    await db.doc('backups/main').set({
      records: [],
      ventas: [],
      configuracion: {}
    });
    await db.doc('secret/should-be-denied').set({ value: true });
  });
}

function ctx(uid, email) {
  return testEnv.authenticatedContext(uid, { email });
}

async function run(name, fn) {
  try {
    await fn();
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    throw error;
  }
}

try {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: RULES }
  });

  await testEnv.clearFirestore();
  await seed();

  // 1. Anónimo: no acceso al CRM.
  await run('01 anonymous cannot read backups/main', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.doc('backups/main').get());
  });

  // 2. pending: no acceso al CRM.
  await run('02 pending cannot read backups/main', async () => {
    await assertFails(ctx('pending-1', 'pending@example.com').firestore().doc('backups/main').get());
  });

  // 3. approved: lectura/escritura.
  await run('03 approved can read and update backups/main', async () => {
    const db = ctx('approved-1', 'approved@example.com').firestore();
    await assertSucceeds(db.doc('backups/main').get());
    await assertSucceeds(db.doc('backups/main').update({ 'test.approved': true }));
  });

  // 4. tecnico: lectura/escritura.
  await run('04 tecnico can read and update backups/main', async () => {
    const db = ctx('tech-1', 'tech@example.com').firestore();
    await assertSucceeds(db.doc('backups/main').get());
    await assertSucceeds(db.doc('backups/main').update({ 'test.tecnico': true }));
  });

  // 5. admin: lectura/escritura.
  await run('05 admin can read and update backups/main', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertSucceeds(db.doc('backups/main').get());
    await assertSucceeds(db.doc('backups/main').update({ 'test.admin': true }));
  });

  // 6. Usuario normal: solo puede leer su propio perfil.
  await run('06 user can read own profile but not another profile', async () => {
    const db = ctx('approved-1', 'approved@example.com').firestore();
    await assertSucceeds(db.doc('users/approved-1').get());
    await assertFails(db.doc('users/tech-1').get());
  });

  // 7. Usuario normal: no puede cambiar su propio rol.
  await run('07 user cannot change own role', async () => {
    const db = ctx('approved-1', 'approved@example.com').firestore();
    await assertFails(db.doc('users/approved-1').update({ role: 'admin' }));
  });

  // 8. Usuario normal: no puede crear perfil privilegiado.
  await run('08 user cannot create self as admin', async () => {
    const db = ctx('new-user-1', 'new@example.com').firestore();
    await assertFails(db.doc('users/new-user-1').set({
      email: 'new@example.com',
      role: 'admin',
      createdAt: '2026-10-06T00:00:00.000Z'
    }));
  });

  // 9. Usuario nuevo: sí puede crear su propio perfil como pending.
  await run('09 new user can create own pending profile', async () => {
    const db = ctx('new-user-2', 'new2@example.com').firestore();
    await assertSucceeds(db.doc('users/new-user-2').set({
      email: 'new2@example.com',
      role: 'pending',
      createdAt: '2026-10-06T00:00:00.000Z'
    }));
  });

  // 10. Admin: puede cambiar el rol de otro usuario.
  await run('10 admin can change another user role', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertSucceeds(db.doc('users/pending-1').update({ role: 'approved' }));
  });

  // 11. Admin: no puede cambiar su propio rol.
  await run('11 admin cannot change own role', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertFails(db.doc('users/admin-1').update({ role: 'approved' }));
  });

  // 12. Admin: puede eliminar otro perfil.
  await run('12 admin can delete another profile', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertSucceeds(db.doc('users/rejected-1').delete());
  });

  // 13. Admin: no puede eliminar su propio perfil.
  await run('13 admin cannot delete own profile', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertFails(db.doc('users/admin-1').delete());
  });

  // 14. Usuario no admin: no puede listar usuarios.
  await run('14 non-admin cannot list users', async () => {
    const db = ctx('approved-1', 'approved@example.com').firestore();
    await assertFails(db.collection('users').get());
  });

  // 15. Admin: puede listar usuarios.
  await run('15 admin can list users', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertSucceeds(db.collection('users').get());
  });

  // 16. Usuario no admin: no puede borrar otro perfil.
  await run('16 non-admin cannot delete another profile', async () => {
    const db = ctx('approved-1', 'approved@example.com').firestore();
    await assertFails(db.doc('users/tech-1').delete());
  });

  // 17. Rol inválido: admin no puede asignarlo.
  await run('17 admin cannot assign invalid role', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertFails(db.doc('users/tech-1').update({ role: 'superuser' }));
  });

  // 18. Ruta no autorizada: denegada.
  await run('18 unrelated document path is denied', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertFails(db.doc('secret/should-be-denied').get());
  });

  // 19. rejected: no acceso al CRM.
  await run('19 rejected cannot write backups/main', async () => {
    const db = ctx('rejected-1', 'rejected@example.com').firestore();
    await assertFails(db.doc('backups/main').update({ 'test.rejected': true }));
  });

  // 29. Una identidad autenticada sin perfil no obtiene acceso por estar logueada.
  await run('29 authenticated user without profile is denied', async () => {
    const db = ctx('orphan-1', 'orphan@example.com').firestore();
    await assertFails(db.doc('backups/main').get());
  });

  // 20. approved no puede eliminar el documento principal.
  await run('20 approved cannot delete backups/main', async () => {
    const db = ctx('approved-1', 'approved@example.com').firestore();
    await assertFails(db.doc('backups/main').delete());
  });

  // 21. tecnico no puede eliminar el documento principal.
  await run('21 tecnico cannot delete backups/main', async () => {
    const db = ctx('tech-1', 'tech@example.com').firestore();
    await assertFails(db.doc('backups/main').delete());
  });

  // 22. admin sí puede eliminar el documento principal.
  await run('22 admin can delete backups/main', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertSucceeds(db.doc('backups/main').delete());
  });

  // 23. approved no puede crear el perfil de otro usuario.
  await run('23 user cannot create another user profile', async () => {
    const db = ctx('approved-1', 'approved@example.com').firestore();
    await assertFails(db.doc('users/fake-user').set({
      email: 'fake@example.com',
      role: 'pending',
      createdAt: '2026-10-06T00:00:00.000Z'
    }));
  });

  // 24. Un usuario no puede crear un perfil usando otro correo.
  await run('24 user cannot create profile with another email', async () => {
    const db = ctx('new-user-3', 'real@example.com').firestore();
    await assertFails(db.doc('users/new-user-3').set({
      email: 'other@example.com',
      role: 'pending',
      createdAt: '2026-10-06T00:00:00.000Z'
    }));
  });

  // 25. Un usuario nuevo no puede crear un perfil con campos extra.
  await run('25 new user cannot create profile with extra fields', async () => {
    const db = ctx('new-user-4', 'new4@example.com').firestore();
    await assertFails(db.doc('users/new-user-4').set({
      email: 'new4@example.com',
      role: 'pending',
      createdAt: '2026-10-06T00:00:00.000Z',
      isAdmin: true
    }));
  });

  // 26. Admin no puede modificar el correo de otro usuario.
  await run('26 admin cannot modify another user email', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertFails(db.doc('users/tech-1').update({
      email: 'changed@example.com'
    }));
  });

  // 27. Admin no puede modificar rol y correo simultáneamente.
  await run('27 admin cannot modify role and email together', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertFails(db.doc('users/tech-1').update({
      role: 'approved',
      email: 'changed2@example.com'
    }));
  });

  // 28. Un documento de backup distinto al principal permanece bloqueado.
  await run('28 non-main backup document is denied', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertFails(db.doc('backups/other').set({ value: true }));
  });

  console.log('ALL SECURITY RULE TESTS PASSED');
} finally {
  await testEnv?.cleanup();
}
