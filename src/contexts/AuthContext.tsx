
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

// Define our Employee type
export type Employee = {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: any;
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
        setEmployee(data);
      }
    } catch (error) {
      console.error('Failed to fetch employee data', error);
    }
  };

  // Login function - authenticate with Supabase
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Check if the email exists in the employees table
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single();

      if (employeeError) {
        toast.error("Invalid email or password");
        return false;
      }

      // For now, we'll use simple password check since we don't have Supabase Auth set up yet
      // In a real app, you would use Supabase Auth directly
      if (employeeData && employeeData.password === password) {
        setEmployee({
          id: employeeData.id,
          email: employeeData.email,
          name: employeeData.name,
          role: employeeData.role,
          permissions: employeeData.permissions,
          branch_id: employeeData.branch_id,
          employee_id: employeeData.employee_id
        });
        setIsAuthenticated(true);
        localStorage.setItem("okash-employee", JSON.stringify(employeeData));
        
        toast.success("Login successful");
        return true;
      } else {
        toast.error("Invalid email or password");
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
  const logout = () => {
    setEmployee(null);
    setIsAuthenticated(false);
    setSession(null);
    localStorage.removeItem("okash-employee");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, employee, login, logout, loading, session }}>
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
