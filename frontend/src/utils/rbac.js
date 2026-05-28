// Role-Based Access Control (RBAC) Configurations and Helpers
import api from '../services/api';

export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  HR_AGENT: 'HR_AGENT',
  HR_MANAGER: 'HR_MANAGER',
  DEPARTMENT_MANAGER: 'DEPARTMENT_MANAGER',
  INTERIM_MANAGER: 'INTERIM_MANAGER',
  SECRETARY_GENERAL: 'SECRETARY_GENERAL', // NEW: Secrétaire Générale
};

// Expose full permission keys
export const PERMISSIONS = {
  VIEW_EMPLOYEES: 'VIEW_EMPLOYEES',
  CRUD_EMPLOYEES: 'CRUD_EMPLOYEES',
  VIEW_REQUESTS: 'VIEW_REQUESTS',
  CREATE_REQUEST: 'CREATE_REQUEST',
  VALIDATE_REQUEST: 'VALIDATE_REQUEST',
  PROCESS_REQUEST: 'PROCESS_REQUEST',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',
  MANAGE_HR: 'MANAGE_HR',
  // NEW permissions
  SIGN_DOCUMENTS: 'SIGN_DOCUMENTS',
  VIEW_ATTESTATIONS: 'VIEW_ATTESTATIONS',
  GENERATE_ATTESTATIONS: 'GENERATE_ATTESTATIONS',
  MANAGE_TRAININGS: 'MANAGE_TRAININGS',
  VIEW_TRAININGS: 'VIEW_TRAININGS',
  MANAGE_ABSENCES: 'MANAGE_ABSENCES',
  VIEW_ABSENCES: 'VIEW_ABSENCES',
  MANAGE_ASSIGNMENTS: 'MANAGE_ASSIGNMENTS',
  VIEW_AUTHORIZATIONS: 'VIEW_AUTHORIZATIONS',
  CREATE_AUTHORIZATION: 'CREATE_AUTHORIZATION',
  VALIDATE_AUTHORIZATION: 'VALIDATE_AUTHORIZATION',
};

/**
 * Returns the effective role of a user, automatically applying interim role expiration logic.
 */
export const getEffectiveRole = (user) => {
  if (!user) return null;
  
  if (user.role === ROLES.INTERIM_MANAGER) {
    // If interimUntil date is defined and expired, automatically downgrade to standard EMPLOYEE
    if (user.interimUntil) {
      const expiryDate = new Date(user.interimUntil);
      if (expiryDate < new Date()) {
        return ROLES.EMPLOYEE;
      }
    }
  }
  
  return user.role;
};

/**
 * Evaluates whether a user is authorized for a specific permission.
 */
export const hasPermission = (user, permission) => {
  const role = getEffectiveRole(user);
  if (!role) return false;

  // HR_MANAGER has complete, absolute administrative permission
  if (role === ROLES.HR_MANAGER) {
    return true;
  }

  const rolePermissions = {
    [ROLES.SECRETARY_GENERAL]: [
      PERMISSIONS.VIEW_ATTESTATIONS,
      PERMISSIONS.SIGN_DOCUMENTS,
      PERMISSIONS.VIEW_REQUESTS,
      PERMISSIONS.VIEW_AUTHORIZATIONS,
    ],
    [ROLES.HR_AGENT]: [
      PERMISSIONS.VIEW_EMPLOYEES,
      PERMISSIONS.CRUD_EMPLOYEES,
      PERMISSIONS.VIEW_REQUESTS,
      PERMISSIONS.CREATE_REQUEST,
      PERMISSIONS.PROCESS_REQUEST,
      PERMISSIONS.VIEW_ATTESTATIONS,
      PERMISSIONS.GENERATE_ATTESTATIONS,
      PERMISSIONS.MANAGE_TRAININGS,
      PERMISSIONS.VIEW_TRAININGS,
      PERMISSIONS.MANAGE_ABSENCES,
      PERMISSIONS.VIEW_ABSENCES,
      PERMISSIONS.MANAGE_ASSIGNMENTS,
      PERMISSIONS.VIEW_AUTHORIZATIONS,
      PERMISSIONS.VALIDATE_AUTHORIZATION,
    ],
    [ROLES.DEPARTMENT_MANAGER]: [
      PERMISSIONS.VIEW_EMPLOYEES,
      PERMISSIONS.VIEW_REQUESTS,
      PERMISSIONS.CREATE_REQUEST,
      PERMISSIONS.VALIDATE_REQUEST,
      PERMISSIONS.VIEW_TRAININGS,
      PERMISSIONS.VIEW_ABSENCES,
      PERMISSIONS.MANAGE_ABSENCES,
      PERMISSIONS.VIEW_AUTHORIZATIONS,
      PERMISSIONS.VALIDATE_AUTHORIZATION,
      PERMISSIONS.CREATE_AUTHORIZATION,
    ],
    [ROLES.INTERIM_MANAGER]: [
      PERMISSIONS.VIEW_EMPLOYEES,
      PERMISSIONS.VIEW_REQUESTS,
      PERMISSIONS.CREATE_REQUEST,
      PERMISSIONS.VALIDATE_REQUEST,
      PERMISSIONS.VIEW_TRAININGS,
      PERMISSIONS.VIEW_ABSENCES,
      PERMISSIONS.MANAGE_ABSENCES,
      PERMISSIONS.VIEW_AUTHORIZATIONS,
      PERMISSIONS.VALIDATE_AUTHORIZATION,
      PERMISSIONS.CREATE_AUTHORIZATION,
    ],
    [ROLES.EMPLOYEE]: [
      PERMISSIONS.VIEW_REQUESTS,
      PERMISSIONS.CREATE_REQUEST,
      PERMISSIONS.VIEW_ATTESTATIONS,
      PERMISSIONS.VIEW_TRAININGS,
      PERMISSIONS.VIEW_AUTHORIZATIONS,
      PERMISSIONS.CREATE_AUTHORIZATION,
    ],
  };

  return rolePermissions[role]?.includes(permission) || false;
};

/**
 * Centralized system audit logger. Stores logs locally in localStorage and limits size to 200 items.
 */
export const logSystemActivity = async (action, userName, details = '') => {
  try {
    const detailStr = typeof details === 'object' ? JSON.stringify(details) : details;
    
    // 1. Fallback to localStorage for instant local audits
    const logs = JSON.parse(localStorage.getItem('system_audit_logs')) || [];
    const newLog = {
      id: `LOG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      action,
      user: userName || 'Système',
      timestamp: new Date().toISOString(),
      details: detailStr,
    };
    logs.unshift(newLog);
    localStorage.setItem('system_audit_logs', JSON.stringify(logs.slice(0, 200)));

    // 2. Persist directly to Symfony backend database asynchronously
    await api.post('/audit-logs', {
      action,
      user: userName || 'Système',
      details: detailStr
    });
  } catch (error) {
    console.error('Audit Logger Error:', error);
  }
};

/**
 * Triggers state-persisted notifications for actions in request workflow.
 */
export const triggerWorkflowNotification = (recipientName, title, message, type = 'info') => {
  try {
    const notifs = JSON.parse(localStorage.getItem('user_notifications')) || [];
    const newNotif = {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      recipientName,
      title,
      message,
      time: 'À l\'instant',
      timestamp: new Date().toISOString(),
      type,
      unread: true,
    };
    notifs.unshift(newNotif);
    localStorage.setItem('user_notifications', JSON.stringify(notifs));
  } catch (error) {
    console.error('Notification Trigger Error:', error);
  }
};

/**
 * Get human-readable role label in French
 */
export const getRoleLabel = (role) => {
  const labels = {
    [ROLES.HR_MANAGER]: 'Administrateur RH',
    [ROLES.HR_AGENT]: 'Agent RH',
    [ROLES.DEPARTMENT_MANAGER]: 'Chef de Service',
    [ROLES.INTERIM_MANAGER]: 'Chef de Service (Intérim)',
    [ROLES.EMPLOYEE]: 'Employé',
    [ROLES.SECRETARY_GENERAL]: 'Secrétaire Générale',
  };
  return labels[role] || 'Collaborateur';
};
