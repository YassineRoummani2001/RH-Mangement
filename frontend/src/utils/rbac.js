// Role-Based Access Control (RBAC) Configurations and Helpers

export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  HR_AGENT: 'HR_AGENT',
  HR_MANAGER: 'HR_MANAGER',
  DEPARTMENT_MANAGER: 'DEPARTMENT_MANAGER',
  INTERIM_MANAGER: 'INTERIM_MANAGER',
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
    [ROLES.HR_AGENT]: [
      PERMISSIONS.VIEW_EMPLOYEES,
      PERMISSIONS.CRUD_EMPLOYEES,
      PERMISSIONS.VIEW_REQUESTS,
      PERMISSIONS.CREATE_REQUEST,
      PERMISSIONS.PROCESS_REQUEST,
    ],
    [ROLES.DEPARTMENT_MANAGER]: [
      PERMISSIONS.VIEW_EMPLOYEES, // Only within department in view
      PERMISSIONS.VIEW_REQUESTS,
      PERMISSIONS.CREATE_REQUEST,
      PERMISSIONS.VALIDATE_REQUEST,
    ],
    [ROLES.INTERIM_MANAGER]: [
      PERMISSIONS.VIEW_EMPLOYEES, // Only within department in view
      PERMISSIONS.VIEW_REQUESTS,
      PERMISSIONS.CREATE_REQUEST,
      PERMISSIONS.VALIDATE_REQUEST,
    ],
    [ROLES.EMPLOYEE]: [
      PERMISSIONS.VIEW_REQUESTS, // Own only
      PERMISSIONS.CREATE_REQUEST,
    ],
  };

  return rolePermissions[role]?.includes(permission) || false;
};

/**
 * Centralized system audit logger. Stores logs locally in localStorage and limits size to 200 items.
 */
export const logSystemActivity = (action, userName, details = '') => {
  try {
    const logs = JSON.parse(localStorage.getItem('system_audit_logs')) || [];
    const newLog = {
      id: `LOG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      action,
      user: userName || 'Système',
      timestamp: new Date().toISOString(),
      details: typeof details === 'object' ? JSON.stringify(details) : details,
    };
    logs.unshift(newLog);
    // Persist only the latest 200 activity records
    localStorage.setItem('system_audit_logs', JSON.stringify(logs.slice(0, 200)));
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
