
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import CustomerDetails from "@/pages/CustomerDetails";
import CustomerDeposit from "@/pages/CustomerDeposit";
import CustomerWithdraw from "@/pages/CustomerWithdraw";
import CustomerTransfer from "@/pages/CustomerTransfer";
import NewCustomer from "@/pages/NewCustomer";
import Transactions from "@/pages/Transactions";
import Ads from "@/pages/Ads";
import Cards from "@/pages/Cards";
import Exchange from "@/pages/Exchange";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Customer routes */}
              <Route path="/customers" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Customers />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/customers/new" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <NewCustomer />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/customers/:id" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CustomerDetails />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/customers/:id/deposit" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CustomerDeposit />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/customers/:id/withdraw" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CustomerWithdraw />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/customers/:id/transfer" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CustomerTransfer />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/transactions" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Transactions />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/ads" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Ads />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/cards" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Cards />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/exchange" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Exchange />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Admin />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* 404 - Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
