
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { EmployeeRole, canViewDashboard } from "@/types/roles";
import PermissionCheck from "@/components/customer/PermissionCheck";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: (role: EmployeeRole) => boolean;
}

const ProtectedRoute = ({ children, requiredPermission = canViewDashboard }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, employee } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-okash-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the user has the required permission
  if (employee && requiredPermission && !requiredPermission(employee.role as EmployeeRole)) {
    const permissionError = `You don't have permission to access this page. Your role (${employee.role}) doesn't have the required permissions.`;
    return <PermissionCheck permissionError={permissionError} returnPath="/dashboard" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
