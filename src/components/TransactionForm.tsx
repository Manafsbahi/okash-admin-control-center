import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const transactionSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than zero" }),
  method: z.string().min(1, { message: "Please select a method" }),
  notes: z.string().optional(),
});

interface TransactionFormProps {
  customerId: string;
  customerName: string;
  balance: number;
  transactionType: 'deposit' | 'withdraw' | 'transfer';
  recipientId?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  customerId, 
  customerName, 
  balance,
  transactionType,
  recipientId
}) => {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      method: '',
      notes: '',
    },
  });

  const getMethodOptions = () => {
    switch (transactionType) {
      case 'deposit':
        return [
          { value: 'cash', label: 'Cash' },
          { value: 'bank_transfer', label: 'Bank Transfer' },
          { value: 'check', label: 'Check' },
        ];
      case 'withdraw':
        return [
          { value: 'cash', label: 'Cash' },
          { value: 'bank_transfer', label: 'Bank Transfer' },
          { value: 'check', label: 'Check' },
        ];
      case 'transfer':
        return [
          { value: 'internal', label: 'Internal Transfer' },
          { value: 'external_bank', label: 'External Bank' },
        ];
      default:
        return [];
    }
  };

  const getTitle = () => {
    switch (transactionType) {
      case 'deposit':
        return 'Deposit Funds';
      case 'withdraw':
        return 'Withdraw Funds';
      case 'transfer':
        return 'Transfer Funds';
      default:
        return 'Transaction';
    }
  };

  const onSubmit = async (values: z.infer<typeof transactionSchema>) => {
    if (!employee) {
      toast.error("You need to be logged in to perform this action");
      return;
    }

    if (transactionType === 'withdraw' && values.amount > balance) {
      toast.error("Insufficient funds for withdrawal");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create transaction record
      const transactionData: any = {
        transaction_type: transactionType,
        amount: values.amount,
        performed_by: employee.id,
        status: 'completed',
      };

      // Set source and destination based on transaction type
      if (transactionType === 'withdraw') {
        transactionData.source_account_id = customerId;
        transactionData.withdrawal_method = values.method;
      } else if (transactionType === 'deposit') {
        transactionData.destination_account_id = customerId;
        transactionData.deposit_method = values.method;
      } else if (transactionType === 'transfer') {
        transactionData.source_account_id = customerId;
        
        if (values.method === 'internal' && recipientId) {
          transactionData.destination_account_id = recipientId;
        } else {
          transactionData.external_account = "External Bank Account";
        }
      }

      // Create the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update customer balance
      const updateBalancePromises = [];

      if (transactionType === 'withdraw') {
        updateBalancePromises.push(
          supabase
            .from('customers')
            .update({ balance: balance - values.amount } as any)
            .eq('id', customerId as any)
        );
      } else if (transactionType === 'deposit') {
        updateBalancePromises.push(
          supabase
            .from('customers')
            .update({ balance: balance + values.amount } as any)
            .eq('id', customerId as any)
        );
      } else if (transactionType === 'transfer') {
        // Deduct from source account
        updateBalancePromises.push(
          supabase
            .from('customers')
            .update({ balance: balance - values.amount } as any)
            .eq('id', customerId as any)
        );

        // Add to destination account if internal
        if (values.method === 'internal' && recipientId) {
          const { data: recipient } = await supabase
            .from('customers')
            .select('balance')
            .eq('id', recipientId as any)
            .single();

          if (recipient) {
            updateBalancePromises.push(
              supabase
                .from('customers')
                .update({ balance: (recipient.balance as number) + values.amount } as any)
                .eq('id', recipientId as any)
            );
          }
        }
      }

      // Execute all balance updates
      const updateResults = await Promise.all(updateBalancePromises);
      
      // Check for errors in any of the updates
      const balanceUpdateErrors = updateResults.filter(result => result.error);
      if (balanceUpdateErrors.length > 0) {
        throw new Error("Failed to update account balance");
      }

      toast.success(`${getTitle()} completed successfully`);
      navigate(`/customers/${customerId}`);
    } catch (error) {
      console.error(`Error processing ${transactionType}:`, error);
      toast.error(`Failed to process ${transactionType}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate(`/customers/${customerId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customer
        </Button>
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{getTitle()} for {customerName}</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium">Current Balance: <span className="font-bold">{balance.toLocaleString()} SYP</span></p>
              </div>

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
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{transactionType === 'transfer' ? 'Transfer Type' : 'Method'} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${transactionType === 'transfer' ? 'type' : 'method'}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getMethodOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                disabled={isSubmitting} 
                className="ml-auto"
              >
                {isSubmitting ? 'Processing...' : `Complete ${getTitle()}`}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default TransactionForm;
