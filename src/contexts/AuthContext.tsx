
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";

// Define our Employee type
export type Employee = {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  branch?: string;
};

// Define the auth context type
type AuthContextType = {
  isAuthenticated: boolean;
  employee: Employee | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock employee data - in a real app, this would come from Supabase
const mockEmployees: Employee[] = [
  {
    id: "7000001",
    email: "admin@okash.com",
    name: "Admin User",
    role: "Super Admin",
    permissions: ["all"],
  },
  {
    id: "7000002",
    email: "manager@okash.com",
    name: "Branch Manager",
    role: "Branch Manager",
    permissions: ["customers.view", "customers.edit", "transactions.view"],
    branch: "Damascus",
  },
];

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if the user is already authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedEmployee = localStorage.getItem("okash-employee");
      
      if (storedEmployee) {
        try {
          const parsedEmployee = JSON.parse(storedEmployee);
          setEmployee(parsedEmployee);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to parse employee data", error);
          localStorage.removeItem("okash-employee");
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function - in a real app, this would authenticate with Supabase
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication - find employee by email
      const foundEmployee = mockEmployees.find(emp => emp.email === email);
      
      if (foundEmployee && password === "password") { // Mock password check
        setEmployee(foundEmployee);
        setIsAuthenticated(true);
        localStorage.setItem("okash-employee", JSON.stringify(foundEmployee));
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
    localStorage.removeItem("okash-employee");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, employee, login, logout, loading }}>
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
