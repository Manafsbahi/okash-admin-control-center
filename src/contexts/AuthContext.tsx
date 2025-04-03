
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

// Define the employee role enum to match the database
export enum EmployeeRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TELLER = 'teller',
  CUSTOMER_SERVICE = 'customer_service'
}

// Define our Employee type
export type Employee = {
  id: string;
  email: string;
  name: string;
  role: EmployeeRole;
  permissions: {
    can_create_customer?: boolean;
    can_update_customer?: boolean;
    can_freeze_account?: boolean;
    can_view_all_transactions?: boolean;
    can_close_account?: boolean;
    can_edit_customer?: boolean;
    can_manage_employees?: boolean;
    can_update_exchange_rates?: boolean;
    [key: string]: boolean | undefined;
  };
  branch_id?: string;
  employee_id: string;
};

// Define the auth context type
type AuthContextType = {
  isAuthenticated: boolean;
  employee: Employee | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  session: Session | null;
  refreshEmployeeData: () => Promise<void>;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Check if the user is already authenticated on mount
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setIsAuthenticated(!!currentSession);
        
        // If we have an auth session but no employee data, fetch it
        if (currentSession?.user && !employee) {
          setTimeout(() => {
            fetchEmployeeData(currentSession.user);
          }, 0);
        }
        
        // If no session, clear employee data
        if (!currentSession) {
          setEmployee(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setIsAuthenticated(!!currentSession);

      if (currentSession?.user) {
        fetchEmployeeData(currentSession.user);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch employee data from the employees table
  const fetchEmployeeData = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, email, name, role, permissions, branch_id, employee_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching employee data:', error);
        return;
      }

      if (data) {
        console.log("Fetched employee data:", data);
        
        // Normalize the permissions object
        // FIX: Use type assertion to ensure TypeScript knows these are object types
        const basePermissions = (data.permissions as Record<string, boolean>) || {};
        const adminPermissions = data.role === EmployeeRole.ADMIN ? {
          can_create_customer: true,
          can_update_customer: true,
          can_freeze_account: true,
          can_view_all_transactions: true,
          can_close_account: true,
          can_edit_customer: true
        } : {};
        
        const normalizedPermissions = {
          ...basePermissions,
          ...adminPermissions
        };
        
        setEmployee({
          ...data,
          role: data.role as EmployeeRole,  // Ensure role is cast to our enum
          permissions: normalizedPermissions
        });
      }
    } catch (error) {
      console.error('Failed to fetch employee data', error);
    }
  };
  
  // Function to manually refresh employee data
  const refreshEmployeeData = async () => {
    if (session?.user) {
      await fetchEmployeeData(session.user);
    }
  };

  // Login function - authenticate with Supabase
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Try to sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Authentication error:', authError);
        
        // Let's check if this email exists in the employees table
        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('email', email)
          .single();
        
        if (empError || !empData) {
          toast.error("Invalid email or password");
          return false;
        }
        
        // If email exists but auth failed, the employee exists but might not be registered in auth system
        // WARNING: This is for development only and should be removed in production!
        // In production, you would properly register all employees in the auth system
        if (empData && empData.password === password) {
          console.log("Using dev fallback auth...");
          
          // Normalize the permissions object for admin users
          // FIX: Use type assertion to ensure TypeScript knows these are object types
          const basePermissions = (empData.permissions as Record<string, boolean>) || {};
          const adminPermissions = empData.role === EmployeeRole.ADMIN ? {
            can_create_customer: true,
            can_update_customer: true,
            can_freeze_account: true,
            can_view_all_transactions: true,
            can_close_account: true,
            can_edit_customer: true
          } : {};
          
          const normalizedPermissions = {
            ...basePermissions,
            ...adminPermissions
          };
          
          const employeeData: Employee = {
            id: empData.id,
            email: empData.email,
            name: empData.name,
            role: empData.role as EmployeeRole,  // Ensure role is cast to our enum
            permissions: normalizedPermissions,
            branch_id: empData.branch_id,
            employee_id: empData.employee_id
          };
          
          setEmployee(employeeData);
          setIsAuthenticated(true);
          localStorage.setItem("okash-employee", JSON.stringify(employeeData));
          
          toast.success("Login successful");
          return true;
        } else {
          toast.error("Invalid email or password");
          return false;
        }
      }

      // If Supabase auth succeeded
      if (authData.session) {
        toast.success("Login successful");
        return true;
      } else {
        toast.error("Login failed");
        return false;
      }
      
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setEmployee(null);
      setIsAuthenticated(false);
      setSession(null);
      localStorage.removeItem("okash-employee");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      employee, 
      login, 
      logout, 
      loading, 
      session,
      refreshEmployeeData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
