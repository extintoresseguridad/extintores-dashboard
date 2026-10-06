(function(window){
  'use strict';

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

  function normalizeRole(email, role){
    const e = (email || '').trim().toLowerCase();
    if(e && e === (SUPER_ADMIN_EMAIL || '').trim().toLowerCase()) return ROLES.ADMIN;
    if(e && e === (ADMIN_CONTACT_EMAIL || '').trim().toLowerCase()) return ROLES.APPROVED;
    return ROLE_PERMISSIONS[role] ? role : ROLES.PENDING;
  }

  function can(role, permission){
    return !!(ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role].includes(permission));
  }

  function isSuperAdmin(email){
    return (email || '').trim().toLowerCase() === (SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
  }

  function isAdmin(role, email){
    return role === ROLES.ADMIN && isSuperAdmin(email);
  }

  function isAccessAllowed(role){
    return can(role, PERMISSIONS.ACCESS_APP);
  }

  window.CRMAccess = Object.freeze({
    ROLES,
    PERMISSIONS,
    normalizeRole,
    can,
    isSuperAdmin,
    isAdmin,
    isAccessAllowed
  });
})(window);
