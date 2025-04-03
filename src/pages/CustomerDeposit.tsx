
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TransactionForm from '@/components/TransactionForm';

const CustomerDeposit = () => {
  const { id } = useParams<{ id: string }>();

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) throw new Error('Customer ID is required');
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, balance')
        .eq('id', id)
        .maybeSingle(); // Using maybeSingle instead of single to avoid errors

      if (error) {
        console.error("Error fetching customer:", error);
        throw error;
      }
      
      if (!data) throw new Error('Customer not found');
      
      return data;
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading customer details...</div>;
  }

  if (error || !customer) {
    return <div className="text-center py-8 text-red-500">
      {error ? `Error: ${(error as Error).message}` : 'Customer not found'}
    </div>;
  }

  return (
    <TransactionForm
      customerId={customer.id}
      customerName={customer.name}
      balance={customer.balance}
      transactionType="deposit"
    />
  );
};

export default CustomerDeposit;
