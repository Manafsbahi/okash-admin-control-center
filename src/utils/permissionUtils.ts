
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeRole, canManageCustomers } from "@/types/roles";

export function useCustomerPermissions() {
  const { employee } = useAuth();
  
  const hasCreatePermission = (): boolean => {
    if (!employee) return false;
    return canManageCustomers(employee.role as EmployeeRole);
  };
  
  const hasViewPermission = (): boolean => {
    if (!employee) return false;
    return canManageCustomers(employee.role as EmployeeRole);
  };
  
  const hasEditPermission = (): boolean => {
    if (!employee) return false;
    return canManageCustomers(employee.role as EmployeeRole);
  };
  
  const checkPermission = (operation: 'create' | 'view' | 'edit'): { allowed: boolean; error: string | null } => {
    switch (operation) {
      case 'create':
        return {
          allowed: hasCreatePermission(),
          error: hasCreatePermission() ? null : "You don't have permission to create new customers."
        };
      case 'view':
        return {
          allowed: hasViewPermission(),
          error: hasViewPermission() ? null : "You don't have permission to view customer details."
        };
      case 'edit':
        return {
          allowed: hasEditPermission(),
          error: hasEditPermission() ? null : "You don't have permission to edit customers."
        };
      default:
        return { allowed: false, error: "Unknown operation" };
    }
  };
  
  return {
    hasCreatePermission,
    hasViewPermission,
    hasEditPermission,
    checkPermission
  };
}
