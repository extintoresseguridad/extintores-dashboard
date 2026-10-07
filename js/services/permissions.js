(function(window){
  'use strict';

  const data = () => window.CRMData;

  const ROLES = Object.freeze({
    ADMIN: 'admin',
    APPROVED: 'approved',
    TECNICO: 'tecnico',
    PENDING: 'pending',
    REJECTED: 'rejected'
  });

  const PERMISSIONS = Object.freeze({
    ACCESS_APP: 'access_app',
    MANAGE_USERS: 'manage_users',
    MANAGE_ROLES: 'manage_roles',
    DELETE_PERMANENTLY: 'delete_permanently',
    EDIT_CONFIGURATION: 'edit_configuration',
    VIEW_HEALTH: 'view_health'
  });

  const ROLE_PERMISSIONS = Object.freeze({
    admin: Object.freeze(Object.values(PERMISSIONS)),
    approved: Object.freeze([PERMISSIONS.ACCESS_APP]),
    tecnico: Object.freeze([PERMISSIONS.ACCESS_APP]),
    pending: Object.freeze([]),
    rejected: Object.freeze([])
  });

  // La fuente de verdad del rol es el documento users/{uid} de Firestore.
  // El correo ya no puede elevar privilegios por sí solo en el cliente.
  function normalizeRole(email, role){
    return ROLE_PERMISSIONS[role] ? role : ROLES.PENDING;
  }

  function can(role, permission){
    return !!(ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role].includes(permission));
  }

  function isSuperAdmin(email){
    return (email || '').trim().toLowerCase() === (data().SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
  }

  function isAdmin(role){
    return role === ROLES.ADMIN;
  }

  function isAccessAllowed(role){
    return can(role, PERMISSIONS.ACCESS_APP);
  }

  function isValidRole(role){
    return !!ROLE_PERMISSIONS[role];
  }

  window.CRMAccess = Object.freeze({
    ROLES,
    PERMISSIONS,
    normalizeRole,
    can,
    isSuperAdmin,
    isAdmin,
    isAccessAllowed,
    isValidRole
  });
})(window);
