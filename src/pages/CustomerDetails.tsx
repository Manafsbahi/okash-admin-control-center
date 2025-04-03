import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Ban, Edit, Printer, Send, Trash, UserMinus, Wallet } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { asId, asUpdatePayload } from "@/utils/supabaseHelpers";

interface CustomerTransaction {
  id: string;
  created_at: string;
  transaction_type: string;
  amount: number;
  status: string;
}

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { employee } = useAuth();
  const [activeTab, setActiveTab] = useState("details");

  const { data: customer, isLoading: customerLoading, error: customerError } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', asId(id as string))
        .single();

      if (error) {
        console.error("Error fetching customer:", error);
        throw error;
      }

      return data;
    }
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['customer-transactions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, created_at, transaction_type, amount, status')
        .or(`source_account_id.eq.${id},destination_account_id.eq.${id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!id
  });

  const handleFreezeAccount = async () => {
    if (!customer || !id) return;
    
    try {
      const { error } = await supabase
        .from('customers')
        .update(asUpdatePayload({ status: 'frozen' }))
        .eq('id', asId(id));
      
      if (error) throw error;
      toast.success("Account has been frozen");
    } catch (error) {
      console.error("Error freezing account:", error);
      toast.error("Failed to freeze account");
    }
  };

  const handleCloseAccount = async () => {
    if (!customer || !id) return;
    
    if (customer.balance !== 0) {
      return toast.error("Cannot close account with non-zero balance");
    }
    
    try {
      const { error } = await supabase
        .from('customers')
        .update(asUpdatePayload({ status: 'closed' }))
        .eq('id', asId(id));
      
      if (error) throw error;
      toast.success("Account has been closed");
      navigate('/customers');
    } catch (error) {
      console.error("Error closing account:", error);
      toast.error("Failed to close account");
    }
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (customerLoading) {
    return <div className="flex justify-center items-center h-64">Loading customer details...</div>;
  }

  if (customerError || !customer) {
    return <div className="text-center py-8 text-red-500">Error loading customer details. Please try again later.</div>;
  }

  const canEditLegalInfo = employee?.role === 'admin' || employee?.permissions?.can_edit_customer === true;
  const canCloseAccount = employee?.role === 'admin' || employee?.permissions?.can_close_account === true;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${
          customer.status === "active"
            ? "bg-green-100 text-green-800"
            : customer.status === "frozen"
            ? "bg-blue-100 text-blue-800"
            : "bg-red-100 text-red-800"
        }`}>
          {customer.status.toUpperCase()}
        </span>
      </div>

      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Customer Details</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="actions">Account Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-200">
                  <div className="py-2 grid grid-cols-3">
                    <dt className="font-medium text-gray-500">Account Number</dt>
                    <dd className="col-span-2">{customer.account_number}</dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="font-medium text-gray-500">Account Type</dt>
                    <dd className="col-span-2 capitalize">{customer.account_type}</dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="font-medium text-gray-500">Name</dt>
                    <dd className="col-span-2">{customer.name}</dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="font-medium text-gray-500">Mother's Name</dt>
                    <dd className="col-span-2">{customer.mother_name || 'N/A'}</dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="font-medium text-gray-500">Date of Birth</dt>
                    <dd className="col-span-2">{formatDate(customer.birthdate)}</dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="font-medium text-gray-500">Gender</dt>
                    <dd className="col-span-2 capitalize">{customer.gender || 'N/A'}</dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="font-medium text-gray-500">Nationality</dt>
                    <dd className="col-span-2">{customer.nationality || 'N/A'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact & ID Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-200">
                  <div className="py-2 grid grid-cols-3">
                    <dt className="font-medium text-gray-500">Phone</dt>
                    <dd className="col-span-2">{customer.phone}</dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="font-medium text-gray-500">Email</dt>
                    <dd className="col-span-2">{customer.email || 'N/A'}</dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="font-medium text-gray-500">Address</dt>
                    <dd className="col-span-2">{customer.address || 'N/A'}</dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="font-medium text-gray-500">ID Type</dt>
                    <dd className="col-span-2 capitalize">{customer.id_type || 'N/A'}</dd>
                  </div>
                  <div className="py-2 grid grid-cols-3">
                    <dt className="font-medium text-gray-500">ID Number</dt>
                    <dd className="col-span-2">{customer.id_number || 'N/A'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {customer.account_type === 'business' && (
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="divide-y divide-gray-200">
                    <div className="py-2 grid grid-cols-3">
                      <dt className="font-medium text-gray-500">Business Name</dt>
                      <dd className="col-span-2">{customer.business_name || 'N/A'}</dd>
                    </div>
                    <div className="py-2 grid grid-cols-3">
                      <dt className="font-medium text-gray-500">Registration Number</dt>
                      <dd className="col-span-2">{customer.business_registration || 'N/A'}</dd>
                    </div>
                    <div className="py-2 grid grid-cols-3">
                      <dt className="font-medium text-gray-500">Business Address</dt>
                      <dd className="col-span-2">{customer.business_address || 'N/A'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Account Balance</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-4xl font-bold mb-6">{customer.balance?.toLocaleString()} SYP</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button className="flex-1" onClick={() => navigate(`/customers/${id}/deposit`)}>
                    <Wallet className="mr-2 h-4 w-4" /> Deposit
                  </Button>
                  <Button className="flex-1" onClick={() => navigate(`/customers/${id}/withdraw`)}>
                    <Wallet className="mr-2 h-4 w-4" /> Withdraw
                  </Button>
                  <Button className="flex-1" onClick={() => navigate(`/customers/${id}/transfer`)}>
                    <Send className="mr-2 h-4 w-4" /> Transfer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transaction History</CardTitle>
              <Button variant="outline" size="sm" onClick={() => toast.info("Generate statement functionality will be implemented soon")}>
                <Printer className="mr-2 h-4 w-4" /> Generate Statement
              </Button>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.created_at)}</TableCell>
                        <TableCell>{transaction.transaction_type}</TableCell>
                        <TableCell className="text-right">{transaction.amount?.toLocaleString()} SYP</TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {transaction.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">No transaction history found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Freeze Account</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Freezing an account will block all deposits, withdrawals, and transfers until the account is unfrozen.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleFreezeAccount}
                    disabled={customer.status !== 'active'}
                  >
                    <Ban className="mr-2 h-4 w-4" /> 
                    {customer.status === 'frozen' ? 'Account is Frozen' : 'Freeze Account'}
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Close Account</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Closing an account is permanent and can only be done if the balance is zero.
                  </p>
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    disabled={customer.balance !== 0 || customer.status === 'closed' || !canCloseAccount}
                    onClick={handleCloseAccount}
                  >
                    <UserMinus className="mr-2 h-4 w-4" /> 
                    {customer.status === 'closed' ? 'Account is Closed' : 'Close Account'}
                  </Button>
                  {customer.balance !== 0 && (
                    <p className="text-red-500 text-xs mt-2">
                      Account balance must be zero before closing
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Legal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Modifying legal information requires proper authorization and all changes will be logged.
                </p>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  disabled={!canEditLegalInfo}
                  onClick={() => navigate(`/customers/${id}/edit`)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Modify Legal Information
                </Button>
                {!canEditLegalInfo && (
                  <p className="text-amber-500 text-xs mt-2">
                    You don't have permission to modify legal information
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetails;
