
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, UserPlus, Eye, ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { EmployeeRole } from "@/contexts/AuthContext";

const Customers = () => {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();
  const { employee } = useAuth();

  const fetchCustomers = async () => {
    console.log("Fetching customers...");
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, account_type, balance, status, created_at, account_number');

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }

      console.log("Customers fetched:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      throw error;
    }
  };

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.account_number.includes(searchQuery)
  );

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'balance') {
      comparison = a.balance - b.balance;
    } else if (sortBy === 'account_number') {
      comparison = a.account_number.localeCompare(b.account_number);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleNewCustomer = () => {
    // Check if employee has permission to create customers
    if (employee?.role === EmployeeRole.ADMIN || 
        employee?.role === EmployeeRole.MANAGER ||
        employee?.permissions?.can_create_customer) {
      navigate('/customers/new');
    } else {
      console.log("Permission denied. Role:", employee?.role, "Permissions:", employee?.permissions);
      toast.error("You don't have permission to create new customers");
    }
  };

  // For debugging - log employee data
  React.useEffect(() => {
    console.log("Current employee data:", employee);
  }, [employee]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">{t("app.customers")}</h1>
        
        <Button 
          className="bg-okash-accent hover:bg-okash-secondary"
          onClick={handleNewCustomer}
        >
          <UserPlus className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
          New Customer
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("app.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading customers. Please try again later.
              {error instanceof Error && <div className="mt-2 text-sm">{error.message}</div>}
            </div>
          ) : sortedCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('account_number')}
                    >
                      Account Number
                      {sortBy === 'account_number' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Name
                      {sortBy === 'name' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead 
                      className="text-right cursor-pointer"
                      onClick={() => handleSort('balance')}
                    >
                      Balance (SYP)
                      {sortBy === 'balance' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/50">
                      <TableCell>{customer.account_number}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell className="capitalize">{customer.account_type}</TableCell>
                      <TableCell className="text-right">
                        {customer.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            customer.status === "active"
                              ? "bg-green-100 text-green-800"
                              : customer.status === "frozen"
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/customers/${customer.id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchQuery
                ? t("app.no.customers.found")
                : t("app.no.customers")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
