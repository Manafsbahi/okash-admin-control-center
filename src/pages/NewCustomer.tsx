
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeRole } from "@/contexts/AuthContext";
import { generateAccountNumber } from "@/utils/accountUtils";
import { personalAccountSchema, businessAccountSchema } from "@/schemas/customerSchemas";
import PersonalAccountForm from "@/components/customer/PersonalAccountForm";
import BusinessAccountForm from "@/components/customer/BusinessAccountForm";
import PermissionCheck from "@/components/customer/PermissionCheck";

const NewCustomer = () => {
  const navigate = useNavigate();
  const { employee, refreshEmployeeData } = useAuth();
  const [accountType, setAccountType] = useState<"personal" | "business">("personal");
  const [loading, setLoading] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Checking customer creation permissions...");
    console.log("Current employee data:", employee);
    
    const updateEmployeeData = async () => {
      try {
        await refreshEmployeeData();
      } catch (error) {
        console.error("Failed to refresh employee data:", error);
      }
    };
    
    updateEmployeeData();
    
    if (!employee) {
      setPermissionError("Employee data not loaded. Please try refreshing the page.");
      return;
    }
    
    const hasPermission = 
      employee.role === EmployeeRole.ADMIN || 
      employee.role === EmployeeRole.MANAGER ||
      (employee.permissions && employee.permissions.can_create_customer === true);
    
    if (!hasPermission) {
      console.log("Permission denied. Role:", employee.role, "Permissions:", employee.permissions);
      setPermissionError("You don't have permission to create new customers");
      toast.error("You don't have permission to create new customers");
      setTimeout(() => navigate('/customers'), 3000);
    }
  }, [employee, navigate, refreshEmployeeData]);

  const onPersonalSubmit = async (values: z.infer<typeof personalAccountSchema>) => {
    try {
      setLoading(true);
      const accountNumber = generateAccountNumber("personal");
      
      if (!employee || !employee.id) {
        toast.error("Employee information not available");
        return;
      }
      
      const { error } = await supabase.from('customers').insert({
        name: values.name,
        phone: values.phone,
        password: values.password,
        email: values.email || null,
        mother_name: values.mother_name || null,
        birthdate: values.birthdate || null,
        gender: values.gender || null,
        nationality: values.nationality || null,
        id_type: values.id_type || null,
        id_number: values.id_number || null,
        address: values.address || null,
        account_number: accountNumber,
        account_type: "personal",
        status: 'active',
        balance: 0,
        created_by: employee.id
      });
      
      if (error) throw error;
      
      toast.success("Personal account created successfully");
      navigate('/customers');
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const onBusinessSubmit = async (values: z.infer<typeof businessAccountSchema>) => {
    try {
      setLoading(true);
      const accountNumber = generateAccountNumber("business");
      
      if (!employee || !employee.id) {
        toast.error("Employee information not available");
        return;
      }
      
      const { error } = await supabase.from('customers').insert({
        name: values.name,
        phone: values.phone,
        password: values.password,
        email: values.email || null,
        mother_name: values.mother_name || null,
        birthdate: values.birthdate || null,
        gender: values.gender || null,
        nationality: values.nationality || null,
        id_type: values.id_type || null,
        id_number: values.id_number || null,
        address: values.address || null,
        business_name: values.business_name,
        business_registration: values.business_registration,
        business_address: values.business_address,
        account_number: accountNumber,
        account_type: "business",
        status: 'active',
        balance: 0,
        created_by: employee.id
      });
      
      if (error) throw error;
      
      toast.success("Business account created successfully");
      navigate('/customers');
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PermissionCheck permissionError={permissionError} />
      {!permissionError && (
        <>
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate('/customers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
            <h1 className="text-2xl font-bold">Create New Customer</h1>
          </div>

          <Tabs value={accountType} onValueChange={(value) => setAccountType(value as "personal" | "business")}>
            <TabsList className="mb-6">
              <TabsTrigger value="personal">Personal Account</TabsTrigger>
              <TabsTrigger value="business">Business Account</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <PersonalAccountForm onSubmit={onPersonalSubmit} loading={loading} />
            </TabsContent>

            <TabsContent value="business">
              <BusinessAccountForm onSubmit={onBusinessSubmit} loading={loading} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default NewCustomer;
