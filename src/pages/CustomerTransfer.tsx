
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const transferSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than zero" }),
  transferType: z.enum(['internal', 'external']),
  recipientAccount: z.string().min(1, { message: "Recipient account is required" }),
  notes: z.string().optional(),
});

const CustomerTransfer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employee } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recipientDetails, setRecipientDetails] = useState<any>(null);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, balance')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      amount: 0,
      transferType: 'internal',
      recipientAccount: '',
      notes: '',
    },
  });

  const searchRecipient = async () => {
    if (!searchQuery) {
      toast.error("Please enter an account number");
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, account_number, status')
        .eq('account_number', searchQuery)
        .single();

      if (error) {
        toast.error("Recipient account not found");
        setRecipientDetails(null);
        return;
      }

      if (data.id === id) {
        toast.error("Cannot transfer to the same account");
        setRecipientDetails(null);
        return;
      }

      if (data.status !== 'active') {
        toast.error(`Cannot transfer to ${data.status} account`);
        setRecipientDetails(null);
        return;
      }

      setRecipientDetails(data);
      form.setValue('recipientAccount', data.id);
      toast.success("Recipient account found");
    } catch (error) {
      console.error("Error searching for recipient:", error);
      toast.error("Failed to search for recipient");
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof transferSchema>) => {
    if (!customer || !employee) return;

    if (values.amount > customer.balance) {
      toast.error("Insufficient funds for transfer");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create transaction record
      const transactionData: any = {
        transaction_type: 'transfer',
        amount: values.amount,
        performed_by: employee.id,
        source_account_id: customer.id,
        status: 'completed',
      };

      // Set destination based on transfer type
      if (values.transferType === 'internal' && recipientDetails) {
        transactionData.destination_account_id = recipientDetails.id;
      } else {
        transactionData.external_account = values.recipientAccount;
      }

      // Create the transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData);

      if (transactionError) throw transactionError;

      // Update source account balance (deduct)
      const { error: sourceError } = await supabase
        .from('customers')
        .update({ balance: customer.balance - values.amount })
        .eq('id', customer.id);

      if (sourceError) throw sourceError;

      // If internal transfer, update destination account balance (add)
      if (values.transferType === 'internal' && recipientDetails) {
        // Get current balance of recipient
        const { data: recipient } = await supabase
          .from('customers')
          .select('balance')
          .eq('id', recipientDetails.id)
          .single();

        if (recipient) {
          const { error: destError } = await supabase
            .from('customers')
            .update({ balance: recipient.balance + values.amount })
            .eq('id', recipientDetails.id);

          if (destError) throw destError;
        }
      }

      toast.success("Transfer completed successfully");
      navigate(`/customers/${customer.id}`);
    } catch (error) {
      console.error("Error processing transfer:", error);
      toast.error("Failed to process transfer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="text-center py-8 text-red-500">Customer not found</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate(`/customers/${customer.id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customer
        </Button>
        <h1 className="text-2xl font-bold">Transfer Funds</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Funds from {customer.name}</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium">Current Balance: <span className="font-bold">{customer.balance.toLocaleString()} SYP</span></p>
              </div>

              <FormField
                control={form.control}
                name="transferType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Type *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset recipient data when changing transfer type
                        setRecipientDetails(null);
                        form.setValue('recipientAccount', '');
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transfer type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="internal">Internal Transfer (OKash account)</SelectItem>
                        <SelectItem value="external">External Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('transferType') === 'internal' ? (
                <div>
                  <FormLabel>Recipient Account Number *</FormLabel>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Enter account number"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={searchRecipient}
                      disabled={isSearching}
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                      {!isSearching && <Search className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>

                  {recipientDetails && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="font-medium">Recipient: {recipientDetails.name}</p>
                      <p className="text-sm">Account: {recipientDetails.account_number}</p>
                    </div>
                  )}

                  <input 
                    type="hidden" 
                    {...form.register('recipientAccount')} 
                  />
                  {form.formState.errors.recipientAccount && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.recipientAccount.message}</p>
                  )}
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="recipientAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External Account Details *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter bank account details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (SYP) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter amount" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional notes (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting || (form.watch('transferType') === 'internal' && !recipientDetails)} 
                className="ml-auto"
              >
                {isSubmitting ? 'Processing...' : 'Complete Transfer'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CustomerTransfer;
