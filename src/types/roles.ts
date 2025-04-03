
// Employee roles as defined in Supabase enum
export type EmployeeRole = "admin" | "manager" | "teller" | "customer_service";

// Helper constants for role comparisons
export const EMPLOYEE_ROLES = {
  ADMIN: "admin" as EmployeeRole,
  MANAGER: "manager" as EmployeeRole,
  TELLER: "teller" as EmployeeRole,
  CUSTOMER_SERVICE: "customer_service" as EmployeeRole,
};

// Permission checking functions
export function canManageCustomers(role: EmployeeRole): boolean {
  return [EMPLOYEE_ROLES.ADMIN, EMPLOYEE_ROLES.MANAGER].includes(role);
}

export function canViewDashboard(role: EmployeeRole): boolean {
  return true; // All roles can view the dashboard
}

export function canManageTransactions(role: EmployeeRole): boolean {
  return [EMPLOYEE_ROLES.ADMIN, EMPLOYEE_ROLES.MANAGER, EMPLOYEE_ROLES.TELLER].includes(role);
}

export function canManageAds(role: EmployeeRole): boolean {
  return [EMPLOYEE_ROLES.ADMIN, EMPLOYEE_ROLES.MANAGER].includes(role);
}

export function canManageCards(role: EmployeeRole): boolean {
  return [EMPLOYEE_ROLES.ADMIN, EMPLOYEE_ROLES.MANAGER].includes(role);
}

export function canManageExchange(role: EmployeeRole): boolean {
  return [EMPLOYEE_ROLES.ADMIN, EMPLOYEE_ROLES.MANAGER].includes(role);
}

export function canAccessAdmin(role: EmployeeRole): boolean {
  return role === EMPLOYEE_ROLES.ADMIN;
}
