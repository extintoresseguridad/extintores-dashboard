import fs from 'node:fs';
import assert from 'node:assert/strict';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

const PROJECT_ID = 'extintores-dashboard-rules-test';
const RULES = fs.readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');

let testEnv;

async function seed() {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/admin-1'), {
      email: 'admin@example.com',
      role: 'admin',
      createdAt: '2026-10-06T00:00:00.000Z'
    });
    await setDoc(doc(db, 'users/approved-1'), {
      email: 'approved@example.com',
      role: 'approved',
      createdAt: '2026-10-06T00:00:00.000Z'
    });
    await setDoc(doc(db, 'users/tech-1'), {
      email: 'tech@example.com',
      role: 'tecnico',
      createdAt: '2026-10-06T00:00:00.000Z'
    });
    await setDoc(doc(db, 'users/pending-1'), {
      email: 'pending@example.com',
      role: 'pending',
      createdAt: '2026-10-06T00:00:00.000Z'
    });
    await setDoc(doc(db, 'users/rejected-1'), {
      email: 'rejected@example.com',
      role: 'rejected',
      createdAt: '2026-10-06T00:00:00.000Z'
    });
    await setDoc(doc(db, 'backups/main'), {
      records: [],
      ventas: [],
      configuracion: {}
    });
    await setDoc(doc(db, 'secret/should-be-denied'), { value: true });
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
    await assertFails(getDoc(doc(db, 'backups/main')));
  });

  // 2. pending: no acceso al CRM.
  await run('02 pending cannot read backups/main', async () => {
    await assertFails(getDoc(doc(ctx('pending-1', 'pending@example.com'), 'backups/main')));
  });

  // 3. approved: lectura/escritura.
  await run('03 approved can read and update backups/main', async () => {
    const db = ctx('approved-1', 'approved@example.com').firestore();
    await assertSucceeds(getDoc(doc(db, 'backups/main')));
    await assertSucceeds(updateDoc(doc(db, 'backups/main'), { 'test.approved': true }));
  });

  // 4. tecnico: lectura/escritura.
  await run('04 tecnico can read and update backups/main', async () => {
    const db = ctx('tech-1', 'tech@example.com').firestore();
    await assertSucceeds(getDoc(doc(db, 'backups/main')));
    await assertSucceeds(updateDoc(doc(db, 'backups/main'), { 'test.tecnico': true }));
  });

  // 5. admin: lectura/escritura.
  await run('05 admin can read and update backups/main', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertSucceeds(getDoc(doc(db, 'backups/main')));
    await assertSucceeds(updateDoc(doc(db, 'backups/main'), { 'test.admin': true }));
  });

  // 6. Usuario normal: solo puede leer su propio perfil.
  await run('06 user can read own profile but not another profile', async () => {
    const db = ctx('approved-1', 'approved@example.com').firestore();
    await assertSucceeds(getDoc(doc(db, 'users/approved-1')));
    await assertFails(getDoc(doc(db, 'users/tech-1')));
  });

  // 7. Usuario normal: no puede cambiar su propio rol.
  await run('07 user cannot change own role', async () => {
    const db = ctx('approved-1', 'approved@example.com').firestore();
    await assertFails(updateDoc(doc(db, 'users/approved-1'), { role: 'admin' }));
  });

  // 8. Usuario normal: no puede crear perfil privilegiado.
  await run('08 user cannot create self as admin', async () => {
    const db = ctx('new-user-1', 'new@example.com').firestore();
    await assertFails(setDoc(doc(db, 'users/new-user-1'), {
      email: 'new@example.com',
      role: 'admin',
      createdAt: '2026-10-06T00:00:00.000Z'
    }));
  });

  // 9. Usuario nuevo: sí puede crear su propio perfil como pending.
  await run('09 new user can create own pending profile', async () => {
    const db = ctx('new-user-2', 'new2@example.com').firestore();
    await assertSucceeds(setDoc(doc(db, 'users/new-user-2'), {
      email: 'new2@example.com',
      role: 'pending',
      createdAt: '2026-10-06T00:00:00.000Z'
    }));
  });

  // 10. Admin: puede cambiar el rol de otro usuario.
  await run('10 admin can change another user role', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertSucceeds(updateDoc(doc(db, 'users/pending-1'), { role: 'approved' }));
  });

  // 11. Admin: no puede cambiar su propio rol.
  await run('11 admin cannot change own role', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertFails(updateDoc(doc(db, 'users/admin-1'), { role: 'approved' }));
  });

  // 12. Admin: puede eliminar otro perfil.
  await run('12 admin can delete another profile', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertSucceeds(deleteDoc(doc(db, 'users/rejected-1')));
  });

  // 13. Admin: no puede eliminar su propio perfil.
  await run('13 admin cannot delete own profile', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertFails(deleteDoc(doc(db, 'users/admin-1')));
  });

  // 14. Usuario no admin: no puede listar usuarios.
  await run('14 non-admin cannot list users', async () => {
    const db = ctx('approved-1', 'approved@example.com').firestore();
    await assertFails(getDocs(collection(db, 'users')));
  });

  // 15. Admin: puede listar usuarios.
  await run('15 admin can list users', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertSucceeds(getDocs(collection(db, 'users')));
  });

  // 16. Usuario no admin: no puede borrar otro perfil.
  await run('16 non-admin cannot delete another profile', async () => {
    const db = ctx('approved-1', 'approved@example.com').firestore();
    await assertFails(deleteDoc(doc(db, 'users/tech-1')));
  });

  // 17. Rol inválido: admin no puede asignarlo.
  await run('17 admin cannot assign invalid role', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertFails(updateDoc(doc(db, 'users/tech-1'), { role: 'superuser' }));
  });

  // 18. Ruta no autorizada: denegada.
  await run('18 unrelated document path is denied', async () => {
    const db = ctx('admin-1', 'admin@example.com').firestore();
    await assertFails(getDoc(doc(db, 'secret/should-be-denied')));
  });

  // 19. rejected: no acceso al CRM.
  await run('19 rejected cannot write backups/main', async () => {
    const db = ctx('rejected-1', 'rejected@example.com').firestore();
    await assertFails(updateDoc(doc(db, 'backups/main'), { 'test.rejected': true }));
  });

  console.log('ALL SECURITY RULE TESTS PASSED');
} finally {
  await testEnv?.cleanup();
}
