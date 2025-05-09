
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard,
  Users,
  Repeat,
  MessageSquareText,
  CreditCard as CreditCardIcon, 
  BarChart3,
  Settings,
  LogOut,
  Globe
} from "lucide-react";
import { EmployeeRole, canManageCustomers, canManageTransactions, canManageAds, canManageCards, canManageExchange, canAccessAdmin } from "@/types/roles";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { employee, logout } = useAuth();
  const location = useLocation();

  // Define navigation items with permission checks
  const getNavigationItems = () => [
    {
      label: t("app.dashboard"),
      path: "/dashboard",
      icon: LayoutDashboard,
      permitted: true, // Everyone can access dashboard
    },
    {
      label: t("app.customers"),
      path: "/customers",
      icon: Users,
      permitted: employee ? canManageCustomers(employee.role as EmployeeRole) : false,
    },
    {
      label: t("app.transactions"),
      path: "/transactions",
      icon: Repeat,
      permitted: employee ? canManageTransactions(employee.role as EmployeeRole) : false,
    },
    {
      label: t("app.ads"),
      path: "/ads",
      icon: MessageSquareText,
      permitted: employee ? canManageAds(employee.role as EmployeeRole) : false,
    },
    {
      label: t("app.cards"),
      path: "/cards",
      icon: CreditCardIcon,
      permitted: employee ? canManageCards(employee.role as EmployeeRole) : false,
    },
    {
      label: t("app.exchange"),
      path: "/exchange",
      icon: BarChart3,
      permitted: employee ? canManageExchange(employee.role as EmployeeRole) : false,
    },
    {
      label: t("app.admin"),
      path: "/admin",
      icon: Settings,
      permitted: employee ? canAccessAdmin(employee.role as EmployeeRole) : false,
    },
  ];

  const navigationItems = getNavigationItems().filter(item => item.permitted);

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <div className={`min-h-screen flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Top Navigation */}
      <header className="bg-okash-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">{t("app.name")}</h1>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLanguage} 
              className="text-white hover:text-gray-200"
            >
              <Globe size={20} className="mr-2" />
              {language === "ar" ? "English" : "العربية"}
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout} 
              className="text-white hover:text-gray-200"
            >
              <LogOut size={20} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-okash-secondary text-white shadow-lg">
          <nav className="p-4 flex flex-col h-full">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-okash-accent text-white"
                      : "text-gray-200 hover:bg-okash-primary hover:text-white"
                  }`}
                >
                  <item.icon size={20} className={`${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-okash-primary">
              {employee && (
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-white">{employee.name}</p>
                  <p className="text-xs text-gray-300">{employee.role}</p>
                  {employee.branch_id && (
                    <p className="text-xs text-gray-300">Branch ID: {employee.branch_id}</p>
                  )}
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
